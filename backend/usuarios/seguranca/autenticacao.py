from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from core import NaoAutenticadoError
from usuarios.repositories import UsuarioRepository
from usuarios.seguranca.token import ler_token


class TokenAutenticacao(BaseAuthentication):
    """Lê o cabeçalho "Authorization: Bearer <token>" de cada requisição.

    - Sem o cabeçalho: a requisição segue como anônima (request.user = None).
    - Com um token válido: request.user passa a ser o Usuario logado.
    - Com um token inválido ou expirado: 401.
    """

    def authenticate(self, request):
        cabecalho = request.headers.get('Authorization', '')

        if not cabecalho:
            return None

        tipo, _, token = cabecalho.partition(' ')

        if tipo != 'Bearer' or not token:
            raise AuthenticationFailed('Envie o cabeçalho no formato: Authorization: Bearer <token>.')

        try:
            usuario_id = ler_token(token.strip())
        except NaoAutenticadoError as erro:
            raise AuthenticationFailed(str(erro))

        usuario = UsuarioRepository().buscar_por_id(usuario_id)

        if usuario is None or not usuario.ativo:
            raise AuthenticationFailed('Usuário inexistente ou desativado.')

        return usuario, token

    def authenticate_header(self, request):
        # Faz o DRF responder 401 (e não 403) quando falta o login
        return 'Bearer'
