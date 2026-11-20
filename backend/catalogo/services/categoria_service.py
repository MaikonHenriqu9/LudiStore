from catalogo.models import Categoria
from catalogo.repositories import CategoriaRepository
from catalogo.services.cadastro_simples_service import CadastroSimplesService


class CategoriaService(CadastroSimplesService):
    modelo = Categoria
    repository_class = CategoriaRepository
    nome_entidade = 'Categoria'
