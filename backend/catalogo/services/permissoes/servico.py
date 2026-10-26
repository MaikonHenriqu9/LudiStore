from usuarios.models import Usuario

from .admin import AdminPermissao
from .cliente import ClientePermissao
from .vendedor import VendedorPermissao


class PermissaoService:
    """Contexto do Strategy: escolhe a estratégia pelo perfil e repassa a pergunta."""

    _estrategias = {
        Usuario.Perfil.ADMIN: AdminPermissao(),
        Usuario.Perfil.VENDEDOR: VendedorPermissao(),
        Usuario.Perfil.CLIENTE: ClientePermissao(),
    }

    def __init__(self, usuario):
        self.usuario = usuario
        self.estrategia = self._estrategias[usuario.perfil]

    def pode_visualizar(self, brinquedo):
        return self.estrategia.pode_visualizar(self.usuario, brinquedo)

    def pode_criar(self):
        return self.estrategia.pode_criar(self.usuario)

    def pode_editar(self, brinquedo):
        return self.estrategia.pode_editar(self.usuario, brinquedo)

    def pode_excluir(self, brinquedo):
        return self.estrategia.pode_excluir(self.usuario, brinquedo)

    def brinquedos_gerenciaveis(self, consulta):
        return self.estrategia.brinquedos_gerenciaveis(self.usuario, consulta)