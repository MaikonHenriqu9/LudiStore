from usuarios.models import Usuario

from .base import UsuarioFactory


class AdminFactory(UsuarioFactory):
    def perfil(self):
        return Usuario.Perfil.ADMIN

    def campos_obrigatorios(self):
        return ["nome", "email", "senha"]

    def pode_ser_criado_por(self, quem_cria):
        return quem_cria is not None and quem_cria.perfil == Usuario.Perfil.ADMIN