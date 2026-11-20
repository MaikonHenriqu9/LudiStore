from django.db import models

class Usuario(models.Model):
    class Perfil(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        VENDEDOR = 'VENDEDOR', 'Vendedor'
        CLIENTE = 'CLIENTE', 'Cliente'

    class Sexo(models.TextChoices):
        MASCULINO = 'M', 'Masculino'
        FEMININO = 'F', 'Feminino'
        OUTRO = 'O', 'Outro'
        NAO_INFORMAR = 'N/I', 'Não Informar'

    class TipoPessoa(models.TextChoices):
        FISICA = 'PF', 'Pessoa Física'
        JURIDICA = 'PJ', 'Pessoa Jurídica'
    
    usuario_id = models.BigAutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=200)
    perfil = models.CharField(
        max_length=10,
        choices=Perfil.choices,
        default=Perfil.CLIENTE
    )

    tipo_pessoa = models.CharField(max_length=2, choices=TipoPessoa, default=TipoPessoa.FISICA)
    cpf = models.CharField(max_length=11, unique=True, null=True, blank=True)
    cnpj = models.CharField(max_length=14, unique=True, null=True, blank=True)
    telefone = models.CharField(max_length=11, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=3, choices=Sexo.choices, blank=True)
    
    cep = models.CharField(max_length=8, blank=True)
    logradouro = models.CharField(max_length=150, blank=True)
    numero = models.CharField(max_length=10, blank=True)
    complemento = models.CharField(max_length=60, blank=True)
    bairro = models.CharField(max_length=60, blank=True)
    cidade = models.CharField(max_length=60, blank=True)
    uf = models.CharField(max_length=2, blank=True)
    
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "usuario"

    def __str__(self):
        return f'{self.nome} ({self.get_perfil_display()})'