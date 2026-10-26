from .base import PermissaoStrategy


class VendedorPermissao(PermissaoStrategy):
    def pode_visualizar(self, usuario, brinquedo):
        return True

    def pode_criar(self, usuario):
        return True

    def pode_editar(self, usuario, brinquedo):
        return brinquedo.criado_por_id == usuario.id

    def pode_excluir(self, usuario, brinquedo):
        return brinquedo.criado_por_id == usuario.id

    def brinquedos_gerenciaveis(self, usuario, consulta):
        return consulta.filter(criado_por=usuario)