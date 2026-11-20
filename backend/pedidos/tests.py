from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from catalogo.models import Brinquedo, Categoria, Marca
from pedidos.models import ItemPedido, Pedido
from usuarios.models import Usuario

URL = '/api/pedidos/'


class PedidoBaseTests(APITestCase):
    """Uma vendedora com dois brinquedos e uma cliente para comprar."""

    def setUp(self):
        self.vendedora = Usuario.objects.create(
            nome='Sandra', email='sandra@email.com', senha='x',
            perfil=Usuario.Perfil.VENDEDOR, cpf='12345678900', telefone='11988887777',
        )
        self.cliente = Usuario.objects.create(nome='Ana', email='ana@email.com', senha='x', cpf='11122233344')

        marca = Marca.objects.create(nome='Estrela')
        categoria = Categoria.objects.create(nome='Bonecas')

        self.boneca = Brinquedo.objects.create(
            sku='B-1', nome='Boneca', preco=Decimal('100.00'), estoque=5, marca=marca, vendedor=self.vendedora
        )
        self.carrinho = Brinquedo.objects.create(
            sku='C-1', nome='Carrinho', preco=Decimal('30.00'), estoque=2, marca=marca, vendedor=self.vendedora
        )
        self.boneca.categorias.add(categoria)
        self.carrinho.categorias.add(categoria)

    def comprar(self, comprador, *itens):
        """comprar(cliente, (boneca, 2), (carrinho, 1))"""
        corpo = {
            'comprador_id': comprador.pk,
            'itens': [{'brinquedo_id': b.pk, 'quantidade': q} for b, q in itens],
        }
        return self.client.post(URL, corpo, format='json')


class CriarPedidoTests(PedidoBaseTests):

    def test_ct22_cria_pedido_e_baixa_o_estoque(self):
        resposta = self.comprar(self.cliente, (self.boneca, 2), (self.carrinho, 1))

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resposta.data['status'], 'CONFIRMADO')
        self.assertEqual(resposta.data['total'], '230.00')
        self.assertEqual(len(resposta.data['itens']), 2)

        self.boneca.refresh_from_db()
        self.carrinho.refresh_from_db()
        self.assertEqual(self.boneca.estoque, 3)
        self.assertEqual(self.carrinho.estoque, 1)

    def test_ct23_vendedor_nao_compra_o_proprio_produto(self):
        resposta = self.comprar(self.vendedora, (self.boneca, 1))

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'Você não pode comprar o próprio produto: Boneca.')

    def test_ct24_recusa_quantidade_maior_que_o_estoque(self):
        resposta = self.comprar(self.cliente, (self.carrinho, 3))

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Estoque insuficiente para Carrinho', resposta.data['erro'])

    def test_ct25_pedido_e_transacional_nada_e_gravado_se_um_item_falhar(self):
        # A boneca é válida, mas o carrinho pede mais do que o estoque
        resposta = self.comprar(self.cliente, (self.boneca, 2), (self.carrinho, 10))

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Pedido.objects.count(), 0)
        self.assertEqual(ItemPedido.objects.count(), 0)

        self.boneca.refresh_from_db()
        self.assertEqual(self.boneca.estoque, 5)  # a baixa da boneca foi desfeita

    def test_ct26_item_guarda_o_preco_do_momento_da_compra(self):
        pedido_id = self.comprar(self.cliente, (self.boneca, 1)).data['id']

        self.boneca.preco = Decimal('150.00')
        self.boneca.save()

        resposta = self.client.get(f'{URL}{pedido_id}/')

        self.assertEqual(resposta.data['itens'][0]['preco_unitario'], '100.00')
        self.assertEqual(resposta.data['total'], '100.00')

    def test_ct27_recusa_brinquedo_desativado(self):
        self.boneca.ativo = False
        self.boneca.save()

        resposta = self.comprar(self.cliente, (self.boneca, 1))

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], f'Brinquedo {self.boneca.pk} não está disponível.')


class ConsultaPedidoTests(PedidoBaseTests):

    def setUp(self):
        super().setUp()
        self.comprar(self.cliente, (self.boneca, 2))
        self.comprar(self.cliente, (self.carrinho, 1))

    def test_ct28_vendedor_ve_as_vendas_dos_seus_produtos(self):
        resposta = self.client.get(f'{URL}vendas/', {'vendedor_id': self.vendedora.pk})

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resposta.data), 2)
        self.assertEqual({v['comprador'] for v in resposta.data}, {'Ana'})
        self.assertEqual(
            sorted((v['brinquedo'], v['quantidade'], v['subtotal']) for v in resposta.data),
            [('Boneca', 2, '200.00'), ('Carrinho', 1, '30.00')],
        )

    def test_ct29_usuario_ve_o_proprio_historico_de_compras(self):
        resposta = self.client.get(URL, {'comprador_id': self.cliente.pk})
        da_vendedora = self.client.get(URL, {'comprador_id': self.vendedora.pk})

        self.assertEqual(len(resposta.data), 2)
        self.assertEqual({p['comprador'] for p in resposta.data}, {'Ana'})
        self.assertEqual(da_vendedora.data, [])
