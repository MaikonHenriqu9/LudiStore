from catalogo.models import Marca
from catalogo.repositories import MarcaRepository
from catalogo.services.cadastro_simples_service import CadastroSimplesService


class MarcaService(CadastroSimplesService):
    modelo = Marca
    repository_class = MarcaRepository
    nome_entidade = 'Marca'
