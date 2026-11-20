from rest_framework import serializers

from usuarios.dtos.validadores import apenas_digitos
from usuarios.models import Usuario


class UsuarioCreateDTO(serializers.Serializer):
    nome = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    senha = serializers.CharField()
    perfil = serializers.ChoiceField(choices=Usuario.Perfil.choices, required=False)
    tipo_pessoa = serializers.ChoiceField(choices=Usuario.TipoPessoa.choices)

    cpf = serializers.CharField(min_length=11, max_length=11, required=False, allow_blank=True, validators=[apenas_digitos])
    cnpj = serializers.CharField(min_length=14, max_length=14, required=False, allow_blank=True, validators=[apenas_digitos])
    telefone = serializers.CharField(min_length=10, max_length=11, required=False, allow_blank=True, validators=[apenas_digitos])
    data_nascimento = serializers.DateField(required=False, allow_null=True)
    sexo = serializers.ChoiceField(choices=Usuario.Sexo.choices, required=False, allow_blank=True)

    cep = serializers.CharField(min_length=8, max_length=8, required=False, allow_blank=True, validators=[apenas_digitos])
    logradouro = serializers.CharField(max_length=150, required=False, allow_blank=True)
    numero = serializers.CharField(max_length=10, required=False, allow_blank=True)
    complemento = serializers.CharField(max_length=60, required=False, allow_blank=True)
    bairro = serializers.CharField(max_length=60, required=False, allow_blank=True)
    cidade = serializers.CharField(max_length=60, required=False, allow_blank=True)
    uf = serializers.CharField(min_length=2, max_length=2, required=False, allow_blank=True)
