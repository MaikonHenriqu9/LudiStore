from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from catalogo.dtos import BrinquedoCreateDTO, BrinquedoResponseDTO, BrinquedoUpdateDTO
from catalogo.services import BrinquedoService
from usuarios.seguranca import PermissoesPorAcaoMixin, Publico, VendedorOuAdmin, eh_admin


class BrinquedoController(PermissoesPorAcaoMixin, ViewSet):
    """Todos os endpoints de brinquedos num lugar só (mesmo padrão do UsuarioController)."""

    lookup_field = 'brinquedo_id'
    lookup_value_regex = '[0-9]+'

    # O catálogo é público; cadastrar e alterar é do vendedor (RN03: só os próprios) ou do admin
    permissoes_por_acao = {
        'list': [Publico],
        'retrieve': [Publico],
        'create': [VendedorOuAdmin],
        'partial_update': [VendedorOuAdmin],
        'destroy': [VendedorOuAdmin],
        'reativar': [VendedorOuAdmin],
        'meus': [VendedorOuAdmin],
    }

    # GET /api/brinquedos/?ordem=menor_preco   (catálogo: só os ativos; ordenação via Strategy)
    def list(self, request):
        ordem = request.query_params.get('ordem', 'nome')
        brinquedos = BrinquedoService().listar(ordem)
        return Response(BrinquedoResponseDTO(brinquedos, many=True).data)

    # POST /api/brinquedos/
    def create(self, request):
        dto = BrinquedoCreateDTO(data=request.data)
        dto.is_valid(raise_exception=True)
        dados = dto.validated_data

        # O vendedor sempre cadastra em nome próprio. Só o admin escolhe o vendedor_id.
        if not eh_admin(request.user):
            dados['vendedor_id'] = request.user.pk

        brinquedo = BrinquedoService().criar(dados)
        return Response(BrinquedoResponseDTO(brinquedo).data, status=status.HTTP_201_CREATED)

    # GET /api/brinquedos/1/   (só os ativos: é a página do produto no catálogo)
    def retrieve(self, request, brinquedo_id=None):
        brinquedo = BrinquedoService().buscar(brinquedo_id)
        return Response(BrinquedoResponseDTO(brinquedo).data)

    # PATCH /api/brinquedos/1/
    def partial_update(self, request, brinquedo_id=None):
        dto = BrinquedoUpdateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        brinquedo = BrinquedoService().atualizar(brinquedo_id, dto.validated_data, solicitante=request.user)
        return Response(BrinquedoResponseDTO(brinquedo).data)

    # DELETE /api/brinquedos/1/   (exclusão lógica)
    def destroy(self, request, brinquedo_id=None):
        BrinquedoService().desativar(brinquedo_id, solicitante=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH /api/brinquedos/1/reativar/
    @action(detail=True, methods=['patch'])
    def reativar(self, request, brinquedo_id=None):
        brinquedo = BrinquedoService().reativar(brinquedo_id, solicitante=request.user)
        return Response(BrinquedoResponseDTO(brinquedo).data)

    # GET /api/brinquedos/meus/   painel do vendedor: os próprios brinquedos, inclusive desativados
    @action(detail=False, methods=['get'])
    def meus(self, request):
        brinquedos = BrinquedoService().listar_do_vendedor(request.user.pk)
        return Response(BrinquedoResponseDTO(brinquedos, many=True).data)
