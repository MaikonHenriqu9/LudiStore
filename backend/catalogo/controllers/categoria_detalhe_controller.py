from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogo.dtos import CategoriaDTO
from catalogo.services import CategoriaService


class CategoriaDetalheController(APIView):
    def get(self, request, categoria_id):
        try:
            categoria = CategoriaService().buscar(categoria_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(CategoriaDTO(categoria).data)

    def patch(self, request, categoria_id):
        dto = CategoriaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        try:
            categoria = CategoriaService().atualizar(categoria_id, dto.validated_data)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(CategoriaDTO(categoria).data)

    def delete(self, request, categoria_id):
        try:
            CategoriaService().desativar(categoria_id)
        except LookupError as erro:
            return Response({'erro': str(erro)}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)