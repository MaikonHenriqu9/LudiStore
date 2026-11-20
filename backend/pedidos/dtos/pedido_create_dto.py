from rest_framework import serializers


class ItemPedidoCreateDTO(serializers.Serializer):
    brinquedo_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1)


class PedidoCreateDTO(serializers.Serializer):
    # O comprador NÃO vem no corpo: é sempre o usuário logado (vem do token).
    itens = ItemPedidoCreateDTO(many=True, allow_empty=False)
