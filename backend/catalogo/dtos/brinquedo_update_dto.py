from decimal import Decimal

from rest_framework import serializers


class BrinquedoUpdateDTO(serializers.Serializer):
    sku = serializers.CharField(max_length=30, required=False)
    nome = serializers.CharField(max_length=100, required=False)
    descricao = serializers.CharField(required=False, allow_blank=True)
    preco = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal('0.01'), required=False)
    estoque = serializers.IntegerField(min_value=0, required=False)
    idade_minima = serializers.IntegerField(min_value=0, required=False)
    imagem_url = serializers.URLField(required=False, allow_blank=True)
    marca_id = serializers.IntegerField(required=False)
    categorias_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False, required=False)
