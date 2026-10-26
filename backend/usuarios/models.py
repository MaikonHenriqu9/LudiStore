from django.db import models


class Usuario(models.Model):
    class Perfil(models.TextChoices):
        ADMIN = "ADMIN", "Administrador"
        VENDEDOR = "VENDEDOR", "Vendedor"
        CLIENTE = "CLIENTE", "Cliente"

    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=128)
    perfil = models.CharField(
        max_length=10,
        choices=Perfil.choices,
        default=Perfil.CLIENTE,
    )
    foto_url = models.URLField(blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)