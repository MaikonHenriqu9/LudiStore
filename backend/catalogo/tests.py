from rest_framework import status
from rest_framework.test import APITestCase

from catalogo.models import Brinquedo, Categoria, Marca
from usuarios.models import Usuario

URL_BRINQUEDOS = '/api/brinquedos/'


class CatalogoBaseTests(APITestCase):
    """Prepara um vendedor, um admin, uma marca e uma categoria para os testes do catálogo."""

    def setUp(self):
        self.vendedor = Usuario.objects.create(
            nome='Sandra Rodrigues',
            email='sandra@email.com',
            senha='hash-qualquer',
            perfil=Usuario.Perfil.VENDEDOR,
            cpf='12345678900',
            telefone='11988887777',
        )
        self.admin = Usuario.objects.create(
            nome='Admin', email='admin@ludistore.com', senha='hash-qualquer', perfil=Usuario.Perfil.ADMIN
        )
        self.marca = Marca.objects.create(nome='Estrela')
        self.categoria = Categoria.objects.create(nome='Bonecas')

    def logar_como(self, usuario):
        # Simula o login (o login de verdade, com token, é testado em usuarios/tests.py)
        self.client.force_authenticate(user=usuario)

    def dados_brinquedo(self, **extra):
        return {
            'sku': 'EST-BON-001',
            'nome': 'Boneca Fofinha',
            'preco': '89.90',
            'estoque': 5,
            'marca_id': self.marca.pk,
            'categorias_ids': [self.categoria.pk],
            **extra,
        }


class CadastroBrinquedoTests(CatalogoBaseTests):

    def test_ct05_recusa_brinquedo_com_preco_negativo(self):
        self.logar_como(self.vendedor)
        resposta = self.client.post(URL_BRINQUEDOS, self.dados_brinquedo(preco=-10), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('preco', resposta.data)
        self.assertEqual(Brinquedo.objects.count(), 0)

    def test_ct15_cadastra_brinquedo_em_nome_do_vendedor_logado(self):
        self.logar_como(self.vendedor)
        resposta = self.client.post(URL_BRINQUEDOS, self.dados_brinquedo(), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resposta.data['marca'], 'Estrela')
        self.assertEqual(resposta.data['vendedor'], 'Sandra Rodrigues')
        self.assertEqual(resposta.data['categorias'], ['Bonecas'])

    def test_ct16_cliente_nao_cadastra_brinquedo(self):
        cliente = Usuario.objects.create(nome='Caio', email='caio@email.com', senha='x', cpf='99988877766')
        self.logar_como(cliente)

        resposta = self.client.post(URL_BRINQUEDOS, self.dados_brinquedo(), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resposta.data['erro'], 'Somente vendedores podem fazer isso.')
        self.assertEqual(Brinquedo.objects.count(), 0)


class CatalogoConsultaTests(CatalogoBaseTests):

    def setUp(self):
        super().setUp()
        self.logar_como(self.vendedor)
        for sku, nome, preco in [('A-1', 'Carrinho', '50.00'), ('A-2', 'Boneca', '120.00'), ('A-3', 'Peteca', '15.00')]:
            self.client.post(URL_BRINQUEDOS, self.dados_brinquedo(sku=sku, nome=nome, preco=preco), format='json')
        self.client = self.client_class()  # cliente novo, sem login: o catálogo é público

    def test_ct17_ordena_catalogo_pelo_menor_preco(self):
        resposta = self.client.get(URL_BRINQUEDOS, {'ordem': 'menor_preco'})

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual([b['nome'] for b in resposta.data], ['Peteca', 'Carrinho', 'Boneca'])

    def test_ct18_recusa_ordenacao_invalida(self):
        resposta = self.client.get(URL_BRINQUEDOS, {'ordem': 'aleatoria'})

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Ordenação inválida', resposta.data['erro'])

    def test_ct19_brinquedo_desativado_some_do_catalogo(self):
        boneca = Brinquedo.objects.get(sku='A-2')
        self.logar_como(self.vendedor)

        self.client.delete(f'{URL_BRINQUEDOS}{boneca.pk}/')
        resposta = self.client.get(URL_BRINQUEDOS)

        self.assertNotIn('Boneca', [b['nome'] for b in resposta.data])
        self.assertTrue(Brinquedo.objects.filter(pk=boneca.pk).exists())

    def test_ct37_vendedor_nao_altera_brinquedo_de_outro_vendedor(self):
        outro = Usuario.objects.create(
            nome='Beto', email='beto@email.com', senha='x',
            perfil=Usuario.Perfil.VENDEDOR, cpf='55566677788', telefone='11977776666',
        )
        boneca = Brinquedo.objects.get(sku='A-2')
        self.logar_como(outro)

        resposta = self.client.patch(f'{URL_BRINQUEDOS}{boneca.pk}/', {'preco': '1.00'}, format='json')

        self.assertEqual(resposta.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resposta.data['erro'], 'Você só pode alterar os próprios brinquedos.')
        boneca.refresh_from_db()
        self.assertEqual(str(boneca.preco), '120.00')


class MarcaECategoriaTests(CatalogoBaseTests):

    def setUp(self):
        super().setUp()
        self.logar_como(self.admin)

    def test_ct20_recusa_marca_repetida_ignorando_maiusculas(self):
        resposta = self.client.post('/api/marcas/', {'nome': 'ESTRELA'}, format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'Marca já cadastrada.')

    def test_ct21_desativa_e_reativa_categoria(self):
        url = f'/api/categorias/{self.categoria.pk}/'

        self.assertEqual(self.client.delete(url).status_code, status.HTTP_204_NO_CONTENT)
        self.assertNotIn('Bonecas', [c['nome'] for c in self.client.get('/api/categorias/').data])

        resposta = self.client.patch(f'{url}reativar/')

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertTrue(resposta.data['ativo'])
