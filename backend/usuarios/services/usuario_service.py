from usuarios.factories import ClienteFactory, VendedorFactory
from usuarios.repositories import UsuarioRepository


class UsuarioService:

    FACTORIES_CADASTRO = {
        'CLIENTE': ClienteFactory(),
        'VENDEDOR': VendedorFactory(),
    }

    def __init__(self):
        self.repository = UsuarioRepository()

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
            raise ValueError('Perfil inválido. Escolha CLIENTE ou VENDEDOR.')

        usuario = factory.criar(dados)
        return self.repository.salvar(usuario)