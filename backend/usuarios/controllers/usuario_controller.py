from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from usuarios.dtos import UsuarioCreateDTO, UsuarioResponseDTO
from usuarios.services import UsuarioService


class UsuarioController(APIView):
    def post(self, request):
        dto = UsuarioCreateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            usuario = UsuarioService().cadastrar(dto.validated_data)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(UsuarioResponseDTO(usuario).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        usuarios = UsuarioService().listar()
        return Response(UsuarioResponseDTO(usuarios, many=True).data)