# LudiStore · Front-end (React + Vite)

## Como rodar

Pré-requisito: Node.js 20 ou mais novo.

```bash
cd frontend
npm install      # só na primeira vez (ou quando o package.json mudar)
npm run dev      # abre em http://localhost:5173
```

Com o back-end rodando (`python manage.py runserver` na pasta `backend`), as chamadas para `/api/...`
são repassadas para `http://127.0.0.1:8000` pelo proxy do Vite (`vite.config.js`). Por isso não é preciso
configurar CORS no Django durante o desenvolvimento.

Abra `http://localhost:5173/telas` para ver o mapa com as 18 telas e as rotas.

## Estrutura

```
src/
├── main.jsx         ponto de entrada: importa o CSS e liga o React Router
├── App.jsx          todas as rotas, agrupadas por layout
├── rotas.js         lista das 18 telas (número, nome, caminho, protótipo)
├── styles/          CSS do protótipo: tokens → componentes → telas → responsivo
├── layouts/         LayoutLoja, LayoutAcesso e LayoutPainel (com <Outlet />)
├── components/      componentes reutilizáveis
├── pages/           uma pasta por área: loja, acesso, cliente, vendedor, admin
├── services/        chamadas à API (fetch com o token)
└── context/         estado global: login (AuthContext) e carrinho (CarrinhoContext)
```

O protótipo HTML de referência fica em `docs/templates-html/`.
