from django.db import models

from catalogo.models import Brinquedo
from pedidos.models.pedido import Pedido


class ItemPedido(models.Model):
    item_pedido_id = models.BigAutoField(primary_key=True)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    brinquedo = models.ForeignKey(Brinquedo, on_delete=models.PROTECT, related_name='itens_pedido')
    quantidade = models.PositiveIntegerField()

    # RN13: guarda o preço do MOMENTO da compra. Se o vendedor mudar o preço
    # do brinquedo depois, o histórico do pedido continua com o valor pago.
    preco_unitario = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        db_table = 'item_pedido'
        constraints = [
            models.UniqueConstraint(fields=['pedido', 'brinquedo'], name='item_pedido_brinquedo_unico'),
        ]

    @property
    def subtotal(self):
        return self.quantidade * self.preco_unitario

    def __str__(self):
        return f'{self.quantidade}x {self.brinquedo.nome}'
