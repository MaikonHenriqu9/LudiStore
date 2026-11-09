from decimal import Decimal

from rest_framework import serializers


class BrinquedoCreateDTO(serializers.Serializer):
    sku = serializers.CharField(max_length=30)
    nome = serializers.CharField(max_length=100)
    descricao = serializers.CharField(required=False, allow_blank=True)
    preco = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal('0.01'))
    estoque = serializers.IntegerField(min_value=0, required=False, default=0)
    idade_minima = serializers.IntegerField(min_value=0, required=False, default=0)
    imagem_url = serializers.URLField(required=False, allow_blank=True)
    marca_id = serializers.IntegerField()
    vendedor_id = serializers.IntegerField()
    categorias_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)
