from django.db import models

class Brinquedo(models.Model):
    # Identificação
    nome = models.CharField(max_length=150)
    sku = models.CharField(max_length=50, unique=True)

    # Descrição
    descricao = models.TextField(blank=True)
    imagem_url = models.URLField(max_length=500, blank=True)

    # Classificação
    categoria = models.ForeignKey(
        "catalogo.Categoria",
        on_delete=models.PROTECT,
        related_name="brinquedos",
    )
    marca = models.CharField(max_length=100, blank=True)
    faixa_etaria = models.CharField(max_length=50, blank=True)

    # Preço e estoque
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    estoque = models.PositiveIntegerField(default=0)

    # Logística (opcionais)
    peso_gramas = models.PositiveIntegerField(null=True, blank=True)
    altura_cm = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    largura_cm = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    profundidade_cm = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)

    # Controle
    ativo = models.BooleanField(default=True)
    criado_por = models.ForeignKey(
        "usuarios.Usuario",
        on_delete=models.PROTECT,
        related_name="brinquedos",
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} ({self.sku})"