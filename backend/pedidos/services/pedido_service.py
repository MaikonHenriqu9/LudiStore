from collections import defaultdict

from django.db import transaction

from catalogo.repositories import BrinquedoRepository
from core import LoggerSistema, NaoEncontradoError, RegraDeNegocioError
from pedidos.models import ItemPedido, Pedido
from pedidos.repositories import PedidoRepository
from usuarios.models import Usuario
from usuarios.repositories import UsuarioRepository


class PedidoService:

    def __init__(self):
        self.repository = PedidoRepository()
        self.brinquedo_repository = BrinquedoRepository()
        self.usuario_repository = UsuarioRepository()
        self.logger = LoggerSistema()

    # RN12: tudo aqui dentro é UMA transação. Se qualquer regra falhar no meio,
    # o banco desfaz tudo: nenhum pedido, nenhum item e nenhuma baixa de estoque.
    @transaction.atomic
    def criar(self, dados):
        comprador = self._buscar_usuario_ativo(dados['comprador_id'], 'Comprador')
        quantidades = self._somar_itens_repetidos(dados['itens'])

        # Trava os brinquedos do pedido até o fim da transação (ver BrinquedoRepository)
        brinquedos = self.brinquedo_repository.buscar_para_compra(quantidades.keys())

        itens = []
        total = 0

        for brinquedo_id, quantidade in quantidades.items():
            brinquedo = brinquedos.get(brinquedo_id)

            if brinquedo is None or not brinquedo.ativo:
                raise RegraDeNegocioError(f'Brinquedo {brinquedo_id} não está disponível.')

            # RN10: o vendedor não pode comprar o próprio produto
            if brinquedo.vendedor_id == comprador.pk:
                raise RegraDeNegocioError(f'Você não pode comprar o próprio produto: {brinquedo.nome}.')

            # RN11: não é possível comprar mais do que o estoque
            if quantidade > brinquedo.estoque:
                raise RegraDeNegocioError(
                    f'Estoque insuficiente para {brinquedo.nome}: disponível {brinquedo.estoque}, pedido {quantidade}.'
                )

            # RN13: o item guarda o preço de agora
            item = ItemPedido(brinquedo=brinquedo, quantidade=quantidade, preco_unitario=brinquedo.preco)
            itens.append(item)
            total += item.subtotal

            brinquedo.estoque -= quantidade
            self.brinquedo_repository.salvar(brinquedo)

        pedido = self.repository.salvar(Pedido(comprador=comprador, total=total))

        for item in itens:
            item.pedido = pedido
        self.repository.salvar_itens(itens)

        self.logger.info(f'Pedido {pedido.pk} confirmado: {comprador.nome}, {len(itens)} item(ns), total R$ {total}')
        return self.repository.buscar_por_id(pedido.pk)

    def buscar(self, pedido_id):
        pedido = self.repository.buscar_por_id(pedido_id)

        if pedido is None:
            raise NaoEncontradoError('Pedido não encontrado.')

        return pedido

    def listar(self, comprador_id=None):
        if comprador_id is None:
            return self.repository.listar_todos()

        # RN15: o histórico de compras de um usuário
        self._buscar_usuario_ativo(comprador_id, 'Comprador')
        return self.repository.listar_por_comprador(comprador_id)

    def listar_vendas(self, vendedor_id):
        # RN14: as vendas dos brinquedos de um vendedor
        vendedor = self._buscar_usuario_ativo(vendedor_id, 'Vendedor')

        if vendedor.perfil not in (Usuario.Perfil.VENDEDOR, Usuario.Perfil.ADMIN):
            raise RegraDeNegocioError('Este usuário não é vendedor.')

        return self.repository.listar_vendas_do_vendedor(vendedor_id)

    def _buscar_usuario_ativo(self, usuario_id, papel):
        usuario = self.usuario_repository.buscar_por_id(usuario_id)

        if usuario is None or not usuario.ativo:
            raise NaoEncontradoError(f'{papel} não encontrado.')

        return usuario

    def _somar_itens_repetidos(self, itens):
        # [{brinquedo 1, qtd 2}, {brinquedo 1, qtd 3}]  vira  {1: 5}
        quantidades = defaultdict(int)

        for item in itens:
            quantidades[item['brinquedo_id']] += item['quantidade']

        return dict(quantidades)
