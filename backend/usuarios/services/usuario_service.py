from usuarios.factories import ClienteFactory, VendedorFactory
from usuarios.repositories import UsuarioRepository
from django.contrib.auth.hashers import make_password
from usuarios.models import Usuario
from core import LoggerSistema

class UsuarioService:

    FACTORIES_CADASTRO = {
        'CLIENTE': ClienteFactory(),
        'VENDEDOR': VendedorFactory(),
    }

    def __init__(self):
        self.repository = UsuarioRepository()
        self.logger = LoggerSistema()

    def cadastrar(self, dados):
        if self.repository.existe_email(dados.get('email')):
            raise ValueError('E-mail já cadastrado.')

        if not dados.get('cpf'):
            dados['cpf'] = None
        elif self.repository.existe_cpf(dados['cpf']):
            raise ValueError('CPF já cadastrado.')

        perfil = dados.pop('perfil', 'CLIENTE')
        factory = self.FACTORIES_CADASTRO.get(perfil)

        if factory is None:
            self.logger.aviso(f'Cadastro bloqueado: tentativa com perfil {perfil} ({dados.get("email")})')
            raise ValueError('Perfil inválido. Escolha CLIENTE ou VENDEDOR.')

        usuario = self.repository.salvar(factory.criar(dados))
        self.logger.info(f'Usuário cadastrado: {usuario.nome} ({usuario.perfil}) id={usuario.id}')
        return usuario

    def listar(self):
        return self.repository.listar_ativos()

    def buscar(self, usuario_id):
        usuario = self.repository.buscar_por_id(usuario_id)

        if usuario is None or not usuario.ativo:
            raise LookupError('Usuário não encontrado.')

        return usuario

    def atualizar(self, usuario_id, dados):
        usuario = self.buscar(usuario_id)

        email = dados.get('email')
        if email and self.repository.existe_email_em_outro_usuario(email, usuario_id):
            raise ValueError('E-mail já cadastrado.')

        if 'cpf' in dados:
            if not dados['cpf']:
                dados['cpf'] = None
            elif self.repository.existe_cpf_em_outro_usuario(dados['cpf'], usuario_id):
                raise ValueError('CPF já cadastrado.')

        if 'senha' in dados:
            dados['senha'] = make_password(dados['senha'])

        for campo, valor in dados.items():
            setattr(usuario, campo, valor)

        if usuario.perfil == Usuario.Perfil.VENDEDOR and not (usuario.cpf and usuario.telefone):
            raise ValueError('CPF e telefone são obrigatórios para vendedores.')

        usuario = self.repository.salvar(usuario)
        self.logger.info(f'Usuário atualizado: id={usuario.id}')
        return usuario

    def desativar(self, usuario_id):
        usuario = self.buscar(usuario_id)
        usuario.ativo = False
        self.repository.salvar(usuario)
        self.logger.info(f'Usuário desativado: id={usuario.id}')