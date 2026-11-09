from catalogo.strategies.ordenacao_strategy import OrdenacaoStrategy


class OrdenarPorMaiorPreco(OrdenacaoStrategy):

    def ordenar(self, brinquedos):
        return brinquedos.order_by('-preco')
