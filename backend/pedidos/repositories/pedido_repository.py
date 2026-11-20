from pedidos.models import ItemPedido, Pedido


class PedidoRepository:

    def salvar(self, pedido):
        pedido.save()
        return pedido

    def salvar_itens(self, itens):
        return ItemPedido.objects.bulk_create(itens)

    def buscar_por_id(self, pedido_id):
        return self._com_detalhes().filter(pk=pedido_id).first()

    def listar_todos(self):
        return self._com_detalhes().order_by('-criado_em')

    def listar_por_comprador(self, comprador_id):
        return self._com_detalhes().filter(comprador_id=comprador_id).order_by('-criado_em')

    def listar_vendas_do_vendedor(self, vendedor_id):
        # Cada linha é um item vendido de um brinquedo desse vendedor
        return (
            ItemPedido.objects
            .filter(brinquedo__vendedor_id=vendedor_id)
            .select_related('pedido__comprador', 'brinquedo')
            .order_by('-pedido__criado_em')
        )

    def _com_detalhes(self):
        # Busca comprador, itens e brinquedos de uma vez (evita uma consulta por item)
        return Pedido.objects.select_related('comprador').prefetch_related('itens__brinquedo')
