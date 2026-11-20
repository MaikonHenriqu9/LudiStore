from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

from core.excecoes import NaoEncontradoError, RegraDeNegocioError


def tratar_excecoes(exc, context):
    """Converte as exceções do negócio em respostas HTTP, num lugar só.

    É o equivalente ao @ControllerAdvice do Spring: os controllers não
    precisam de try/except para esses dois casos.
    """
    if isinstance(exc, RegraDeNegocioError):
        return Response({'erro': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, NaoEncontradoError):
        return Response({'erro': str(exc)}, status=status.HTTP_404_NOT_FOUND)

    return exception_handler(exc, context)
