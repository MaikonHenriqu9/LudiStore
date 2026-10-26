from abc import ABC, abstractmethod


class Observador(ABC):
    """Contrato de quem quer ser avisado quando um evento acontece."""

    @abstractmethod
    def atualizar(self, evento, dados):
        """Chamado pelo assunto quando o evento ocorre."""