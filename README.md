# LudiStore 🧸✨

> Plataforma de e-commerce de brinquedos com múltiplos perfis de acesso, arquitetura em camadas e padrões de projeto GoF.
> Projeto desenvolvido para a disciplina **IES300 - Engenharia de Software III** (Tecnologia em Análise e Desenvolvimento de Sistemas).

---

## 📌 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Perfis de Acesso](#-perfis-de-acesso)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Padrões de Projeto](#-arquitetura-e-padrões-de-projeto)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
  - [1. Subir o Banco de Dados (MySQL via Docker)](#1-subir-o-banco-de-dados-mysql-via-docker)
  - [2. Inicializar o Back-end (Django API)](#2-inicializar-o-back-end-django-api)
  - [3. Inicializar o Front-end (React + Vite)](#3-inicializar-o-front-end-react--vite)
- [Usuários de Teste](#-usuários-de-teste)
- [Mapa das 18 Telas do Sistema](#-mapa-das-18-telas-do-sistema)
- [Documentação Técnica Adicional](#-documentação-técnica-adicional)

---

## 📖 Sobre o Projeto
A **LudiStore** é um marketplace voltado para o comércio de brinquedos, conectando clientes, vendedores parceiros e administradores. O sistema conta com controle de estoque concorrente, compras em transações atômicas, personalização de vitrine por faixa etária, ordenação inteligente e histórico imutável de vendas.

---

## 👥 Perfis de Acesso

| Perfil | Descrição e Permissões |
|---|---|
| 👑 **Administrador** | Controle global do sistema: gerencia marcas, categorias, usuários, brinquedos e visualiza todos os pedidos e estatísticas. |
| 🏬 **Vendedor** | Cadastra e gerencia seus próprios brinquedos, acompanha vendas e faturamento, e também pode comprar produtos na loja. |
| 🛍️ **Cliente** | Navega no catálogo, pesquisa por filtros, monta carrinho de compras e realiza pedidos com histórico detalhado. |

---

## 🛠️ Tecnologias Utilizadas

### Back-end
- **Python 3.14**
- **Django 5.2 LTS** & **Django REST Framework (DRF) 3.18**
- **MySQL 8.0** (executado via container Docker)
- **python-dotenv 1.2** (variáveis de ambiente)
- **Django Signing** (autenticação segura via tokens assinados com expiração)

### Front-end
- **React 19**
- **Vite** (bundler de alta performance com proxy de desenvolvimento)
- **React Router DOM 7** (roteamento SPA e rotas protegidas)
- **Lucide React** (ícones)
- **CSS Modular baseado em Tokens** (Design System com variáveis de cores, espaçamentos e responsividade)

---

## 🏛️ Arquitetura e Padrões de Projeto

O back-end segue rigorosamente a **Arquitetura em Camadas**:
```
React (Front-end)
      │  HTTP / JSON
      ▼
┌─────────────────────────────────────────────────────────┐
│ Controller / ViewSet   Recebe requisição e devolve HTTP │
│ DTO (Serializer)       Valida e serializa entrada/saída │
│ Service Layer          Aplica todas as regras de negócio│
│ Repository             Único ponto de acesso ao banco   │
│ Model                  Entidades e mapeamento ORM       │
└─────────────────────────────────────────────────────────┘
      │
      ▼
 MySQL 8.0 (Docker)
```

### Padrões GoF Implementados
1. **Factory Method** (`backend/usuarios/factories/`): Criação polimórfica de usuários (`ClienteFactory`, `VendedorFactory`, `AdminFactory`), isolando regras específicas (como validação de CPF para PF, CNPJ para PJ e telefone obrigatório para vendedor).
2. **Strategy** (`backend/catalogo/strategies/`): Ordenação flexível do catálogo (nome, menor preço, maior preço, mais recentes) selecionada em tempo de execução sem cadeias de condicionais.
3. **Singleton** (`backend/core/logger_sistema.py`): Logger centralizado garantindo uma única instância registrando eventos do sistema no terminal e em arquivo.

### Padrões de Arquitetura & Boas Práticas
- **Service Layer & Repository Pattern**: Desacoplamento total entre o framework web e a persistência.
- **Transação Atômica Concorrente**: Processamento de compras em transação única (`@transaction.atomic`) com trava seletiva de linhas (`select_for_update`), impedindo venda de estoque inexistente em compras simultâneas (RN10 a RN13).
- **Tratamento Centralizado de Exceções**: Converte exceções de negócio em respostas HTTP padronizadas (`400`, `401`, `403`, `404`) no formato `{"erro": "..."}`.
- **Exclusão Lógica**: Registros desativados mantêm o histórico relacional e suportam reativação posterior.

---

## 📁 Estrutura do Repositório

```
LudiStore/
├── backend/                  # API REST em Django + DRF
│   ├── config/               # Configurações do projeto e URLs
│   ├── core/                 # Logger (Singleton), tratador de exceções e testes
│   ├── catalogo/             # Apps de brinquedos, marcas e categorias (Strategy)
│   ├── pedidos/              # Gestão transacional de pedidos e vendas
│   ├── usuarios/             # Autenticação, token, permissões e perfis (Factory)
│   ├── docker-compose.yml    # Orquestração do MySQL 8.0
│   └── manage.py
├── frontend/                 # Aplicação SPA em React + Vite
│   ├── src/
│   │   ├── components/       # Componentes visuais reutilizáveis
│   │   ├── context/          # AuthContext e CarrinhoContext
│   │   ├── layouts/          # LayoutLoja, LayoutAcesso e LayoutPainel
│   │   ├── pages/            # 18 telas completas (loja, cliente, vendedor, admin)
│   │   ├── services/         # Clientes HTTP REST (api, auth, pedidos, brinquedos, etc.)
│   │   ├── styles/           # Tokens, componentes, telas e responsividade
│   │   └── rotas.js          # Definição e mapa das rotas
│   ├── public/               # Imagens e favicons estáticos
│   └── vite.config.js        # Configuração do Vite e proxy reverso para /api
└── docs/                     # Documentação de apoio
    ├── regras_negocio.md     # Regras de Negócio completas (RN01 a RN25)
    ├── diagrama_classe.md    # Diagrama de Classes UML
    └── templates-html/       # Protótipo estático navegável das 18 telas
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* **Python 3.10+** (recomendado 3.12 ou mais recente)
* **Node.js 20+**
* **Docker Desktop** (para o MySQL)

---

### 1. Subir o Banco de Dados (MySQL via Docker)
Na pasta raiz do projeto:
```bash
cd backend
docker compose up -d
```
*O MySQL 8.0 iniciará em segundo plano na porta `3308` com o banco `ludistore`.*

---

### 2. Inicializar o Back-end (Django API)
Ainda dentro da pasta `backend`:

1. **Criar e ativar o ambiente virtual:**
   ```bash
   # Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS:
   python -m venv venv
   source venv/bin/activate
   ```

2. **Instalar as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Aplicar as migrações e popular com dados de teste:**
   ```bash
   python manage.py migrate
   python manage.py popular_banco
   ```

5. **Iniciar a API:**
   ```bash
   python manage.py runserver
   ```
   *A API estará acessível em `http://127.0.0.1:8000/api/`.*

6. **(Opcional) Executar os 38 testes automatizados:**
   ```bash
   python manage.py test
   ```

---

### 3. Inicializar o Front-end (React + Vite)
Em um novo terminal, a partir da pasta raiz:
```bash
cd frontend
npm install
npm run dev
```
*A aplicação abrirá no navegador em `http://localhost:5173`.*

> **Nota:** Graças ao proxy configurado no `vite.config.js`, todas as chamadas para `/api/*` são automaticamente direcionadas para `http://127.0.0.1:8000`, dispensando configuração manual de CORS no desenvolvimento.

---

## 🔑 Usuários de Teste

O comando `python manage.py popular_banco` cria usuários pré-configurados para validação imediata:

| Perfil | E-mail | Senha |
|---|---|---|
| **Admin** | `admin@ludistore.com` | `admin123` |
| **Vendedor (Pessoa Física)** | `sandra@email.com` | `senha123` |
| **Vendedor (Pessoa Jurídica)** | `contato@mundodosbrinquedos.com` | `senha123` |
| **Cliente** | `ana@email.com` | `senha123` |
| **Cliente (Pessoa Jurídica)** | `compras@pequenosaber.edu.br` | `senha123` |

---

## 🗺️ Mapa das 18 Telas do Sistema

Você pode navegar em todas as telas acessando `http://localhost:5173/telas`:

| Nº | Nome da Tela | Rota | Perfil Requerido |
|:---:|---|---|:---:|
| **01** | Home | `/` | Público |
| **02** | Listagem por categoria | `/catalogo` | Público |
| **03** | Resultado de busca | `/busca` | Público |
| **04** | Detalhe do produto | `/produto/:id` | Público |
| **05** | Login | `/login` | Público |
| **06** | Cadastro | `/cadastro` | Público |
| **07** | Minha conta | `/conta` | Logado |
| **08** | Vendedor · Meus produtos | `/vendedor/produtos` | Vendedor / Admin |
| **09** | Cadastro / edição de produto | `/vendedor/produtos/novo` | Vendedor / Admin |
| **10** | Admin · Visão geral | `/admin` | Admin |
| **11** | Admin · Produtos | `/admin/produtos` | Admin |
| **12** | Admin · Usuários | `/admin/usuarios` | Admin |
| **13** | Carrinho | `/carrinho` | Público |
| **14** | Checkout | `/checkout` | Logado |
| **15** | Meus pedidos | `/conta/pedidos` | Logado |
| **16** | Vendedor · Minhas vendas | `/vendedor/vendas` | Vendedor / Admin |
| **17** | Admin · Pedidos | `/admin/pedidos` | Admin |
| **18** | Admin · Marcas e categorias | `/admin/catalogo` | Admin |

---

## 📚 Documentação Técnica Adicional

- [Regras de Negócio (RN01 a RN25)](docs/regras_negocio.md)
- [Diagrama de Classes UML](docs/diagrama_classe.md)
- [README detalhado do Back-end](backend/README.md)
- [README detalhado do Front-end](frontend/README.md)
