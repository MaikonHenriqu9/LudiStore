from usuarios.factories import ClienteFactory, VendedorFactory, AdminFactory
from usuarios.repositories import UsuarioRepository
from django.contrib.auth.hashers import make_password
from core import LoggerSistema

class UsuarioService:
    FACTORIES_CADASTRO = {
        'CLIENTE': ClienteFactory(),
        'VENDEDOR': VendedorFactory(),
    }

    FACTORIES_POR_PERFIL = {
        'CLIENTE': ClienteFactory(),
        'VENDEDOR': VendedorFactory(),
        'ADMIN': AdminFactory()
    }

    def __init__(self):
        self.repository = UsuarioRepository()
        self.logger = LoggerSistema()


    def cadastrar(self, dados):
        perfil = dados.pop('perfil', 'CLIENTE')
        factory = self.FACTORIES_CADASTRO.get(perfil)
        
        if factory is None:
            self.logger.aviso(f'Cadastro bloqueado: tentativa com perfil {perfil} ({dados.get("email")})')
            raise ValueError('Perfil inválido. Escolha CLIENTE ou VENDEDOR.')
        
        if self.repository.existe_email(dados.get('email')):
            raise ValueError('E-mail já cadastrado.')

        self._normalizar_documentos(dados)

        if dados.get('cpf') and self.repository.existe_cpf(dados['cpf']):
            raise ValueError('CPF já cadastrado.')
        
        if dados.get('cnpj') and self.repository.existe_cnpj(dados['cnpj']):
            raise ValueError('CNPJ já cadastrado.')

        usuario = self.repository.salvar(factory.criar(dados))
        self.logger.info(f'Usuário cadastrado: {usuario.nome} ({usuario.perfil}) id={usuario.pk}')
        return usuario


    def listar(self):
        return self.repository.listar_todos()


    def buscar(self, usuario_id):
        usuario = self.repository.buscar_por_id(usuario_id)

        if usuario is None or not usuario.ativo:
            raise LookupError('Usuário não encontrado.')

        return usuario

    def busca_completa(self, termo):
        return self.repository.pesquisar_usuario(termo)

    def atualizar(self, usuario_id, dados):
        usuario = self.buscar(usuario_id)
        email = dados.get('email')

        if email and self.repository.existe_email_em_outro_usuario(email, usuario_id):
            raise ValueError('E-mail já cadastrado.')

        self._normalizar_documentos(dados)

        if dados.get('cpf') and self.repository.existe_cpf_em_outro_usuario(dados['cpf'], usuario_id):
            raise ValueError('CPF já cadastrado.')
        
        if dados.get('cnpj') and self.repository.existe_cnpj_em_outro_usuario(dados['cnpj'], usuario_id):
            raise ValueError('CNPJ já cadastrado.')

        if 'senha' in dados:
            dados['senha'] = make_password(dados['senha'])

        for campo, valor in dados.items():
            setattr(usuario, campo, valor)

        self._validar_regras_do_perfil(usuario)

        usuario = self.repository.salvar(usuario)
        self.logger.info(f'Usuário atualizado: id={usuario.pk}')
        return usuario


    def desativar(self, usuario_id):
        usuario = self.buscar(usuario_id)
        usuario.ativo = False
        self.repository.salvar(usuario)
        self.logger.info(f'Usuário desativado: id={usuario.pk}')


    def _normalizar_documentos(self, dados):
        if 'cpf' in dados and dados['cpf'] == '':
            dados['cpf'] = None

        if 'cnpj' in dados and dados['cnpj'] == '':
            dados['cnpj'] = None


    def _validar_regras_do_perfil(self, usuario):
        factory = self.FACTORIES_POR_PERFIL[usuario.perfil]
        factory.validar({
            'tipo_pessoa': usuario.tipo_pessoa,
            'cpf': usuario.cpf,
            'cnpj': usuario.cnpj,
            'telefone': usuario.telefone,
        })