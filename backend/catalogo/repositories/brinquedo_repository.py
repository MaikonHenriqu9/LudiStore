from catalogo.models import Brinquedo


class BrinquedoRepository:

    def salvar(self, brinquedo):
        brinquedo.save()
        return brinquedo

    def buscar_por_id(self, brinquedo_id):
        return Brinquedo.objects.filter(pk=brinquedo_id).first()

    def listar_ativos(self):
        return Brinquedo.objects.filter(ativo=True).select_related('marca', 'vendedor').prefetch_related('categorias')

    def listar_por_vendedor(self, vendedor_id):
        # Painel do vendedor: inclui os desativados, para ele poder reativar
        return (
            Brinquedo.objects.filter(vendedor_id=vendedor_id)
            .select_related('marca', 'vendedor').prefetch_related('categorias')
            .order_by('nome')
        )

    def buscar_para_compra(self, brinquedos_ids):
        # select_for_update TRAVA essas linhas até o fim da transação. Se duas pessoas
        # comprarem o último brinquedo ao mesmo tempo, a segunda espera a primeira terminar
        # e já enxerga o estoque atualizado (evita vender mais do que existe).
        return {b.pk: b for b in Brinquedo.objects.select_for_update().filter(pk__in=brinquedos_ids)}

    def existe_sku(self, sku):
        return Brinquedo.objects.filter(sku__iexact=sku).exists()

    def existe_sku_em_outro_brinquedo(self, sku, brinquedo_id):
        return Brinquedo.objects.filter(sku__iexact=sku).exclude(pk=brinquedo_id).exists()
