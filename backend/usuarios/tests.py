from django.contrib.auth.hashers import check_password
from rest_framework import status
from rest_framework.test import APITestCase

from usuarios.models import Usuario

URL = '/api/usuarios/'


def dados_cliente(**extra):
    """Um cadastro de cliente PF válido. O **extra troca ou acrescenta campos."""
    return {
        'nome': 'Ana Souza',
        'email': 'ana@email.com',
        'senha': '123456',
        'tipo_pessoa': 'PF',
        'cpf': '12345678900',
        **extra,
    }


def dados_vendedor_pj(**extra):
    """Um cadastro de vendedor PJ válido."""
    return {
        'nome': 'Brinquedos Ltda',
        'email': 'loja@email.com',
        'senha': '123456',
        'perfil': 'VENDEDOR',
        'tipo_pessoa': 'PJ',
        'cnpj': '12345678000199',
        'telefone': '1133334444',
        **extra,
    }


class CadastroUsuarioTests(APITestCase):

    def test_ct01_cadastra_cliente_com_dados_validos(self):
        resposta = self.client.post(URL, dados_cliente(), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resposta.data['perfil'], Usuario.Perfil.CLIENTE)
        self.assertEqual(resposta.data['tipo_pessoa'], Usuario.TipoPessoa.FISICA)
        self.assertNotIn('senha', resposta.data)

        usuario = Usuario.objects.get(email='ana@email.com')
        self.assertNotEqual(usuario.senha, '123456')
        self.assertTrue(check_password('123456', usuario.senha))

    def test_ct02_recusa_email_ja_cadastrado_mesmo_com_outra_caixa(self):
        self.client.post(URL, dados_cliente(), format='json')

        resposta = self.client.post(
            URL, dados_cliente(nome='Outra Ana', email=' ANA@Email.com ', cpf='99988877766'), format='json'
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'E-mail já cadastrado.')
        self.assertEqual(Usuario.objects.count(), 1)

    def test_ct03_recusa_vendedor_pessoa_fisica_sem_cpf(self):
        dados = dados_cliente(perfil='VENDEDOR', telefone='11999998888')
        del dados['cpf']

        resposta = self.client.post(URL, dados, format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'CPF é obrigatório para pessoa física.')
        self.assertFalse(Usuario.objects.exists())

    def test_ct04_bloqueia_cadastro_publico_como_admin(self):
        resposta = self.client.post(URL, dados_cliente(perfil='ADMIN'), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'Perfil inválido. Escolha CLIENTE ou VENDEDOR.')
        self.assertFalse(Usuario.objects.filter(perfil=Usuario.Perfil.ADMIN).exists())

    def test_ct06_cadastra_vendedor_pessoa_juridica_com_cnpj(self):
        resposta = self.client.post(URL, dados_vendedor_pj(), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resposta.data['perfil'], Usuario.Perfil.VENDEDOR)
        self.assertEqual(resposta.data['cnpj'], '12345678000199')
        self.assertIsNone(resposta.data['cpf'])

    def test_ct07_recusa_pessoa_juridica_sem_cnpj(self):
        dados = dados_vendedor_pj()
        del dados['cnpj']

        resposta = self.client.post(URL, dados, format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'CNPJ é obrigatório para pessoa jurídica.')

    def test_ct08_recusa_cnpj_ja_cadastrado(self):
        self.client.post(URL, dados_vendedor_pj(), format='json')

        resposta = self.client.post(URL, dados_vendedor_pj(email='outra@email.com'), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'CNPJ já cadastrado.')

    def test_ct09_recusa_documento_com_pontuacao(self):
        resposta = self.client.post(URL, dados_cliente(cpf='123.456.789-00'), format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cpf', resposta.data)
        self.assertFalse(Usuario.objects.exists())


class ConsultaEAtualizacaoUsuarioTests(APITestCase):

    def setUp(self):
        self.ana = self.client.post(URL, dados_cliente(), format='json').data
        self.loja = self.client.post(URL, dados_vendedor_pj(), format='json').data

    def test_ct10_pesquisa_por_nome_email_e_id(self):
        por_nome = self.client.get(URL, {'busca': 'ana'})
        por_email = self.client.get(URL, {'busca': 'loja@'})
        por_id = self.client.get(URL, {'busca': str(self.loja['id'])})

        self.assertEqual([u['nome'] for u in por_nome.data], ['Ana Souza'])
        self.assertEqual([u['nome'] for u in por_email.data], ['Brinquedos Ltda'])
        self.assertEqual([u['nome'] for u in por_id.data], ['Brinquedos Ltda'])

    def test_ct11_permite_salvar_o_proprio_email_na_atualizacao(self):
        resposta = self.client.patch(
            f"{URL}{self.ana['id']}/", {'email': 'ana@email.com', 'telefone': '11999990000'}, format='json'
        )

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data['telefone'], '11999990000')

    def test_ct12_vendedor_nao_pode_apagar_o_telefone(self):
        resposta = self.client.patch(f"{URL}{self.loja['id']}/", {'telefone': ''}, format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'Telefone é obrigatório para vendedores.')
        self.assertEqual(Usuario.objects.get(pk=self.loja['id']).telefone, '1133334444')

    def test_ct13_desativa_e_reativa_usuario(self):
        url_ana = f"{URL}{self.ana['id']}/"

        self.assertEqual(self.client.delete(url_ana).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Usuario.objects.get(pk=self.ana['id']).ativo)
        self.assertEqual(self.client.patch(url_ana, {'nome': 'X'}, format='json').status_code, status.HTTP_404_NOT_FOUND)

        resposta = self.client.patch(f'{url_ana}reativar/')

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertTrue(resposta.data['ativo'])

    def test_ct14_responde_404_para_usuario_inexistente(self):
        resposta = self.client.get(f'{URL}99999/')

        self.assertEqual(resposta.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(resposta.data['erro'], 'Usuário não encontrado.')
