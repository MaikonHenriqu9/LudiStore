from catalogo.strategies.ordenacao_strategy import OrdenacaoStrategy


class OrdenarPorNome(OrdenacaoStrategy):

    def ordenar(self, brinquedos):
        return brinquedos.order_by('nome')
