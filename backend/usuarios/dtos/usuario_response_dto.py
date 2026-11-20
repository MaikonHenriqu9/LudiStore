from rest_framework import serializers


class UsuarioResponseDTO(serializers.Serializer):
    # Sem "senha": ela nunca sai da API.
    id = serializers.IntegerField(source='pk')
    nome = serializers.CharField()
    email = serializers.EmailField()
    perfil = serializers.CharField()
    tipo_pessoa = serializers.CharField()

    cpf = serializers.CharField()
    cnpj = serializers.CharField()
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
    atualizado_em = serializers.DateTimeField()
