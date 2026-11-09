from usuarios.factories.usuario_factory import UsuarioFactory
from usuarios.models import Usuario


class AdminFactory(UsuarioFactory):

    def perfil(self):
        return Usuario.Perfil.ADMIN