from rest_framework import serializers


class ItemPedidoCreateDTO(serializers.Serializer):
    brinquedo_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1)


class PedidoCreateDTO(serializers.Serializer):
    # Sem login ainda: o comprador vem no corpo. Com a autenticação, virá do usuário logado.
    comprador_id = serializers.IntegerField()
    itens = ItemPedidoCreateDTO(many=True, allow_empty=False)
