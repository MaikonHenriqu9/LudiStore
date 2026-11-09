from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalogo.dtos import BrinquedoCreateDTO, BrinquedoResponseDTO
from catalogo.services import BrinquedoService


class BrinquedoController(APIView):

    def get(self, request):
        ordem = request.query_params.get('ordem', 'nome')

        try:
            brinquedos = BrinquedoService().listar(ordem)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(BrinquedoResponseDTO(brinquedos, many=True).data)

    def post(self, request):
        dto = BrinquedoCreateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            brinquedo = BrinquedoService().criar(dto.validated_data)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(BrinquedoResponseDTO(brinquedo).data, status=status.HTTP_201_CREATED)
