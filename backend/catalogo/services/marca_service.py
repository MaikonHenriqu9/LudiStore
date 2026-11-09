from catalogo.models import Marca
from catalogo.repositories import MarcaRepository


class MarcaService:
    def __init__(self):
        self.repository = MarcaRepository()

    def listar(self):
        return self.repository.listar_ativas()

    def buscar(self, marca_id):
        marca = self.repository.buscar_por_id(marca_id)

        if marca is None or not marca.ativo:
            raise LookupError('Marca não encontrada.')

        return marca

    def criar(self, dados):
        nome = dados['nome'].strip()

        if self.repository.existe_nome(nome):
            raise ValueError('Marca já cadastrada.')

        return self.repository.salvar(Marca(nome=nome))

    def atualizar(self, marca_id, dados):
        marca = self.buscar(marca_id)
        nome = dados['nome'].strip()

        if self.repository.existe_nome(nome, ignorar_id=marca_id):
            raise ValueError('Marca já cadastrada.')

        marca.nome = nome
        return self.repository.salvar(marca)

    def desativar(self, marca_id):
        marca = self.buscar(marca_id)
        marca.ativo = False
        self.repository.salvar(marca)