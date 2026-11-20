from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from core import RegraDeNegocioError
from pedidos.dtos import PedidoCreateDTO, PedidoResponseDTO, VendaResponseDTO
from pedidos.services import PedidoService
from usuarios.seguranca import Autenticado, PermissoesPorAcaoMixin, VendedorOuAdmin, eh_admin


class PedidoController(PermissoesPorAcaoMixin, ViewSet):
    """Todos os endpoints de pedidos num lugar só (mesmo padrão dos outros controllers).

    Não existe PATCH nem DELETE: um pedido confirmado não é alterado nem apagado.
    """

    lookup_field = 'pedido_id'
    lookup_value_regex = '[0-9]+'

    permissoes_por_acao = {
        'create': [Autenticado],
        'list': [Autenticado],
        'retrieve': [Autenticado],
        'vendas': [VendedorOuAdmin],
    }

    # GET /api/pedidos/
    #   usuário comum: o próprio histórico de compras (RN15)
    #   admin: todos os pedidos, ou os de um comprador com ?comprador_id=9
    def list(self, request):
        if eh_admin(request.user):
            comprador_id = self._parametro_inteiro(request, 'comprador_id')
        else:
            comprador_id = request.user.pk

        pedidos = PedidoService().listar(comprador_id)
        return Response(PedidoResponseDTO(pedidos, many=True).data)

    # POST /api/pedidos/   o comprador é o usuário logado
    def create(self, request):
        dto = PedidoCreateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        dados = {**dto.validated_data, 'comprador_id': request.user.pk}
        pedido = PedidoService().criar(dados)
        return Response(PedidoResponseDTO(pedido).data, status=status.HTTP_201_CREATED)

    # GET /api/pedidos/1/   só o comprador do pedido ou o admin
    def retrieve(self, request, pedido_id=None):
        pedido = PedidoService().buscar(pedido_id, solicitante=request.user)
        return Response(PedidoResponseDTO(pedido).data)

    # GET /api/pedidos/vendas/   vendas dos brinquedos do vendedor logado (RN14)
    #   o admin informa de qual vendedor: /api/pedidos/vendas/?vendedor_id=7
    @action(detail=False, methods=['get'])
    def vendas(self, request):
        if eh_admin(request.user):
            vendedor_id = self._parametro_inteiro(request, 'vendedor_id')

            if vendedor_id is None:
                raise RegraDeNegocioError('Informe o vendedor_id. Exemplo: /api/pedidos/vendas/?vendedor_id=7')
        else:
            vendedor_id = request.user.pk

        vendas = PedidoService().listar_vendas(vendedor_id)
        return Response(VendaResponseDTO(vendas, many=True).data)

    def _parametro_inteiro(self, request, nome):
        valor = request.query_params.get(nome, '').strip()

        if not valor:
            return None

        if not valor.isdigit():
            raise RegraDeNegocioError(f'O parâmetro {nome} precisa ser um número.')

        return int(valor)
