from .base import PermissaoStrategy


class AdminPermissao(PermissaoStrategy):
    def pode_visualizar(self, usuario, brinquedo):
        return True

    def pode_criar(self, usuario):
        return True

    def pode_editar(self, usuario, brinquedo):
        return True

    def pode_excluir(self, usuario, brinquedo):
        return True

    def brinquedos_gerenciaveis(self, usuario, consulta):
        return consulta