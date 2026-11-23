from django.db import models
from catalogo.models.categoria import Categoria
from catalogo.models.marca import Marca
from usuarios.models import Usuario


class Brinquedo(models.Model):
    brinquedo_id = models.BigAutoField(primary_key=True)
    sku = models.CharField(max_length=30, unique=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    preco = models.DecimalField(max_digits=8, decimal_places=2)
    estoque = models.PositiveIntegerField(default=0)
    idade_minima = models.PositiveIntegerField(default=0)
    imagem_url = models.URLField(max_length=2048, blank=True)
    ativo = models.BooleanField(default=True)

    marca = models.ForeignKey(Marca, on_delete=models.PROTECT, related_name='brinquedos')
    categorias = models.ManyToManyField(Categoria, related_name='brinquedos', db_table='brinquedo_categoria')
    vendedor = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='brinquedos')

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "brinquedo"

    def __str__(self):
        return self.nome