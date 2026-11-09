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
├── core/              recursos compartilhados (LoggerSistema)
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
├── pedidos/           (em desenvolvimento)
├── manage.py
└── requirements.txt
```

---

## Padrões de projeto

### Padrões GoF

| Padrão | Tipo | Onde | Por quê |
|---|---|---|---|
| **Factory Method** | Criacional | `usuarios/factories/` | Cada perfil tem a sua fábrica (`ClienteFactory`, `VendedorFactory`, `AdminFactory`), todas filhas de `UsuarioFactory`. A regra exclusiva do vendedor (CPF e telefone obrigatórios) fica isolada na `VendedorFactory`. Um perfil novo exige apenas uma classe nova (Princípio Aberto/Fechado). |
| **Strategy** | Comportamental | `catalogo/strategies/` | Cada forma de ordenar o catálogo (nome, menor preço, maior preço, mais recentes) é uma classe com o mesmo método `ordenar()`. O `BrinquedoService` escolhe a estratégia em tempo de execução, sem `if/elif`. |
| **Singleton** | Criacional | `core/logger_sistema.py` | O `LoggerSistema` tem uma única instância no sistema inteiro. Todos os Services registram eventos no mesmo log, com a mesma configuração e o mesmo arquivo. |

### Padrões de arquitetura

| Padrão | Onde |
|---|---|
| **Arquitetura em Camadas** | Todo o projeto |
| **Repository** | `*/repositories/` |
| **Service Layer** | `*/services/` |
| **DTO** | `*/dtos/` |

---

## Como rodar o projeto

### Pré-requisitos

- Python 3.10 ou superior
- MySQL 8.0 ou superior

### 1. Criar o banco de dados

No MySQL:

```sql
CREATE DATABASE ludistore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Criar e ativar o ambiente virtual

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

### 3. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com os seus dados:

```env
SECRET_KEY='sua-chave-secreta'
DEBUG=True

DB_NAME=ludistore
DB_USER=root
DB_PASSWORD=sua-senha
DB_HOST=127.0.0.1
DB_PORT=3306
```

> O `DEBUG=True` é necessário para rodar em desenvolvimento. Sem ele, o Django entende que está em produção e exige o `ALLOWED_HOSTS`.

### 5. Criar as tabelas

```bash
python manage.py migrate
```

### 6. Subir o servidor

```bash
python manage.py runserver
```

A API fica disponível em `http://127.0.0.1:8000/api/`.

### 7. Criar um administrador

Por regra de negócio (RN01), o cadastro público não permite o perfil ADMIN. O administrador é criado pelo shell do Django:

```bash
python manage.py shell
```

```python
from usuarios.factories import AdminFactory
from usuarios.repositories import UsuarioRepository

UsuarioRepository().salvar(AdminFactory().criar({'nome': 'Admin', 'email': 'admin@ludistore.com', 'senha': 'sua-senha'}))
```

---

## Endpoints

Todas as URLs terminam com `/`. Sem a barra final, requisições `POST`, `PATCH` e `DELETE` falham.

### Usuários

| Método | URL | Ação |
|---|---|---|
| `GET` | `/api/usuarios/` | Lista os usuários ativos |
| `POST` | `/api/usuarios/` | Cadastro público (cliente ou vendedor) |
| `GET` | `/api/usuarios/<id>/` | Busca um usuário |
| `PATCH` | `/api/usuarios/<id>/` | Atualiza os campos enviados |
| `DELETE` | `/api/usuarios/<id>/` | Desativa o usuário (exclusão lógica) |

Exemplo de cadastro:

```json
{
  "nome": "Ana Souza",
  "email": "ana@email.com",
  "senha": "123456",
  "perfil": "VENDEDOR",
  "cpf": "12345678900",
  "telefone": "11988887777"
}
```

| Campo | Obrigatório | Observação |
|---|:---:|---|
| `nome`, `email`, `senha` | sim | o e-mail é único |
| `perfil` | não | `CLIENTE` (padrão) ou `VENDEDOR` |
| `cpf`, `telefone` | só para vendedor | apenas dígitos; o CPF é único |
| `data_nascimento` | não | formato `AAAA-MM-DD` |
| `sexo` | não | `M`, `F`, `O` ou `N/I` |
| `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf` | não | endereço |

A senha é gravada criptografada e nunca é devolvida pela API.

### Marcas e categorias

| Método | URL | Ação |
|---|---|---|
| `GET` | `/api/marcas/` | Lista as marcas ativas |
| `POST` | `/api/marcas/` | Cadastra uma marca |
| `GET` | `/api/marcas/<id>/` | Busca uma marca |
| `PATCH` | `/api/marcas/<id>/` | Atualiza o nome |
| `DELETE` | `/api/marcas/<id>/` | Desativa a marca |

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

### Respostas

| Código | Quando |
|---|---|
| `200 OK` | Consulta ou atualização feita |
| `201 Created` | Cadastro feito |
| `204 No Content` | Desativação feita |
| `400 Bad Request` | Formato inválido (erro por campo) ou regra de negócio violada (`{"erro": "..."}`) |
| `404 Not Found` | Registro inexistente ou desativado |

---

## Regras de negócio

As regras completas (RN01 a RN15) estão em [`docs/regras_negocio.md`](../docs/regras_negocio.md) e o diagrama de classes em [`docs/diagrama_classe.md`](../docs/diagrama_classe.md).

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
- **Pedidos**: compra com baixa de estoque em transação única (RN10 a RN15).
- **Reativação** de usuários, marcas, categorias e brinquedos desativados.
