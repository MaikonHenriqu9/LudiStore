from usuarios.factories.usuario_factory import UsuarioFactory
from core import RegraDeNegocioError
from usuarios.models import Usuario


class VendedorFactory(UsuarioFactory):

    def perfil(self):
        return Usuario.Perfil.VENDEDOR

    def validar(self, dados):
        super().validar(dados)

        if not dados.get('telefone'):
            raise RegraDeNegocioError('Telefone é obrigatório para vendedores.')