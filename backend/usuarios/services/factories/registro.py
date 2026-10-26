from usuarios.models import Usuario

from .admin import AdminFactory
from .base import UsuarioFactory
from .cliente import ClienteFactory
from .vendedor import VendedorFactory


class UsuarioFactoryRegistro:
    """Escolhe a fábrica pelo perfil pedido e delega a criação."""

    _fabricas = {
        Usuario.Perfil.CLIENTE: ClienteFactory(),
        Usuario.Perfil.VENDEDOR: VendedorFactory(),
        Usuario.Perfil.ADMIN: AdminFactory(),
    }

    @classmethod
    def obter(cls, perfil) -> UsuarioFactory:
        try:
            return cls._fabricas[perfil]
        except KeyError:
            raise ValueError(f"Perfil inválido: {perfil}")

    @classmethod
    def criar_usuario(cls, perfil, dados, quem_cria=None):
        return cls.obter(perfil).criar(dados, quem_cria)