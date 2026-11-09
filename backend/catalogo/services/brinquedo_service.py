from django.db import transaction

from catalogo.models import Brinquedo
from catalogo.repositories import BrinquedoRepository, CategoriaRepository, MarcaRepository
from catalogo.strategies import (
    OrdenarPorMaiorPreco,
    OrdenarPorMaisRecentes,
    OrdenarPorMenorPreco,
    OrdenarPorNome,
)
from usuarios.models import Usuario
from usuarios.repositories import UsuarioRepository


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

    def listar(self, ordem):
        estrategia = self.ESTRATEGIAS_ORDENACAO.get(ordem)

        if estrategia is None:
            raise ValueError('Ordenação inválida. Use: nome, menor_preco, maior_preco ou recentes.')

        return estrategia.ordenar(self.repository.listar_ativos())

    def buscar(self, brinquedo_id):
        brinquedo = self.repository.buscar_por_id(brinquedo_id)

        if brinquedo is None or not brinquedo.ativo:
            raise LookupError('Brinquedo não encontrado.')

        return brinquedo

    @transaction.atomic
    def criar(self, dados):
        if dados['preco'] <= 0:
            raise ValueError('O preço deve ser maior que zero.')

        if self.repository.existe_sku(dados['sku']):
            raise ValueError('SKU já cadastrado.')

        vendedor = self.usuario_repository.buscar_por_id(dados.pop('vendedor_id'))
        perfis_que_vendem = (Usuario.Perfil.VENDEDOR, Usuario.Perfil.ADMIN)
        if vendedor is None or not vendedor.ativo or vendedor.perfil not in perfis_que_vendem:
            raise ValueError('Vendedor inválido.')

        marca = self.marca_repository.buscar_por_id(dados.pop('marca_id'))
        if marca is None or not marca.ativo:
            raise ValueError('Marca inválida.')

        categorias_ids = set(dados.pop('categorias_ids'))
        categorias = self.categoria_repository.buscar_ativas_por_ids(categorias_ids)
        if len(categorias) != len(categorias_ids):
            raise ValueError('Uma ou mais categorias são inválidas.')

        brinquedo = self.repository.salvar(Brinquedo(**dados, marca=marca, vendedor=vendedor))
        brinquedo.categorias.set(categorias)

        return brinquedo

    @transaction.atomic
    def atualizar(self, brinquedo_id, dados):
        brinquedo = self.buscar(brinquedo_id)

        if 'preco' in dados and dados['preco'] <= 0:
            raise ValueError('O preço deve ser maior que zero.')

        if 'sku' in dados and self.repository.existe_sku_em_outro_brinquedo(dados['sku'], brinquedo_id):
            raise ValueError('SKU já cadastrado.')

        if 'marca_id' in dados:
            marca = self.marca_repository.buscar_por_id(dados.pop('marca_id'))
            if marca is None or not marca.ativo:
                raise ValueError('Marca inválida.')
            brinquedo.marca = marca

        categorias = None
        if 'categorias_ids' in dados:
            categorias_ids = set(dados.pop('categorias_ids'))
            categorias = self.categoria_repository.buscar_ativas_por_ids(categorias_ids)
            if len(categorias) != len(categorias_ids):
                raise ValueError('Uma ou mais categorias são inválidas.')

        for campo, valor in dados.items():
            setattr(brinquedo, campo, valor)

        brinquedo = self.repository.salvar(brinquedo)

        if categorias is not None:
            brinquedo.categorias.set(categorias)

        return brinquedo

    def desativar(self, brinquedo_id):
        brinquedo = self.buscar(brinquedo_id)
        brinquedo.ativo = False
        self.repository.salvar(brinquedo)
