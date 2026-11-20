from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from catalogo.models import Brinquedo, Categoria, Marca
from catalogo.services import BrinquedoService
from usuarios.factories import AdminFactory, ClienteFactory, VendedorFactory
from usuarios.models import Usuario
from usuarios.repositories import UsuarioRepository

# ------------------------------------------------------------------
# Dados de exemplo para DESENVOLVIMENTO. As senhas são fictícias e
# servem só para o banco local do Docker. Nunca use em produção.
# ------------------------------------------------------------------
SENHA_ADMIN = 'admin123'
SENHA_PADRAO = 'senha123'

USUARIOS = [
    (AdminFactory(), {'nome': 'Administrador LudiStore', 'email': 'admin@ludistore.com', 'senha': SENHA_ADMIN}),
    (AdminFactory(), {'nome': 'Suporte LudiStore', 'email': 'suporte@ludistore.com', 'senha': SENHA_ADMIN}),
    (VendedorFactory(), {
        'nome': 'Sandra Rodrigues', 'email': 'sandra@email.com', 'senha': SENHA_PADRAO,
        'tipo_pessoa': 'PF', 'cpf': '12345678900', 'telefone': '11988887777',
        'cep': '01310100', 'logradouro': 'Avenida Paulista', 'numero': '1000',
        'bairro': 'Bela Vista', 'cidade': 'São Paulo', 'uf': 'SP',
    }),
    (VendedorFactory(), {
        'nome': 'Mundo dos Brinquedos Ltda', 'email': 'contato@mundodosbrinquedos.com', 'senha': SENHA_PADRAO,
        'tipo_pessoa': 'PJ', 'cnpj': '12345678000199', 'telefone': '1133334444',
        'cep': '11010000', 'logradouro': 'Rua XV de Novembro', 'numero': '50',
        'bairro': 'Centro', 'cidade': 'Santos', 'uf': 'SP',
    }),
    (ClienteFactory(), {
        'nome': 'Ana Souza', 'email': 'ana@email.com', 'senha': SENHA_PADRAO,
        'tipo_pessoa': 'PF', 'cpf': '11122233344', 'data_nascimento': '1995-04-12', 'sexo': 'F',
    }),
    (ClienteFactory(), {
        'nome': 'Bruno Lima', 'email': 'bruno@email.com', 'senha': SENHA_PADRAO,
        'tipo_pessoa': 'PF', 'cpf': '55566677788', 'telefone': '11977776666', 'sexo': 'M',
    }),
    (ClienteFactory(), {
        'nome': 'Escola Pequeno Saber', 'email': 'compras@pequenosaber.edu.br', 'senha': SENHA_PADRAO,
        'tipo_pessoa': 'PJ', 'cnpj': '98765432000110',
    }),
]

MARCAS = ['Estrela', 'Grow', 'Hasbro', 'LEGO', 'Mattel', 'Xalingo']

CATEGORIAS = ['Bonecas', 'Carrinhos', 'Jogos de Tabuleiro', 'Blocos de Montar', 'Pelúcias', 'Educativos']

# (sku, nome, preço, estoque, idade mínima, marca, categorias, e-mail do vendedor)
BRINQUEDOS = [
    ('EST-BON-001', 'Boneca Fofinha', '89.90', 15, 3, 'Estrela', ['Bonecas'], 'sandra@email.com'),
    ('MAT-CAR-001', 'Carrinho Hot Wheels Turbo', '29.90', 40, 3, 'Mattel', ['Carrinhos'], 'sandra@email.com'),
    ('GRO-JOG-001', 'Jogo Banco Imobiliário', '149.90', 10, 8, 'Grow', ['Jogos de Tabuleiro'], 'contato@mundodosbrinquedos.com'),
    ('LEG-BLO-001', 'LEGO Classic 500 peças', '299.90', 8, 4, 'LEGO', ['Blocos de Montar', 'Educativos'], 'contato@mundodosbrinquedos.com'),
    ('HAS-JOG-001', 'Jogo da Vida', '179.90', 6, 8, 'Hasbro', ['Jogos de Tabuleiro'], 'contato@mundodosbrinquedos.com'),
    ('XAL-EDU-001', 'Quebra-cabeça do Mapa do Brasil', '59.90', 20, 5, 'Xalingo', ['Educativos'], 'sandra@email.com'),
    ('EST-PEL-001', 'Urso de Pelúcia Gigante', '119.90', 5, 0, 'Estrela', ['Pelúcias'], 'sandra@email.com'),
    ('MAT-BON-001', 'Barbie Aventura', '139.90', 12, 3, 'Mattel', ['Bonecas'], 'contato@mundodosbrinquedos.com'),
]


class Command(BaseCommand):
    help = 'Popula o banco com usuários, marcas, categorias e brinquedos de exemplo (só para desenvolvimento).'

    @transaction.atomic
    def handle(self, *args, **options):
        repositorio = UsuarioRepository()
        criados = {'usuários': 0, 'marcas': 0, 'categorias': 0, 'brinquedos': 0}

        # Usuários: passam pelas Factories (senha criptografada e regras do perfil)
        for factory, dados in USUARIOS:
            if not repositorio.existe_email(dados['email']):
                repositorio.salvar(factory.criar(dict(dados)))
                criados['usuários'] += 1

        for nome in MARCAS:
            _, novo = Marca.objects.get_or_create(nome=nome)
            criados['marcas'] += novo

        for nome in CATEGORIAS:
            _, novo = Categoria.objects.get_or_create(nome=nome)
            criados['categorias'] += novo

        # Brinquedos: passam pelo BrinquedoService (mesmas regras da API)
        servico = BrinquedoService()
        for sku, nome, preco, estoque, idade, marca, categorias, email_vendedor in BRINQUEDOS:
            if Brinquedo.objects.filter(sku=sku).exists():
                continue

            servico.criar({
                'sku': sku,
                'nome': nome,
                'preco': Decimal(preco),
                'estoque': estoque,
                'idade_minima': idade,
                'marca_id': Marca.objects.get(nome=marca).pk,
                'vendedor_id': Usuario.objects.get(email=email_vendedor).pk,
                'categorias_ids': list(Categoria.objects.filter(nome__in=categorias).values_list('pk', flat=True)),
            })
            criados['brinquedos'] += 1

        resumo = ', '.join(f'{quantidade} {tipo}' for tipo, quantidade in criados.items())
        self.stdout.write(self.style.SUCCESS(f'Banco populado: {resumo} criados.'))
        self.stdout.write('Rodar de novo não duplica nada: o que já existe é ignorado.')

