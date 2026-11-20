from django.contrib.auth.hashers import check_password, make_password
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


def criar_admin():
    return Usuario.objects.create(
        nome='Admin', email='admin@ludistore.com', senha=make_password('admin123'), perfil=Usuario.Perfil.ADMIN
    )


class ConsultaEAtualizacaoUsuarioTests(APITestCase):

    def setUp(self):
        self.ana = self.client.post(URL, dados_cliente(), format='json').data
        self.loja = self.client.post(URL, dados_vendedor_pj(), format='json').data
        self.admin = criar_admin()

    def logar_como(self, usuario_id):
        # force_authenticate simula o login, sem precisar do token (o login de verdade é testado abaixo)
        self.client.force_authenticate(user=Usuario.objects.get(pk=usuario_id))

    def test_ct10_pesquisa_por_nome_email_e_id(self):
        self.logar_como(self.admin.pk)

        por_nome = self.client.get(URL, {'busca': 'ana'})
        por_email = self.client.get(URL, {'busca': 'loja@'})
        por_id = self.client.get(URL, {'busca': str(self.loja['id'])})

        self.assertEqual([u['nome'] for u in por_nome.data], ['Ana Souza'])
        self.assertEqual([u['nome'] for u in por_email.data], ['Brinquedos Ltda'])
        self.assertEqual([u['nome'] for u in por_id.data], ['Brinquedos Ltda'])

    def test_ct11_permite_salvar_o_proprio_email_na_atualizacao(self):
        self.logar_como(self.ana['id'])
        resposta = self.client.patch(
            f"{URL}{self.ana['id']}/", {'email': 'ana@email.com', 'telefone': '11999990000'}, format='json'
        )

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data['telefone'], '11999990000')

    def test_ct12_vendedor_nao_pode_apagar_o_telefone(self):
        self.logar_como(self.loja['id'])
        resposta = self.client.patch(f"{URL}{self.loja['id']}/", {'telefone': ''}, format='json')

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resposta.data['erro'], 'Telefone é obrigatório para vendedores.')
        self.assertEqual(Usuario.objects.get(pk=self.loja['id']).telefone, '1133334444')

    def test_ct13_desativa_e_reativa_usuario(self):
        self.logar_como(self.admin.pk)
        url_ana = f"{URL}{self.ana['id']}/"

        self.assertEqual(self.client.delete(url_ana).status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Usuario.objects.get(pk=self.ana['id']).ativo)
        self.assertEqual(self.client.patch(url_ana, {'nome': 'X'}, format='json').status_code, status.HTTP_404_NOT_FOUND)

        resposta = self.client.patch(f'{url_ana}reativar/')

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertTrue(resposta.data['ativo'])

    def test_ct14_responde_404_para_usuario_inexistente(self):
        self.logar_como(self.admin.pk)
        resposta = self.client.get(f'{URL}99999/')

        self.assertEqual(resposta.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(resposta.data['erro'], 'Usuário não encontrado.')


class AutenticacaoTests(APITestCase):
    """Login de verdade, com o token no cabeçalho Authorization."""

    URL_LOGIN = '/api/auth/login/'

    def setUp(self):
        self.client.post(URL, dados_cliente(), format='json')
        self.client.post(URL, dados_vendedor_pj(), format='json')
        self.admin = criar_admin()

    def fazer_login(self, email, senha):
        return self.client.post(self.URL_LOGIN, {'email': email, 'senha': senha}, format='json')

    def usar_token(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_ct30_login_valido_devolve_token_e_identifica_o_usuario(self):
        resposta = self.fazer_login('ANA@email.com', '123456')

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertIn('token', resposta.data)
        self.assertNotIn('senha', resposta.data['usuario'])

        self.usar_token(resposta.data['token'])
        eu = self.client.get('/api/auth/eu/')

        self.assertEqual(eu.status_code, status.HTTP_200_OK)
        self.assertEqual(eu.data['email'], 'ana@email.com')

    def test_ct31_recusa_senha_errada_sem_revelar_o_motivo(self):
        senha_errada = self.fazer_login('ana@email.com', 'errada')
        email_inexistente = self.fazer_login('ninguem@email.com', '123456')

        self.assertEqual(senha_errada.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(senha_errada.data['erro'], 'E-mail ou senha inválidos.')
        self.assertEqual(email_inexistente.data['erro'], senha_errada.data['erro'])

    def test_ct32_rota_protegida_exige_login(self):
        resposta = self.client.get(URL)

        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_ct33_cliente_nao_gerencia_usuarios_nem_marcas(self):
        self.usar_token(self.fazer_login('ana@email.com', '123456').data['token'])

        listar_usuarios = self.client.get(URL)
        criar_marca = self.client.post('/api/marcas/', {'nome': 'Nova'}, format='json')

        self.assertEqual(listar_usuarios.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(criar_marca.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(criar_marca.data['erro'], 'Somente o administrador pode fazer isso.')

    def test_ct34_usuario_nao_ve_o_cadastro_de_outro(self):
        self.usar_token(self.fazer_login('ana@email.com', '123456').data['token'])
        loja = Usuario.objects.get(email='loja@email.com')

        resposta = self.client.get(f'{URL}{loja.pk}/')

        self.assertEqual(resposta.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resposta.data['erro'], 'Você só pode ver o próprio cadastro.')

    def test_ct35_usuario_desativado_nao_faz_login(self):
        Usuario.objects.filter(email='ana@email.com').update(ativo=False)

        resposta = self.fazer_login('ana@email.com', '123456')

        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resposta.data['erro'], 'Usuário desativado. Procure o administrador.')

    def test_ct36_recusa_token_adulterado(self):
        token = self.fazer_login('ana@email.com', '123456').data['token']
        self.usar_token(token[:-3] + 'abc')

        resposta = self.client.get('/api/auth/eu/')

        self.assertEqual(resposta.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resposta.data['erro'], 'Token inválido.')
