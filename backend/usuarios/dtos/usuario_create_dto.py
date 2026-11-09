from rest_framework import serializers
from usuarios.models import Usuario


class UsuarioCreateDTO(serializers.Serializer):
    nome = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    senha = serializers.CharField()
    perfil = serializers.ChoiceField(choices=Usuario.Perfil.choices, required=False)

    cpf = serializers.CharField(max_length=11, required=False, allow_blank=True)
    telefone = serializers.CharField(max_length=11, required=False, allow_blank=True)
    data_nascimento = serializers.DateField(required=False, allow_null=True)
    sexo = serializers.ChoiceField(choices=Usuario.Sexo.choices, required=False, allow_blank=True)

    cep = serializers.CharField(max_length=8, required=False, allow_blank=True)
    logradouro = serializers.CharField(max_length=150, required=False, allow_blank=True)
    numero = serializers.CharField(max_length=10, required=False, allow_blank=True)
    complemento = serializers.CharField(max_length=60, required=False, allow_blank=True)
    bairro = serializers.CharField(max_length=60, required=False, allow_blank=True)
    cidade = serializers.CharField(max_length=60, required=False, allow_blank=True)
    uf = serializers.CharField(max_length=2, required=False, allow_blank=True)