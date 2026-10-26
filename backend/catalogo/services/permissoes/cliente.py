from .base import PermissaoStrategy


class ClientePermissao(PermissaoStrategy):
    def pode_visualizar(self, usuario, brinquedo):
        return brinquedo.ativo

    def pode_criar(self, usuario):
        return False

    def pode_editar(self, usuario, brinquedo):
        return False

    def pode_excluir(self, usuario, brinquedo):
        return False

    def brinquedos_gerenciaveis(self, usuario, consulta):
        return consulta.none()

    def brinquedos_visiveis(self, usuario, consulta):
        return consulta.filter(ativo=True)