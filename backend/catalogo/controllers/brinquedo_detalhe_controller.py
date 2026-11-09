from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalogo.dtos import BrinquedoResponseDTO, BrinquedoUpdateDTO
from catalogo.services import BrinquedoService


class BrinquedoDetalheController(APIView):

    def get(self, request, brinquedo_id):
        try:
            brinquedo = BrinquedoService().buscar(brinquedo_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(BrinquedoResponseDTO(brinquedo).data)

    def patch(self, request, brinquedo_id):
        dto = BrinquedoUpdateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            brinquedo = BrinquedoService().atualizar(brinquedo_id, dto.validated_data)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(BrinquedoResponseDTO(brinquedo).data)

    def delete(self, request, brinquedo_id):
        try:
            BrinquedoService().desativar(brinquedo_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)
