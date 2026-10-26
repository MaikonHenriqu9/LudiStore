from .assunto import BrinquedoEventos
from .observadores import LogCadastroObservador, NotificacaoVendedorObservador

eventos = BrinquedoEventos()
eventos.inscrever(BrinquedoEventos.BRINQUEDO_CADASTRADO, LogCadastroObservador())
eventos.inscrever(BrinquedoEventos.BRINQUEDO_CADASTRADO, NotificacaoVendedorObservador())