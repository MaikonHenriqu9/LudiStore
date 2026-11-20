from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

from core.excecoes import NaoAutenticadoError, NaoEncontradoError, RegraDeNegocioError, SemPermissaoError

# Cada exceção do negócio vira um status HTTP
STATUS_POR_EXCECAO = {
    RegraDeNegocioError: status.HTTP_400_BAD_REQUEST,
    NaoAutenticadoError: status.HTTP_401_UNAUTHORIZED,
    SemPermissaoError: status.HTTP_403_FORBIDDEN,
    NaoEncontradoError: status.HTTP_404_NOT_FOUND,
}


def tratar_excecoes(exc, context):
    """Converte as exceções em respostas HTTP, num lugar só.

    É o equivalente ao @ControllerAdvice do Spring: os controllers não
    precisam de try/except.
    """
    for tipo, codigo in STATUS_POR_EXCECAO.items():
        if isinstance(exc, tipo):
            return Response({'erro': str(exc)}, status=codigo)

    resposta = exception_handler(exc, context)

    # Erros do próprio DRF (401, 403, 405...) vêm como {"detail": "..."}.
    # Trocamos por {"erro": "..."} para a API ter um formato só.
    if resposta is not None and isinstance(resposta.data, dict) and set(resposta.data) == {'detail'}:
        resposta.data = {'erro': resposta.data['detail']}

    return resposta
