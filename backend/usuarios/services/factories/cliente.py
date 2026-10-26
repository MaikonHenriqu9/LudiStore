from usuarios.models import Usuario

from .base import UsuarioFactory


class ClienteFactory(UsuarioFactory):
    def perfil(self):
        return Usuario.Perfil.CLIENTE

    def campos_obrigatorios(self):
        return ["nome", "email", "senha"]

    def pode_ser_criado_por(self, quem_cria):
        return True