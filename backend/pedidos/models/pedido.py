from django.db import models

from usuarios.models import Usuario


class Pedido(models.Model):
    class Status(models.TextChoices):
        CONFIRMADO = 'CONFIRMADO', 'Confirmado'

    pedido_id = models.BigAutoField(primary_key=True)
    comprador = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='pedidos')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMADO)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pedido'

    def __str__(self):
        return f'Pedido {self.pk} de {self.comprador.nome}'
