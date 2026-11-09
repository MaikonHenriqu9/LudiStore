from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from usuarios.dtos import UsuarioResponseDTO, UsuarioUpdateDTO
from usuarios.services import UsuarioService


class UsuarioDetalheController(APIView):

    def get(self, request, usuario_id):
        try:
            usuario = UsuarioService().buscar(usuario_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(UsuarioResponseDTO(usuario).data)

    def patch(self, request, usuario_id):
        dto = UsuarioUpdateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            usuario = UsuarioService().atualizar(usuario_id, dto.validated_data)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(UsuarioResponseDTO(usuario).data)

    def delete(self, request, usuario_id):
        try:
            UsuarioService().desativar(usuario_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)