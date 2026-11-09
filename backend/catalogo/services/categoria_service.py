from catalogo.models import Categoria
from catalogo.repositories import CategoriaRepository


class CategoriaService:
    def __init__(self):
        self.repository = CategoriaRepository()

    def listar(self):
        return self.repository.listar_ativas()

    def buscar(self, categoria_id):
        categoria = self.repository.buscar_por_id(categoria_id)

        if categoria is None or not categoria.ativo:
            raise LookupError('Categoria não encontrada.')

        return categoria

    def criar(self, dados):
        nome = dados['nome'].strip()

        if self.repository.existe_nome(nome):
            raise ValueError('Categoria já cadastrada.')

        return self.repository.salvar(Categoria(nome=nome))

    def atualizar(self, categoria_id, dados):
        categoria = self.buscar(categoria_id)
        nome = dados['nome'].strip()

        if self.repository.existe_nome(nome, ignorar_id=categoria_id):
            raise ValueError('Categoria já cadastrada.')

        categoria.nome = nome
        return self.repository.salvar(categoria)

    def desativar(self, categoria_id):
        categoria = self.buscar(categoria_id)
        categoria.ativo = False
        self.repository.salvar(categoria)