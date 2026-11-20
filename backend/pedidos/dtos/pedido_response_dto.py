from rest_framework import serializers


class ItemPedidoResponseDTO(serializers.Serializer):
    brinquedo_id = serializers.IntegerField(source='brinquedo.pk')
    brinquedo = serializers.CharField(source='brinquedo.nome')
    quantidade = serializers.IntegerField()
    preco_unitario = serializers.DecimalField(max_digits=8, decimal_places=2)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)


class PedidoResponseDTO(serializers.Serializer):
    id = serializers.IntegerField(source='pk')
    comprador_id = serializers.IntegerField(source='comprador.pk')
    comprador = serializers.CharField(source='comprador.nome')
    status = serializers.CharField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    criado_em = serializers.DateTimeField()
    itens = ItemPedidoResponseDTO(many=True)


class VendaResponseDTO(serializers.Serializer):
    """RN14: o que o vendedor vê de cada venda (data, comprador, quantidade e valor)."""

    pedido_id = serializers.IntegerField(source='pedido.pk')
    data = serializers.DateTimeField(source='pedido.criado_em')
    comprador = serializers.CharField(source='pedido.comprador.nome')
    brinquedo = serializers.CharField(source='brinquedo.nome')
    quantidade = serializers.IntegerField()
    preco_unitario = serializers.DecimalField(max_digits=8, decimal_places=2)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
