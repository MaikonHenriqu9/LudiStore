from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogo.dtos import CategoriaDTO
from catalogo.services import CategoriaService


class CategoriaController(APIView):
    def get(self, request):
        categorias = CategoriaService().listar()
        return Response(CategoriaDTO(categorias, many=True).data)

    def post(self, request):
        dto = CategoriaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            categoria = CategoriaService().criar(dto.validated_data)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(CategoriaDTO(categoria).data, status=status.HTTP_201_CREATED)