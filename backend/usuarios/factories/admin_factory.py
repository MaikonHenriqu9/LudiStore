from usuarios.factories.usuario_factory import UsuarioFactory
from usuarios.models import Usuario


class AdminFactory(UsuarioFactory):

    def perfil(self):
        return Usuario.Perfil.ADMIN

    def validar(self, dados):
        # O admin é criado pelo shell e é dispensado da regra do documento.
        pass