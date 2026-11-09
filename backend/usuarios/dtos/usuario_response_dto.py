from rest_framework import serializers


class UsuarioResponseDTO(serializers.Serializer):
    id = serializers.IntegerField()
    nome = serializers.CharField()
    email = serializers.EmailField()
    perfil = serializers.CharField()

    cpf = serializers.CharField()
    telefone = serializers.CharField()
    data_nascimento = serializers.DateField()
    sexo = serializers.CharField()

    cep = serializers.CharField()
    logradouro = serializers.CharField()
    numero = serializers.CharField()
    complemento = serializers.CharField()
    bairro = serializers.CharField()
    cidade = serializers.CharField()
    uf = serializers.CharField()

    ativo = serializers.BooleanField()
    criado_em = serializers.DateTimeField()