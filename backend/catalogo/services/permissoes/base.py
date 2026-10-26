from abc import ABC, abstractmethod


class PermissaoStrategy(ABC):
    """Contrato que toda estratégia de permissão por perfil deve cumprir."""

    @abstractmethod
    def pode_visualizar(self, usuario, brinquedo):
        """Pode ver este brinquedo no catálogo?"""

    @abstractmethod
    def pode_criar(self, usuario):
        """Pode cadastrar um novo brinquedo?"""

    @abstractmethod
    def pode_editar(self, usuario, brinquedo):
        """Pode editar este brinquedo?"""

    @abstractmethod
    def pode_excluir(self, usuario, brinquedo):
        """Pode excluir este brinquedo?"""

    @abstractmethod
    def brinquedos_gerenciaveis(self, usuario, consulta):
        """Devolve, da consulta recebida, só os brinquedos que este perfil pode gerenciar."""