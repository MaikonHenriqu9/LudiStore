from django.db import models

class Marca(models.Model):
    marca_id = models.BigAutoField(primary_key=True)
    nome = models.CharField(max_length=60, unique=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        db_table = "marca"

    def __str__(self):
        return self.nome