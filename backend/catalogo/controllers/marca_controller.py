from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogo.dtos import MarcaDTO
from catalogo.services import MarcaService


class MarcaController(APIView):
    def get(self, request):
        marcas = MarcaService().listar()
        return Response(MarcaDTO(marcas, many=True).data)

    def post(self, request):
        dto = MarcaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            marca = MarcaService().criar(dto.validated_data)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(MarcaDTO(marca).data, status=status.HTTP_201_CREATED)