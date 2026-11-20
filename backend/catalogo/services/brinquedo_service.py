from django.db import transaction

from catalogo.models import Brinquedo
from catalogo.repositories import BrinquedoRepository, CategoriaRepository, MarcaRepository
from catalogo.strategies import (
    OrdenarPorMaiorPreco,
    OrdenarPorMaisRecentes,
    OrdenarPorMenorPreco,
    OrdenarPorNome,
)
from core import LoggerSistema, NaoEncontradoError, RegraDeNegocioError
from usuarios.models import Usuario
from usuarios.repositories import UsuarioRepository
from usuarios.seguranca import exigir_dono_ou_admin


class BrinquedoService:

    ESTRATEGIAS_ORDENACAO = {
        'nome': OrdenarPorNome(),
        'menor_preco': OrdenarPorMenorPreco(),
        'maior_preco': OrdenarPorMaiorPreco(),
        'recentes': OrdenarPorMaisRecentes(),
    }

    def __init__(self):
        self.repository = BrinquedoRepository()
        self.marca_repository = MarcaRepository()
        self.categoria_repository = CategoriaRepository()
        self.usuario_repository = UsuarioRepository()
        self.logger = LoggerSistema()

    def listar(self, ordem):
        estrategia = self.ESTRATEGIAS_ORDENACAO.get(ordem)

        if estrategia is None:
            raise RegraDeNegocioError('Ordenação inválida. Use: nome, menor_preco, maior_preco ou recentes.')

        return estrategia.ordenar(self.repository.listar_ativos())

    def buscar(self, brinquedo_id, incluir_inativos=False):
        brinquedo = self.repository.buscar_por_id(brinquedo_id)

        if brinquedo is None or (not brinquedo.ativo and not incluir_inativos):
            raise NaoEncontradoError('Brinquedo não encontrado.')

        return brinquedo

    @transaction.atomic
    def criar(self, dados):
        if dados['preco'] <= 0:
            raise RegraDeNegocioError('O preço deve ser maior que zero.')

        if self.repository.existe_sku(dados['sku']):
            raise RegraDeNegocioError('SKU já cadastrado.')

        vendedor_id = dados.pop('vendedor_id', None)
        if vendedor_id is None:
            raise RegraDeNegocioError('Informe o vendedor_id.')

        vendedor = self.usuario_repository.buscar_por_id(vendedor_id)
        perfis_que_vendem = (Usuario.Perfil.VENDEDOR, Usuario.Perfil.ADMIN)
        if vendedor is None or not vendedor.ativo or vendedor.perfil not in perfis_que_vendem:
            raise RegraDeNegocioError('Vendedor inválido.')

        marca = self.marca_repository.buscar_por_id(dados.pop('marca_id'))
        if marca is None or not marca.ativo:
            raise RegraDeNegocioError('Marca inválida.')

        categorias_ids = set(dados.pop('categorias_ids'))
        categorias = self.categoria_repository.buscar_ativas_por_ids(categorias_ids)
        if len(categorias) != len(categorias_ids):
            raise RegraDeNegocioError('Uma ou mais categorias são inválidas.')

        brinquedo = self.repository.salvar(Brinquedo(**dados, marca=marca, vendedor=vendedor))
        brinquedo.categorias.set(categorias)

        self.logger.info(f'Brinquedo cadastrado: {brinquedo.nome} (SKU {brinquedo.sku}) por {vendedor.nome}')
        return brinquedo

    @transaction.atomic
    def atualizar(self, brinquedo_id, dados, solicitante=None):
        brinquedo = self.buscar(brinquedo_id)
        self._exigir_dono(brinquedo, solicitante)

        if 'preco' in dados and dados['preco'] <= 0:
            raise RegraDeNegocioError('O preço deve ser maior que zero.')

        if 'sku' in dados and self.repository.existe_sku_em_outro_brinquedo(dados['sku'], brinquedo_id):
            raise RegraDeNegocioError('SKU já cadastrado.')

        if 'marca_id' in dados:
            marca = self.marca_repository.buscar_por_id(dados.pop('marca_id'))
            if marca is None or not marca.ativo:
                raise RegraDeNegocioError('Marca inválida.')
            brinquedo.marca = marca

        categorias = None
        if 'categorias_ids' in dados:
            categorias_ids = set(dados.pop('categorias_ids'))
            categorias = self.categoria_repository.buscar_ativas_por_ids(categorias_ids)
            if len(categorias) != len(categorias_ids):
                raise RegraDeNegocioError('Uma ou mais categorias são inválidas.')

        for campo, valor in dados.items():
            setattr(brinquedo, campo, valor)

        brinquedo = self.repository.salvar(brinquedo)

        if categorias is not None:
            brinquedo.categorias.set(categorias)

        self.logger.info(f'Brinquedo atualizado: id={brinquedo.pk}')
        return brinquedo

    def listar_do_vendedor(self, vendedor_id):
        return self.repository.listar_por_vendedor(vendedor_id)

    def desativar(self, brinquedo_id, solicitante=None):
        brinquedo = self.buscar(brinquedo_id)
        self._exigir_dono(brinquedo, solicitante)
        brinquedo.ativo = False
        self.repository.salvar(brinquedo)
        self.logger.info(f'Brinquedo desativado: id={brinquedo.pk}')

    def reativar(self, brinquedo_id, solicitante=None):
        brinquedo = self.buscar(brinquedo_id, incluir_inativos=True)
        self._exigir_dono(brinquedo, solicitante)

        if brinquedo.ativo:
            raise RegraDeNegocioError('Brinquedo já está ativo.')

        brinquedo.ativo = True
        brinquedo = self.repository.salvar(brinquedo)
        self.logger.info(f'Brinquedo reativado: id={brinquedo.pk}')
        return brinquedo

    def _exigir_dono(self, brinquedo, solicitante):
        # RN03: o vendedor só altera os próprios brinquedos (o admin altera qualquer um).
        # solicitante=None é uso interno (ex.: popular_banco), sem usuário logado.
        if solicitante is not None:
            exigir_dono_ou_admin(solicitante, brinquedo.vendedor_id, 'Você só pode alterar os próprios brinquedos.')
