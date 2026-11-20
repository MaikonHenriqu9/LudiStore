from django.contrib.auth.hashers import check_password

from core import LoggerSistema, NaoAutenticadoError
from usuarios.repositories import UsuarioRepository
from usuarios.seguranca import gerar_token


class AutenticacaoService:

    def __init__(self):
        self.repository = UsuarioRepository()
        self.logger = LoggerSistema()

    def login(self, email, senha):
        usuario = self.repository.buscar_por_email(email.strip().lower())

        # A mensagem é a MESMA para e-mail inexistente e senha errada, de propósito:
        # assim ninguém descobre quais e-mails estão cadastrados.
        if usuario is None or not check_password(senha, usuario.senha):
            self.logger.aviso(f'Login recusado: {email}')
            raise NaoAutenticadoError('E-mail ou senha inválidos.')

        if not usuario.ativo:
            raise NaoAutenticadoError('Usuário desativado. Procure o administrador.')

        self.logger.info(f'Login: {usuario.nome} ({usuario.perfil}) id={usuario.pk}')
        return usuario, gerar_token(usuario)
