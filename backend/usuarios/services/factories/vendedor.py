from usuarios.models import Usuario

from .base import UsuarioFactory


class VendedorFactory(UsuarioFactory):
    def perfil(self):
        return Usuario.Perfil.VENDEDOR

    def campos_obrigatorios(self):
        return ["nome", "email", "senha", "telefone"]

    def pode_ser_criado_por(self, quem_cria):
        return True