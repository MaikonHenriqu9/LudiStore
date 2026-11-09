from catalogo.models import Brinquedo


class BrinquedoRepository:

    def salvar(self, brinquedo):
        brinquedo.save()
        return brinquedo

    def buscar_por_id(self, brinquedo_id):
        return Brinquedo.objects.filter(id=brinquedo_id).first()

    def listar_ativos(self):
        return Brinquedo.objects.filter(ativo=True).select_related('marca', 'vendedor').prefetch_related('categorias')

    def existe_sku(self, sku):
        return Brinquedo.objects.filter(sku__iexact=sku).exists()

    def existe_sku_em_outro_brinquedo(self, sku, brinquedo_id):
        return Brinquedo.objects.filter(sku__iexact=sku).exclude(id=brinquedo_id).exists()
