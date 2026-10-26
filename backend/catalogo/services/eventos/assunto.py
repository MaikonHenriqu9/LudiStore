from .base import Observador


class BrinquedoEventos:
    """Assunto do Observer: guarda os interessados e avisa todos."""

    BRINQUEDO_CADASTRADO = "brinquedo_cadastrado"

    def __init__(self):
        self._observadores = {}

    def inscrever(self, evento, observador: Observador):
        self._observadores.setdefault(evento, []).append(observador)

    def notificar(self, evento, dados):
        for observador in self._observadores.get(evento, []):
            observador.atualizar(evento, dados)