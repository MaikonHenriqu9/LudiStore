from catalogo.strategies.ordenacao_strategy import OrdenacaoStrategy


class OrdenarPorMenorPreco(OrdenacaoStrategy):

    def ordenar(self, brinquedos):
        return brinquedos.order_by('preco')
