from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogo.dtos import MarcaDTO
from catalogo.services import MarcaService


class MarcaDetalheController(APIView):
    def get(self, request, marca_id):
        try:
            marca = MarcaService().buscar(marca_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(MarcaDTO(marca).data)

    def patch(self, request, marca_id):
        dto = MarcaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            marca = MarcaService().atualizar(marca_id, dto.validated_data)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(MarcaDTO(marca).data)

    def delete(self, request, marca_id):
        try:
            MarcaService().desativar(marca_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)