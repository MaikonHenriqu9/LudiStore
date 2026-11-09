from rest_framework import serializers


class BrinquedoResponseDTO(serializers.Serializer):
    id = serializers.IntegerField()
    sku = serializers.CharField()
    nome = serializers.CharField()
    descricao = serializers.CharField()
    preco = serializers.DecimalField(max_digits=8, decimal_places=2)
    estoque = serializers.IntegerField()
    idade_minima = serializers.IntegerField()
    imagem_url = serializers.CharField()
    ativo = serializers.BooleanField()
    marca = serializers.CharField(source='marca.nome')
    vendedor = serializers.CharField(source='vendedor.nome')
    categorias = serializers.StringRelatedField(many=True)
    criado_em = serializers.DateTimeField()
