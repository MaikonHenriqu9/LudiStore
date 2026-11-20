from core import LoggerSistema, NaoEncontradoError, RegraDeNegocioError


class CadastroSimplesService:
    """Regras comuns às entidades que só têm "nome" e "ativo" (Marca e Categoria).

    Antes, MarcaService e CategoriaService repetiam o mesmo código. Agora a lógica
    fica aqui, uma vez só (DRY), e cada filha informa apenas o que muda:
    o Model, o Repository e o nome usado nas mensagens.
    """

    modelo = None           # ex.: Marca
    repository_class = None  # ex.: MarcaRepository
    nome_entidade = None    # ex.: 'Marca' (usado nas mensagens de erro e no log)

    def __init__(self):
        self.repository = self.repository_class()
        self.logger = LoggerSistema()

    def listar(self):
        return self.repository.listar_ativas()

    def buscar(self, registro_id, incluir_inativos=False):
        registro = self.repository.buscar_por_id(registro_id)

        if registro is None or (not registro.ativo and not incluir_inativos):
            raise NaoEncontradoError(f'{self.nome_entidade} não encontrada.')

        return registro

    def criar(self, dados):
        nome = dados['nome'].strip()

        if self.repository.existe_nome(nome):
            raise RegraDeNegocioError(f'{self.nome_entidade} já cadastrada.')

        registro = self.repository.salvar(self.modelo(nome=nome))
        self.logger.info(f'{self.nome_entidade} cadastrada: {registro.nome} id={registro.pk}')
        return registro

    def atualizar(self, registro_id, dados):
        registro = self.buscar(registro_id)
        nome = dados['nome'].strip()

        if self.repository.existe_nome(nome, ignorar_id=registro_id):
            raise RegraDeNegocioError(f'{self.nome_entidade} já cadastrada.')

        registro.nome = nome
        registro = self.repository.salvar(registro)
        self.logger.info(f'{self.nome_entidade} atualizada: id={registro.pk}')
        return registro

    def desativar(self, registro_id):
        registro = self.buscar(registro_id)
        registro.ativo = False
        self.repository.salvar(registro)
        self.logger.info(f'{self.nome_entidade} desativada: id={registro.pk}')

    def reativar(self, registro_id):
        registro = self.buscar(registro_id, incluir_inativos=True)

        if registro.ativo:
            raise RegraDeNegocioError(f'{self.nome_entidade} já está ativa.')

        registro.ativo = True
        registro = self.repository.salvar(registro)
        self.logger.info(f'{self.nome_entidade} reativada: id={registro.pk}')
        return registro
