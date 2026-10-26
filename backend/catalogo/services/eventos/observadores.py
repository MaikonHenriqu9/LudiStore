import logging

from .base import Observador

logger = logging.getLogger("catalogo.eventos")


class LogCadastroObservador(Observador):
    """Registra no log que um brinquedo foi cadastrado."""

    def atualizar(self, evento, dados):
        brinquedo = dados["brinquedo"]
        logger.info("Brinquedo cadastrado: %s (SKU %s)", brinquedo.nome, brinquedo.sku)


class NotificacaoVendedorObservador(Observador):
    """Simula o aviso de sucesso para quem cadastrou."""

    def atualizar(self, evento, dados):
        usuario = dados["usuario"]
        brinquedo = dados["brinquedo"]
        logger.info("Aviso para %s: '%s' foi cadastrado com sucesso.", usuario.nome, brinquedo.nome)