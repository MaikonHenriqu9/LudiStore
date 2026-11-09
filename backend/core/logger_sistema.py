import logging
from pathlib import Path


class LoggerSistema:
    _instancia = None

    def __new__(cls):
        if cls._instancia is None:
            cls._instancia = super().__new__(cls)
            cls._instancia._configurar()

        return cls._instancia

    def _configurar(self):
        pasta_logs = Path(__file__).resolve().parent.parent / 'logs'
        pasta_logs.mkdir(exist_ok=True)

        self._logger = logging.getLogger('ludistore')
        self._logger.setLevel(logging.INFO)

        formato = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s', '%d/%m/%Y %H:%M:%S')

        for handler in (logging.StreamHandler(), logging.FileHandler(pasta_logs / 'ludistore.log', encoding='utf-8')):
            handler.setFormatter(formato)
            self._logger.addHandler(handler)

    def info(self, mensagem):
        self._logger.info(mensagem)

    def aviso(self, mensagem):
        self._logger.warning(mensagem)
