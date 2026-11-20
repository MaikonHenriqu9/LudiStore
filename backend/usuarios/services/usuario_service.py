from django.contrib.auth.hashers import make_password

from core import LoggerSistema, NaoEncontradoError, RegraDeNegocioError
from usuarios.factories import AdminFactory, ClienteFactory, VendedorFactory
from usuarios.repositories import UsuarioRepository


class UsuarioService:
    # Cadastro público: o ADMIN fica de fora de propósito (é criado pelo shell).
    FACTORIES_CADASTRO = {
        'CLIENTE': ClienteFactory(),
        'VENDEDOR': VendedorFactory(),
    }

    # Atualização: qualquer perfil, para aplicar as regras de cada um.
    FACTORIES_POR_PERFIL = {
        'CLIENTE': ClienteFactory(),
        'VENDEDOR': VendedorFactory(),
        'ADMIN': AdminFactory(),
    }

    def __init__(self):
        self.repository = UsuarioRepository()
        self.logger = LoggerSistema()

    def cadastrar(self, dados):
        # 1. Perfil: o filtro mais barato, porque não consulta o banco
        perfil = dados.pop('perfil', 'CLIENTE')
        factory = self.FACTORIES_CADASTRO.get(perfil)

        if factory is None:
            self.logger.aviso(f'Cadastro bloqueado: tentativa com perfil {perfil} ({dados.get("email")})')
            raise RegraDeNegocioError('Perfil inválido. Escolha CLIENTE ou VENDEDOR.')

        # 2. E-mail repetido
        self._normalizar_email(dados)

        if self.repository.existe_email(dados['email']):
            raise RegraDeNegocioError('E-mail já cadastrado.')

        # 3. Documentos: vazio vira None; repetido é barrado
        self._normalizar_documentos(dados)

        if dados.get('cpf') and self.repository.existe_cpf(dados['cpf']):
            raise RegraDeNegocioError('CPF já cadastrado.')

        if dados.get('cnpj') and self.repository.existe_cnpj(dados['cnpj']):
            raise RegraDeNegocioError('CNPJ já cadastrado.')

        # 4. A fábrica valida e monta, o repositório salva
        usuario = self.repository.salvar(factory.criar(dados))
        self.logger.info(f'Usuário cadastrado: {usuario.nome} ({usuario.perfil}) id={usuario.pk}')
        return usuario

    def listar(self):
        return self.repository.listar_todos()

    def busca_completa(self, termo):
        return self.repository.pesquisar_usuario(termo)

    def buscar(self, usuario_id, incluir_inativos=False):
        usuario = self.repository.buscar_por_id(usuario_id)

        if usuario is None or (not usuario.ativo and not incluir_inativos):
            raise NaoEncontradoError('Usuário não encontrado.')

        return usuario

    def atualizar(self, usuario_id, dados):
        # A. Achar o usuário (404 se não existe ou está desativado)
        usuario = self.buscar(usuario_id)

        # B. E-mail repetido em OUTRO usuário
        self._normalizar_email(dados)
        email = dados.get('email')

        if email and self.repository.existe_email_em_outro_usuario(email, usuario_id):
            raise RegraDeNegocioError('E-mail já cadastrado.')

        # C. Documentos: vazio vira None; repetido em OUTRO usuário é barrado
        self._normalizar_documentos(dados)

        if dados.get('cpf') and self.repository.existe_cpf_em_outro_usuario(dados['cpf'], usuario_id):
            raise RegraDeNegocioError('CPF já cadastrado.')

        if dados.get('cnpj') and self.repository.existe_cnpj_em_outro_usuario(dados['cnpj'], usuario_id):
            raise RegraDeNegocioError('CNPJ já cadastrado.')

        # D. Senha nova é criptografada
        if 'senha' in dados:
            dados['senha'] = make_password(dados['senha'])

        # E. Aplica só os campos enviados (PATCH)
        for campo, valor in dados.items():
            setattr(usuario, campo, valor)

        # F. Confere o estado FINAL com as regras do perfil (as mesmas do cadastro)
        self._validar_regras_do_perfil(usuario)

        # G. Salva e registra
        usuario = self.repository.salvar(usuario)
        self.logger.info(f'Usuário atualizado: id={usuario.pk}')
        return usuario

    def desativar(self, usuario_id):
        usuario = self.buscar(usuario_id)
        usuario.ativo = False
        self.repository.salvar(usuario)
        self.logger.info(f'Usuário desativado: id={usuario.pk}')

    def reativar(self, usuario_id):
        usuario = self.buscar(usuario_id, incluir_inativos=True)

        if usuario.ativo:
            raise RegraDeNegocioError('Usuário já está ativo.')

        usuario.ativo = True
        usuario = self.repository.salvar(usuario)
        self.logger.info(f'Usuário reativado: id={usuario.pk}')
        return usuario

    def _normalizar_email(self, dados):
        # "Ana@Email.com " e "ana@email.com" são a mesma pessoa
        if dados.get('email'):
            dados['email'] = dados['email'].strip().lower()

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
