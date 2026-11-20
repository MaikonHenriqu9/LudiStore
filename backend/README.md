# LudiStore: Back-end

API REST da **LudiStore**, um e-commerce de brinquedos. Projeto da disciplina **IES300 - Engenharia de Software III** (Tecnologia em Análise e Desenvolvimento de Sistemas).

O sistema tem três perfis de usuário:

| Perfil | O que pode fazer |
|---|---|
| **Administrador** | Acesso total: usuários, marcas, categorias e brinquedos |
| **Vendedor** | Cadastra e gerencia os próprios brinquedos e também pode comprar |
| **Cliente** | Visualiza o catálogo e compra |

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Python | 3.14 | Linguagem |
| Django | 5.2 LTS | Framework web e ORM |
| Django REST Framework | 3.18 | Construção da API REST |
| MySQL | 8.0 | Banco de dados |
| python-dotenv | 1.2 | Leitura das variáveis do arquivo `.env` |

> Escolhemos o **Django 5.2 LTS** (suporte até abril de 2028) pela estabilidade e pela compatibilidade com o MySQL 8.0 usado pela equipe.

---

## Arquitetura

O back-end segue a **Arquitetura em Camadas**. Cada camada conversa apenas com a camada logo abaixo:

```
React (front-end)
      │  HTTP / JSON
      ▼
┌─────────────────────────────────────────────────────────┐
│ Controller   recebe a requisição e devolve a resposta    │
│ DTO          valida o formato dos dados de entrada/saída │
│ Service      aplica as regras de negócio                 │
│ Repository   único ponto de acesso ao banco de dados     │
│ Model        estrutura dos dados (ORM)                   │
└─────────────────────────────────────────────────────────┘
      │
      ▼
   MySQL
```

| Camada | Equivalente no Spring | Pasta |
|---|---|---|
| Controller | `@RestController` | `controllers/` |
| DTO | DTO | `dtos/` |
| Service | `@Service` | `services/` |
| Repository | `JpaRepository` | `repositories/` |
| Model | `@Entity` | `models/` |

O código é dividido em **apps por área do negócio** (`usuarios`, `catalogo` e `pedidos`), e cada app tem as suas próprias camadas.

### Estrutura de pastas

```
backend/
├── config/            configurações do projeto (settings, rotas principais)
├── core/              recursos compartilhados
│   ├── logger_sistema.py      padrão Singleton
│   ├── excecoes.py            RegraDeNegocioError e NaoEncontradoError
│   ├── tratador_excecoes.py   converte as exceções em 400 e 404
│   ├── test_runner.py         roda os testes sem gravar log
│   └── management/commands/popular_banco.py
├── insomnia/          coleção de requisições para importar no Insomnia
├── usuarios/
│   ├── controllers/
│   ├── dtos/
│   ├── factories/     padrão Factory Method
│   ├── models/
│   ├── repositories/
│   ├── services/
│   └── urls.py
├── catalogo/
│   ├── controllers/
│   ├── dtos/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── strategies/    padrão Strategy
│   └── urls.py
├── pedidos/
│   ├── controllers/
│   ├── dtos/
│   ├── models/        Pedido e ItemPedido
│   ├── repositories/
│   ├── services/      compra em transação única
│   └── urls.py
├── docker-compose.yml MySQL 8.0 em container
├── manage.py
└── requirements.txt
```

---

## Padrões de projeto

### Padrões GoF

| Padrão | Tipo | Onde | Por quê |
|---|---|---|---|
| **Factory Method** | Criacional | `usuarios/factories/` | Cada perfil tem a sua fábrica (`ClienteFactory`, `VendedorFactory`, `AdminFactory`), todas filhas de `UsuarioFactory`. A regra comum (documento do tipo de pessoa) fica na classe base; a regra exclusiva do vendedor (telefone obrigatório) fica isolada na `VendedorFactory`, e a `AdminFactory` dispensa a validação. O cadastro e a atualização usam as mesmas fábricas para validar. Um perfil novo exige apenas uma classe nova (Princípio Aberto/Fechado). |
| **Strategy** | Comportamental | `catalogo/strategies/` | Cada forma de ordenar o catálogo (nome, menor preço, maior preço, mais recentes) é uma classe com o mesmo método `ordenar()`. O `BrinquedoService` escolhe a estratégia em tempo de execução, sem `if/elif`. |
| **Singleton** | Criacional | `core/logger_sistema.py` | O `LoggerSistema` tem uma única instância no sistema inteiro. Todos os Services registram eventos no mesmo log, com a mesma configuração e o mesmo arquivo. |

### Padrões de arquitetura

| Padrão | Onde |
|---|---|
| **Arquitetura em Camadas** | Todo o projeto |
| **Repository** | `*/repositories/` |
| **Service Layer** | `*/services/` |
| **DTO** | `*/dtos/` |
| **Herança para reaproveitar regras (DRY)** | `catalogo/services/cadastro_simples_service.py`: `MarcaService` e `CategoriaService` herdam a mesma lógica |
| **Tratamento centralizado de exceções** | `core/tratador_excecoes.py` (equivalente ao `@ControllerAdvice` do Spring) |

---

## Como rodar o projeto

### Pré-requisitos

- Python 3.10 ou superior
- Docker Desktop (o MySQL roda em container; não é preciso instalar o MySQL)

### 1. Criar e ativar o ambiente virtual

Dentro da pasta `backend`:

```bash
python -m venv venv
```

Windows (PowerShell):

```bash
.\venv\Scripts\Activate.ps1
```

Linux/macOS:

```bash
source venv/bin/activate
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com os seus dados:

```env
SECRET_KEY='sua-chave-secreta'
DEBUG=True

DB_NAME=ludistore
DB_USER=root
DB_PASSWORD=sua-senha
DB_HOST=127.0.0.1
DB_PORT=3308
```

> O `DEBUG=True` é necessário para rodar em desenvolvimento. Sem ele, o Django entende que está em produção e exige o `ALLOWED_HOSTS`.

### 4. Subir o banco (Docker)

Com o Docker Desktop aberto, dentro da pasta `backend`:

```bash
docker compose up -d
```

O container `ludistore-mysql` cria o banco `ludistore` sozinho, com a senha do `root` definida no `.env`, e fica disponível na porta `3308`.

| Situação | Comando |
|---|---|
| Ligar o banco | `docker compose up -d` |
| Desligar (os dados ficam) | `docker compose stop` |
| Apagar o banco e começar do zero | `docker compose down -v` |

### 5. Criar as tabelas

```bash
python manage.py migrate
```

### 6. Popular com dados de exemplo

```bash
python manage.py popular_banco
```

Cria 2 administradores, 2 vendedores (um PF e um PJ), 3 clientes (um deles PJ), 6 marcas, 6 categorias, 8 brinquedos e 4 pedidos. Rodar de novo não duplica nada.

| Perfil | E-mail | Senha (só desenvolvimento) |
|---|---|---|
| Admin | `admin@ludistore.com` e `suporte@ludistore.com` | `admin123` |
| Vendedor PF | `sandra@email.com` | `senha123` |
| Vendedor PJ | `contato@mundodosbrinquedos.com` | `senha123` |
| Cliente | `ana@email.com`, `bruno@email.com` e `compras@pequenosaber.edu.br` (PJ) | `senha123` |

> Por regra de negócio (RN01), o cadastro público não permite o perfil ADMIN. Por isso os administradores são criados por esse comando (ou pelo shell, com a `AdminFactory`).

### 7. Subir o servidor

```bash
python manage.py runserver
```

A API fica disponível em `http://127.0.0.1:8000/api/`.

### 8. Testar pelo Insomnia

No Insomnia, use **Import** e escolha o arquivo `insomnia/ludistore_insomnia.json`. A coleção tem 38 requisições, separadas em Usuários, Marcas, Categorias, Brinquedos e Pedidos.

Os ids usados nas requisições ficam no **Base Environment** (`usuario_id`, `vendedor_id`, `comprador_id`, `marca_id`, `categoria_id`, `brinquedo_id` e `pedido_id`). Como o MySQL numera os ids de forma diferente em cada máquina, confira os valores com as listagens e ajuste o ambiente se precisar.

### 9. Rodar os testes automatizados

```bash
python manage.py test
```

São 29 casos de teste (CT01 a CT29), em `usuarios/tests.py`, `catalogo/tests.py` e `pedidos/tests.py`. O Django cria um banco separado (`test_ludistore`) e o apaga no final, então o banco de desenvolvimento não é tocado. Durante os testes o `LoggerSistema` fica desligado.

---

## Endpoints

Todas as URLs terminam com `/`. Sem a barra final, requisições `POST`, `PATCH` e `DELETE` falham.

### Usuários

| Método | URL | Ação |
|---|---|---|
| `GET` | `/api/usuarios/` | Lista todos os usuários (ativos e desativados) |
| `GET` | `/api/usuarios/?busca=ana` | Pesquisa por nome, e-mail, CPF, CNPJ, telefone ou id |
| `POST` | `/api/usuarios/` | Cadastro público (cliente ou vendedor) |
| `GET` | `/api/usuarios/<id>/` | Busca um usuário (inclusive desativado) |
| `PATCH` | `/api/usuarios/<id>/` | Atualiza os campos enviados |
| `DELETE` | `/api/usuarios/<id>/` | Desativa o usuário (exclusão lógica) |
| `PATCH` | `/api/usuarios/<id>/reativar/` | Reativa um usuário desativado |

Todos esses endpoints ficam num único controller (`UsuarioController`, um `ViewSet` do DRF), e as rotas são geradas pelo `SimpleRouter` em `usuarios/urls.py`.

Exemplo de cadastro (vendedor pessoa jurídica):

```json
{
  "nome": "Brinquedos Ltda",
  "email": "loja@email.com",
  "senha": "123456",
  "perfil": "VENDEDOR",
  "tipo_pessoa": "PJ",
  "cnpj": "12345678000199",
  "telefone": "11988887777"
}
```

| Campo | Obrigatório | Observação |
|---|:---:|---|
| `nome`, `email`, `senha` | sim | o e-mail é único e gravado em minúsculas |
| `tipo_pessoa` | sim | `PF` (pessoa física) ou `PJ` (pessoa jurídica) |
| `perfil` | não | `CLIENTE` (padrão) ou `VENDEDOR` |
| `cpf` | só para `PF` | 11 dígitos, único |
| `cnpj` | só para `PJ` | 14 dígitos, único |
| `telefone` | só para vendedor | 10 ou 11 dígitos |
| `data_nascimento` | não | formato `AAAA-MM-DD` |
| `sexo` | não | `M`, `F`, `O` ou `N/I` |
| `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf` | não | endereço; o CEP tem 8 dígitos |

Documentos, telefone e CEP são enviados **apenas com números** (sem pontos, traços ou barras). O documento que não é do tipo da pessoa é opcional: um `PF` pode informar o CNPJ, e um `PJ` pode informar o CPF.

No `PATCH`, o `perfil` não pode ser alterado, e as mesmas regras do cadastro são conferidas sobre o resultado final (por exemplo, um vendedor não pode apagar o telefone).

A senha é gravada criptografada e nunca é devolvida pela API.

### Marcas e categorias

| Método | URL | Ação |
|---|---|---|
| `GET` | `/api/marcas/` | Lista as marcas ativas |
| `POST` | `/api/marcas/` | Cadastra uma marca |
| `GET` | `/api/marcas/<id>/` | Busca uma marca (inclusive desativada) |
| `PATCH` | `/api/marcas/<id>/` | Atualiza o nome |
| `DELETE` | `/api/marcas/<id>/` | Desativa a marca |
| `PATCH` | `/api/marcas/<id>/reativar/` | Reativa a marca |

As rotas de categorias são as mesmas, trocando `marcas` por `categorias`. Corpo do cadastro:

```json
{ "nome": "Estrela" }
```

O nome é único e a comparação ignora maiúsculas e minúsculas (`Estrela` e `estrela` são a mesma marca).

### Brinquedos

| Método | URL | Ação |
|---|---|---|
| `GET` | `/api/brinquedos/` | Lista o catálogo (brinquedos ativos) |
| `GET` | `/api/brinquedos/?ordem=menor_preco` | Lista com ordenação (Strategy) |
| `POST` | `/api/brinquedos/` | Cadastra um brinquedo |
| `GET` | `/api/brinquedos/<id>/` | Busca um brinquedo |
| `PATCH` | `/api/brinquedos/<id>/` | Atualiza os campos enviados |
| `DELETE` | `/api/brinquedos/<id>/` | Desativa o brinquedo |
| `PATCH` | `/api/brinquedos/<id>/reativar/` | Reativa o brinquedo |

Cada recurso (`usuarios`, `marcas`, `categorias` e `brinquedos`) tem um único controller (`ViewSet`), e as rotas são geradas pelo `SimpleRouter`.

Valores aceitos em `ordem`: `nome` (padrão), `menor_preco`, `maior_preco` e `recentes`.

Exemplo de cadastro:

```json
{
  "sku": "EST-BON-001",
  "nome": "Boneca Fofinha",
  "descricao": "Boneca de pano com roupinhas",
  "preco": 89.90,
  "estoque": 15,
  "idade_minima": 3,
  "marca_id": 1,
  "vendedor_id": 2,
  "categorias_ids": [2]
}
```

- `vendedor_id` precisa ser um usuário ativo com perfil `VENDEDOR` ou `ADMIN`
- `categorias_ids` precisa ter ao menos uma categoria ativa
- No `PATCH`, `vendedor_id` não pode ser alterado e `categorias_ids` substitui as categorias atuais

### Pedidos

| Método | URL | Ação |
|---|---|---|
| `POST` | `/api/pedidos/` | Faz um pedido |
| `GET` | `/api/pedidos/` | Lista todos os pedidos (visão do admin) |
| `GET` | `/api/pedidos/?comprador_id=9` | Histórico de compras de um usuário (RN15) |
| `GET` | `/api/pedidos/<id>/` | Busca um pedido com os itens |
| `GET` | `/api/pedidos/vendas/?vendedor_id=7` | Vendas dos brinquedos de um vendedor (RN14) |

Não existe `PATCH` nem `DELETE`: um pedido confirmado não é alterado nem apagado.

Exemplo de pedido:

```json
{
  "comprador_id": 9,
  "itens": [
    { "brinquedo_id": 2, "quantidade": 1 },
    { "brinquedo_id": 6, "quantidade": 2 }
  ]
}
```

O que acontece ao fazer um pedido (`PedidoService.criar`):

1. O comprador precisa estar ativo. Qualquer perfil pode comprar.
2. Itens repetidos do mesmo brinquedo são somados.
3. Os brinquedos do pedido são **travados** no banco (`select_for_update`) até o fim da compra. Assim, duas pessoas comprando o último item ao mesmo tempo não conseguem vender mais do que existe.
4. Para cada item: o brinquedo precisa estar ativo, não pode ser do próprio comprador (RN10) e precisa ter estoque suficiente (RN11).
5. O item guarda o **preço do momento** da compra (RN13), e o estoque é baixado.
6. Tudo roda numa única transação (`@transaction.atomic`, RN12): se qualquer item falhar, nada é gravado e nenhum estoque é baixado.

O pedido já nasce com o status `CONFIRMADO`.

> Sem login ainda, o `comprador_id` vai no corpo e o `vendedor_id` vai na URL. Com a autenticação, os dois vão vir do usuário logado.

### Respostas

| Código | Quando |
|---|---|
| `200 OK` | Consulta ou atualização feita |
| `201 Created` | Cadastro feito |
| `204 No Content` | Desativação feita |
| `400 Bad Request` | Formato inválido (erro por campo) ou regra de negócio violada (`{"erro": "..."}`) |
| `404 Not Found` | Registro inexistente ou desativado |
| `405 Method Not Allowed` | Verbo não suportado (ex.: `PUT`; use `PATCH`) |

As regras de negócio lançam exceções próprias (`core/excecoes.py`): `RegraDeNegocioError` vira **400** e `NaoEncontradoError` vira **404**. A conversão é feita num lugar só, em `core/tratador_excecoes.py` (equivalente ao `@ControllerAdvice` do Spring), por isso nenhum controller tem `try/except`. Qualquer outro erro inesperado vira **500**, sem se disfarçar de erro do usuário.

---

## Regras de negócio

As regras completas (RN01 a RN23) estão em [`docs/regras_negocio.md`](../docs/regras_negocio.md) e o diagrama de classes em [`docs/diagrama_classe.md`](../docs/diagrama_classe.md).

Exclusões são sempre **lógicas**: o registro fica com `ativo = false` e deixa de aparecer nas consultas, mas continua no banco para preservar o histórico.

---

## Logs

O `LoggerSistema` registra os eventos no terminal e no arquivo `backend/logs/ludistore.log` (ignorado pelo Git):

```
09/11/2026 13:00:55 [INFO] Usuário cadastrado: Ana Souza (CLIENTE) id=7
09/11/2026 13:00:55 [WARNING] Cadastro bloqueado: tentativa com perfil ADMIN (hacker@email.com)
```

---

## Próximos passos

- **Autenticação (login)**: necessária para aplicar as permissões por perfil (RN02 e RN03). Hoje qualquer requisição acessa todos os endpoints, e o `vendedor_id` vai no corpo da requisição.
- **Cancelamento de pedido** com devolução do estoque (hoje o pedido só existe como `CONFIRMADO`).
- **Validação dos dígitos verificadores** de CPF e CNPJ (hoje só o formato é conferido).
