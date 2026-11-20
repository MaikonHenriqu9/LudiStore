from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from catalogo.dtos import MarcaDTO
from catalogo.services import MarcaService
from usuarios.seguranca import PermissoesPorAcaoMixin, Publico, SomenteAdmin, eh_admin


class MarcaController(PermissoesPorAcaoMixin, ViewSet):
    """Todos os endpoints de marcas num lugar só (mesmo padrão do UsuarioController)."""

    lookup_field = 'marca_id'
    lookup_value_regex = '[0-9]+'

    # RN02: só o admin gerencia marcas; consultar é público (RN04: o vendedor escolhe da lista)
    permissoes_por_acao = {
        'list': [Publico],
        'retrieve': [Publico],
        'create': [SomenteAdmin],
        'partial_update': [SomenteAdmin],
        'destroy': [SomenteAdmin],
        'reativar': [SomenteAdmin],
    }

    # GET /api/marcas/   (só as ativas: é a lista que o vendedor usa para escolher)
    def list(self, request):
        marcas = MarcaService().listar()
        return Response(MarcaDTO(marcas, many=True).data)

    # POST /api/marcas/
    def create(self, request):
        dto = MarcaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        marca = MarcaService().criar(dto.validated_data)
        return Response(MarcaDTO(marca).data, status=status.HTTP_201_CREATED)

    # GET /api/marcas/1/   (só o admin vê as desativadas)
    def retrieve(self, request, marca_id=None):
        marca = MarcaService().buscar(marca_id, incluir_inativos=eh_admin(request.user))
        return Response(MarcaDTO(marca).data)

    # PATCH /api/marcas/1/
    def partial_update(self, request, marca_id=None):
        dto = MarcaDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        marca = MarcaService().atualizar(marca_id, dto.validated_data)
        return Response(MarcaDTO(marca).data)

    # DELETE /api/marcas/1/   (exclusão lógica)
    def destroy(self, request, marca_id=None):
        MarcaService().desativar(marca_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH /api/marcas/1/reativar/
    @action(detail=True, methods=['patch'])
    def reativar(self, request, marca_id=None):
        marca = MarcaService().reativar(marca_id)
        return Response(MarcaDTO(marca).data)
