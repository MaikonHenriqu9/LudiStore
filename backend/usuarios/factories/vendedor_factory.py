from usuarios.factories.usuario_factory import UsuarioFactory
from usuarios.models import Usuario


class VendedorFactory(UsuarioFactory):

    def perfil(self):
        return Usuario.Perfil.VENDEDOR

    def validar(self, dados):
        if not dados.get('cpf'):
            raise ValueError('CPF é obrigatório para vendedores.')

        if not dados.get('telefone'):
            raise ValueError('Telefone é obrigatório para vendedores.')