from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from catalogo.dtos import CategoriaDTO
from catalogo.services import CategoriaService


class CategoriaController(ViewSet):
    """Todos os endpoints de categorias num lugar só (mesmo padrão do UsuarioController)."""

    lookup_field = 'categoria_id'
    lookup_value_regex = '[0-9]+'

    # GET /api/categorias/   (só as ativas: é a lista que o vendedor usa para escolher)
    def list(self, request):
        categorias = CategoriaService().listar()
        return Response(CategoriaDTO(categorias, many=True).data)

    # POST /api/categorias/
    def create(self, request):
        dto = CategoriaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        categoria = CategoriaService().criar(dto.validated_data)
        return Response(CategoriaDTO(categoria).data, status=status.HTTP_201_CREATED)

    # GET /api/categorias/1/   (o admin também vê as desativadas)
    def retrieve(self, request, categoria_id=None):
        categoria = CategoriaService().buscar(categoria_id, incluir_inativos=True)
        return Response(CategoriaDTO(categoria).data)

    # PATCH /api/categorias/1/
    def partial_update(self, request, categoria_id=None):
        dto = CategoriaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        categoria = CategoriaService().atualizar(categoria_id, dto.validated_data)
        return Response(CategoriaDTO(categoria).data)

    # DELETE /api/categorias/1/   (exclusão lógica)
    def destroy(self, request, categoria_id=None):
        CategoriaService().desativar(categoria_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH /api/categorias/1/reativar/
    @action(detail=True, methods=['patch'])
    def reativar(self, request, categoria_id=None):
        categoria = CategoriaService().reativar(categoria_id)
        return Response(CategoriaDTO(categoria).data)
