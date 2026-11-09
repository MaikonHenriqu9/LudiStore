from abc import ABC, abstractmethod
from django.contrib.auth.hashers import make_password
from usuarios.models import Usuario


class UsuarioFactory(ABC):
    def criar(self, dados):
        self.validar(dados)

        usuario = Usuario(**dados)
        usuario.senha = make_password(dados['senha'])
        usuario.perfil = self.perfil()

        return usuario

    @abstractmethod
    def perfil(self):
        pass

    def validar(self, dados):
        pass