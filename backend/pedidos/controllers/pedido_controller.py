from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from core import RegraDeNegocioError
from pedidos.dtos import PedidoCreateDTO, PedidoResponseDTO, VendaResponseDTO
from pedidos.services import PedidoService


class PedidoController(ViewSet):
    """Todos os endpoints de pedidos num lugar só (mesmo padrão dos outros controllers).

    Não existe PATCH nem DELETE: um pedido confirmado não é alterado nem apagado.
    """

    lookup_field = 'pedido_id'
    lookup_value_regex = '[0-9]+'

    # GET /api/pedidos/                    todos os pedidos (visão do admin)
    # GET /api/pedidos/?comprador_id=9     histórico de compras de um usuário (RN15)
    def list(self, request):
        comprador_id = self._parametro_inteiro(request, 'comprador_id')
        pedidos = PedidoService().listar(comprador_id)
        return Response(PedidoResponseDTO(pedidos, many=True).data)

    # POST /api/pedidos/
    def create(self, request):
        dto = PedidoCreateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        pedido = PedidoService().criar(dto.validated_data)
        return Response(PedidoResponseDTO(pedido).data, status=status.HTTP_201_CREATED)

    # GET /api/pedidos/1/
    def retrieve(self, request, pedido_id=None):
        pedido = PedidoService().buscar(pedido_id)
        return Response(PedidoResponseDTO(pedido).data)

    # GET /api/pedidos/vendas/?vendedor_id=7   vendas dos brinquedos de um vendedor (RN14)
    @action(detail=False, methods=['get'])
    def vendas(self, request):
        vendedor_id = self._parametro_inteiro(request, 'vendedor_id')

        if vendedor_id is None:
            raise RegraDeNegocioError('Informe o vendedor_id. Exemplo: /api/pedidos/vendas/?vendedor_id=7')

        vendas = PedidoService().listar_vendas(vendedor_id)
        return Response(VendaResponseDTO(vendas, many=True).data)

    def _parametro_inteiro(self, request, nome):
        valor = request.query_params.get(nome, '').strip()

        if not valor:
            return None

        if not valor.isdigit():
            raise RegraDeNegocioError(f'O parâmetro {nome} precisa ser um número.')

        return int(valor)
