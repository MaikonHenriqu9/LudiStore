from abc import ABC, abstractmethod


class OrdenacaoStrategy(ABC):

    @abstractmethod
    def ordenar(self, brinquedos):
        pass
