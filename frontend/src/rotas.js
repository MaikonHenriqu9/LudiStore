// Mapa único das 18 telas: número, nome, caminho, layout e id no protótipo HTML
// (docs/templates-html/index.html#<prototipo>). O App.jsx e a página /telas usam esta lista.

export const ROTAS = [
  { num: '01', nome: 'Home', caminho: '/', layout: 'loja', prototipo: 'home' },
  { num: '02', nome: 'Listagem por categoria', caminho: '/catalogo', layout: 'loja', prototipo: 'categoria' },
  { num: '03', nome: 'Resultado de busca', caminho: '/busca', layout: 'loja', prototipo: 'busca' },
  { num: '04', nome: 'Detalhe do produto', caminho: '/produto/:id', exemplo: '/produto/1', layout: 'loja', prototipo: 'produto' },
  { num: '05', nome: 'Login', caminho: '/login', layout: 'acesso', prototipo: 'login' },
  { num: '06', nome: 'Cadastro', caminho: '/cadastro', layout: 'acesso', prototipo: 'cadastro' },
  { num: '07', nome: 'Minha conta', caminho: '/conta', layout: 'loja', prototipo: 'minha-conta' },
  { num: '08', nome: 'Vendedor · Meus produtos', caminho: '/vendedor/produtos', layout: 'vendedor', prototipo: 'painel-vendedor' },
  { num: '09', nome: 'Cadastro / edição de produto', caminho: '/vendedor/produtos/novo', layout: 'vendedor', prototipo: 'produto-form' },
  { num: '10', nome: 'Admin · Visão geral', caminho: '/admin', layout: 'admin', prototipo: 'admin' },
  { num: '11', nome: 'Admin · Produtos', caminho: '/admin/produtos', layout: 'admin', prototipo: 'admin-produtos' },
  { num: '12', nome: 'Admin · Usuários', caminho: '/admin/usuarios', layout: 'admin', prototipo: 'admin-usuarios' },
  { num: '13', nome: 'Carrinho', caminho: '/carrinho', layout: 'loja', prototipo: 'carrinho' },
  { num: '14', nome: 'Checkout', caminho: '/checkout', layout: 'acesso', prototipo: 'checkout' },
  { num: '15', nome: 'Meus pedidos', caminho: '/conta/pedidos', layout: 'loja', prototipo: 'pedidos' },
  { num: '16', nome: 'Vendedor · Minhas vendas', caminho: '/vendedor/vendas', layout: 'vendedor', prototipo: 'vendas' },
  { num: '17', nome: 'Admin · Pedidos', caminho: '/admin/pedidos', layout: 'admin', prototipo: 'admin-pedidos' },
  { num: '18', nome: 'Admin · Marcas e categorias', caminho: '/admin/catalogo', layout: 'admin', prototipo: 'admin-marcas' },
]
