from rest_framework import serializers


class CategoriaDTO(serializers.Serializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    nome = serializers.CharField(max_length=60)
    ativo = serializers.BooleanField(read_only=True)