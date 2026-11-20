from usuarios.factories.usuario_factory import UsuarioFactory
from usuarios.models import Usuario


class VendedorFactory(UsuarioFactory):

    def perfil(self):
        return Usuario.Perfil.VENDEDOR

    def validar(self, dados):
        super().validar(dados)

        if not dados.get('telefone'):
            raise ValueError('Telefone é obrigatório para vendedores.')