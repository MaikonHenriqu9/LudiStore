from usuarios.factories.usuario_factory import UsuarioFactory
from usuarios.models import Usuario


class ClienteFactory(UsuarioFactory):

    def perfil(self):
        return Usuario.Perfil.CLIENTE