# LudiStore · Templates (alta fidelidade)

Protótipo navegável das 18 telas da LudiStore, no mesmo visual da página "Template" do Figma.
É um site estático (HTML + CSS + um pouco de JS), sem build. Abra o `index.html` ou publique a pasta na Vercel.

Use o botão **Telas** (canto inferior direito) para navegar. Cada tela tem uma URL própria, por exemplo `/#produto` e `/#admin-usuarios`.

## Estrutura

```
index.html          as 18 telas (<section class="tela">) + blocos compartilhados (<template>)
css/tokens.css      cores, fontes, raios e sombras  →  mesmas variáveis do Figma
css/componentes.css botões, selos, campos, card de produto, cabeçalho, rodapé, tabela, painel…
css/telas.css       layout de cada página
css/responsivo.css  ajustes para notebook (≤1280), tablet (≤1024), celular (≤768) e celular pequeno (≤480)
css/prototipo.css   só o navegador do protótipo (não levar pro React)
js/app.js           insere os blocos, monta os cards e troca de tela pelo #hash
img/                fotos dos produtos
```

## Como levar para React + Vite

1. Copie `css/tokens.css`, `css/componentes.css`, `css/telas.css` e `css/responsivo.css` para `src/styles/` e importe nessa ordem no `main.jsx` (o responsivo sempre por último).
   Os botões "Filtros" usam a classe `so-mobile` e abrem `.filtros.aberto`: no React isso vira um `useState`.
2. Instale os ícones: `npm i lucide-react`. Os nomes daqui viram componentes:
   `i-busca → <Search/>`, `i-carrinho → <ShoppingCart/>`, `i-coracao → <Heart/>`, `i-usuario → <User/>`,
   `i-pacote → <Package/>`, `i-caminhao → <Truck/>`, `i-cartao → <CreditCard/>`, `i-lixeira → <Trash2/>`,
   `i-editar → <Pencil/>`, `i-olho → <Eye/>`, `i-reativar → <RotateCcw/>`, `i-grafico → <TrendingUp/>`.
3. Cada `<template id="tpl-...">` vira um componente:

| Template / classe | Componente React | Props sugeridas |
|---|---|---|
| `tpl-cabecalho` | `<Cabecalho />` | `usuario`, `qtdCarrinho`, `totalCarrinho` |
| `tpl-cabecalho-simples` | `<CabecalhoSimples />` | `texto` |
| `tpl-rodape` | `<Rodape />` | — |
| `tpl-lateral-vendedor` / `tpl-lateral-admin` | `<MenuLateral />` | `perfil`, `ativo` |
| `tpl-topo-painel` | `<TopoPainel />` | `usuario` |
| `tpl-menu-conta` | `<MenuConta />` | `ativo` |
| `.btn` | `<Botao />` | `estilo` (primario, destaque, amarelo, contorno, texto, perigo), `tamanho` |
| `.selo` | `<Selo />` | `cor` |
| `.campo` | `<Campo />` | `rotulo`, `erro`, `ajuda` |
| `.card-produto` (função `cardProduto` no app.js) | `<CardProduto />` | dados de `GET /api/brinquedos/` |
| `.card-indicador` | `<CardIndicador />` | `valor`, `rotulo`, `icone`, `cor` |
| `.tabela-caixa` | `<Tabela />` | `colunas`, `linhas` |

4. Cada `<section class="tela" id="...">` vira uma página no React Router:

| Tela | Rota sugerida | Endpoint |
|---|---|---|
| 01 Home | `/` | `GET /api/brinquedos/?ordem=` |
| 02 Listagem | `/categoria/:id` | `GET /api/brinquedos/`, `GET /api/categorias/` |
| 03 Busca | `/busca?q=` | `GET /api/brinquedos/` |
| 04 Produto | `/produto/:id` | `GET /api/brinquedos/<id>/` |
| 05 Login | `/login` | `POST /api/auth/login/` |
| 06 Cadastro | `/cadastro` | `POST /api/usuarios/` |
| 07 Minha conta | `/conta` | `GET /api/auth/eu/`, `PATCH /api/usuarios/<id>/` |
| 08 Meus produtos | `/vendedor/produtos` | `GET /api/brinquedos/meus/`, `DELETE`, `PATCH …/reativar/` |
| 09 Produto (form) | `/vendedor/produtos/novo` e `/:id/editar` | `POST` / `PATCH /api/brinquedos/` |
| 10 Admin geral | `/admin` | vários `GET` |
| 11 Admin produtos | `/admin/produtos` | `GET /api/brinquedos/` |
| 12 Admin usuários | `/admin/usuarios` | `GET /api/usuarios/?busca=` |
| 13 Carrinho | `/carrinho` | estado local (Context) |
| 14 Checkout | `/checkout` | `POST /api/pedidos/` |
| 15 Meus pedidos | `/conta/pedidos` | `GET /api/pedidos/` |
| 16 Minhas vendas | `/vendedor/vendas` | `GET /api/pedidos/vendas/` |
| 17 Admin pedidos | `/admin/pedidos` | `GET /api/pedidos/`, `GET /api/pedidos/<id>/` |
| 18 Marcas e categorias | `/admin/catalogo` | `GET/POST/PATCH/DELETE /api/marcas/` e `/api/categorias/` |

No React, troque `class` por `className`, `style="..."` por `style={{...}}` e os `<a href="#...">` por `<Link to="...">`.

## Publicar na Vercel

Opção 1: suba esta pasta num repositório do GitHub e, na Vercel, use **Add New → Project → Import**.
Framework Preset: **Other**, sem build command, output directory `.`.

Opção 2: pelo terminal, dentro desta pasta:

```bash
npx vercel        # prévia
npx vercel --prod # produção
```

## Alinhado com a API (o que o front mostra e o que ele calcula)

O protótipo mostra só o que o back-end guarda. Tudo abaixo vem da API ou é calculado no front a partir dela.

| Assunto | Como ficou |
|---|---|
| Imagem do produto | Uma por brinquedo (`imagem_url`). Sem galeria. No formulário é um campo de URL. |
| Preço | Só `preco`. Sem preço antigo, desconto, Pix ou parcelamento. |
| Selos do card | Calculados no front: **Esgotado** (`estoque = 0`), **Últimas N** (`estoque ≤ 5`), **Novidade** (`criado_em` recente). |
| Idade | `idade_minima` → "A partir de X anos". |
| Ordenação | Só as 4 estratégias da API: `nome`, `menor_preco`, `maior_preco`, `recentes`. |
| Busca e filtros | Feitos no front sobre a lista de `GET /api/brinquedos/` (categoria, marca, idade, preço, estoque). Sem paginação na API. |
| Carrinho | Estado local (Context + localStorage). Sem frete e sem cupom. |
| Checkout | Envia só `{ itens: [{ brinquedo_id, quantidade }] }`. Sem forma de pagamento. Mostra o endereço do cadastro e os erros 400 da API (estoque, comprar o próprio produto). |
| Pedidos | Status único `CONFIRMADO`; cada item traz `brinquedo_id`, `brinquedo` (nome), `quantidade`, `preco_unitario` e `subtotal`. O item **não** traz imagem nem vendedor: a foto vem do catálogo pelo `brinquedo_id`. |
| Conta | Sem foto de perfil. Troca de senha manda só a nova senha. Endereço único e opcional no próprio usuário. |
| Login | Sem "manter conectado" e sem "esqueci minha senha" (não há endpoint). Token de 8 h. |
| Admin | Sem criação de administrador pela tela (só pelo `popular_banco`/shell). Listas de brinquedos, marcas e categorias trazem só os ativos. |
| Vendedor | `GET /api/brinquedos/meus/` traz também os desativados, por isso só essa tela mostra o botão Reativar. A resposta do brinquedo tem `criado_em`, mas não `atualizado_em`. |
| Login | `POST /api/auth/login/` devolve `{ token, tipo: 'Bearer', expira_em_segundos, usuario }`. O `usuario.perfil` decide para onde redirecionar. |
