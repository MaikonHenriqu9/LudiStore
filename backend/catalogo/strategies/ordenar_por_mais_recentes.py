from catalogo.strategies.ordenacao_strategy import OrdenacaoStrategy


class OrdenarPorMaisRecentes(OrdenacaoStrategy):

    def ordenar(self, brinquedos):
        return brinquedos.order_by('-criado_em')
