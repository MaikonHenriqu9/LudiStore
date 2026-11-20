import logging

from django.test.runner import DiscoverRunner


class TestRunnerSemLog(DiscoverRunner):
    """Roda os testes com o LoggerSistema desligado.

    Assim os testes não poluem o terminal nem gravam linhas no logs/ludistore.log.
    """

    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        logging.getLogger('ludistore').disabled = True

    def teardown_test_environment(self, **kwargs):
        logging.getLogger('ludistore').disabled = False
        super().teardown_test_environment(**kwargs)
