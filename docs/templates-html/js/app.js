/* =========================================================
   LudiStore · Protótipo
   - Copia os blocos <template> para cada tela (no React isso
     vira import de componente: <Cabecalho />, <Rodape /> ...)
   - Monta os cards de produto a partir de PRODUTOS
     (no React: produtos.map(p => <CardProduto {...p} />))
   - Navega entre as telas pelo #hash da URL
   ========================================================= */

// Mesmo formato de GET /api/brinquedos/ (campos que a API realmente devolve)
// Não existem na API: preço antigo/desconto, Pix, parcelamento, favoritos, avaliações e várias imagens.
const PRODUTOS = [
  { id: 1, sku: 'BRM-BLC-120', nome: 'Kit Blocos de Montar 120 peças', marca: 'Brinca Mais', preco: 99.90, estoque: 12, idade_minima: 3, imagem_url: 'img/blocos.jpg', categorias: ['Blocos de montar'], novo: false },
  { id: 2, sku: 'BRM-URS-040', nome: 'Urso de Pelúcia Fofinho 40 cm', marca: 'Mundo dos Brinquedos', preco: 89.90, estoque: 30, idade_minima: 0, imagem_url: 'img/urso.jpg', categorias: ['Pelúcias'], novo: false },
  { id: 3, sku: 'MDB-CAR-777', nome: 'Carrinho de Controle Remoto Turbo', marca: 'Toy Center', preco: 199.90, estoque: 0, idade_minima: 6, imagem_url: 'img/carro.jpg', categorias: ['Veículos'], novo: true },
  { id: 4, sku: 'BRM-JOG-010', nome: 'Jogo de Tabuleiro Aventura em Família', marca: 'Estrela Guia', preco: 129.90, estoque: 8, idade_minima: 5, imagem_url: 'img/jogo.jpg', categorias: ['Jogos'], novo: true },
  { id: 5, sku: 'MDB-BON-002', nome: 'Boneca de Pano Lulu', marca: 'Ateliê Pequenos', preco: 79.90, estoque: 4, idade_minima: 3, imagem_url: 'img/boneca.jpg', categorias: ['Bonecas'], novo: false },
  { id: 6, sku: 'MDB-ARG-001', nome: 'Torre de Argolas Montessori', marca: 'Brinca Mais', preco: 59.90, estoque: 2, idade_minima: 1, imagem_url: 'img/argolas.jpg', categorias: ['Baby'], novo: false },
];

const reais = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const idade = n => n === 0 ? 'Todas as idades' : `A partir de ${n} ${n === 1 ? 'ano' : 'anos'}`;

// Selo calculado no front a partir do estoque e da data de cadastro (criado_em)
function seloDo(p) {
  if (p.estoque === 0) return ['Esgotado', 'cinza'];
  if (p.estoque <= 5) return [`Últimas ${p.estoque}`, 'rosa'];
  if (p.novo) return ['Novidade', 'azul'];
  return null;
}

// <CardProduto />
function cardProduto(p, comBotao = true) {
  const selo = seloDo(p);
  const esgotado = p.estoque === 0;
  return `
  <article class="card-produto${esgotado ? ' card-produto--esgotado' : ''}" onclick="location.hash='produto'">
    <div class="card-produto__imagem">
      <img src="${p.imagem_url}" alt="${p.nome}">
      ${selo ? `<span class="selo selo--${selo[1]}">${selo[0]}</span>` : ''}
    </div>
    <div class="card-produto__info">${p.marca} · ${idade(p.idade_minima)}</div>
    <h3 class="card-produto__nome">${p.nome}</h3>
    <div class="card-produto__precos"><span class="card-produto__preco">${reais(p.preco)}</span></div>
    ${!comBotao ? '' : esgotado
      ? `<button class="btn btn--contorno btn--p btn--bloco" disabled>Esgotado</button>`
      : `<a href="#carrinho" class="btn btn--primario btn--p btn--bloco" onclick="event.stopPropagation()"><svg class="ico ico--p"><use href="#i-carrinho"/></svg>Adicionar ao carrinho</a>`}
  </article>`;
}

// 1) Insere os blocos compartilhados
document.querySelectorAll('[data-inserir]').forEach(alvo => {
  const tpl = document.getElementById('tpl-' + alvo.dataset.inserir);
  const bloco = tpl.content.firstElementChild.cloneNode(true);

  if (alvo.hasAttribute('data-logado')) {
    bloco.querySelector('[data-saudacao]').textContent = 'Olá, Ana';
    bloco.querySelector('[data-conta-texto]').textContent = 'Minha conta';
    bloco.querySelector('[data-conta]').href = '#minha-conta';
  }
  if (alvo.dataset.texto && bloco.querySelector('[data-texto]')) {
    bloco.querySelector('[data-texto]').textContent = alvo.dataset.texto;
  }
  if (alvo.dataset.busca) bloco.querySelector('.busca input').value = alvo.dataset.busca;
  if (alvo.dataset.ativo) {
    const item = bloco.querySelector(`[data-item="${alvo.dataset.ativo}"]`);
    if (item) item.classList.add(item.classList.contains('item-menu') ? 'item-menu--ativo' : 'on');
  }
  if (alvo.hasAttribute('data-admin')) {
    bloco.querySelector('[data-iniciais]').textContent = 'AD';
    bloco.querySelector('[data-nome]').textContent = 'Admin LudiStore';
    bloco.querySelector('[data-papel]').textContent = 'Administrador';
  }
  alvo.replaceWith(bloco);
});

// 2) Monta as listas de produtos
document.querySelectorAll('[data-produtos]').forEach(lista => {
  const comBotao = !lista.hasAttribute('data-sem-botao');
  lista.innerHTML = lista.dataset.produtos.split(',').map(i => cardProduto(PRODUTOS[+i], comBotao)).join('');
});

// 3) Navegação entre telas
const telas = [...document.querySelectorAll('.tela')]
  .sort((a, b) => parseInt(a.dataset.titulo) - parseInt(b.dataset.titulo));
const lista = document.getElementById('proto-lista');
let grupo = '';
telas.forEach(t => {
  if (t.dataset.grupo !== grupo) { grupo = t.dataset.grupo; lista.insertAdjacentHTML('beforeend', `<h6>${grupo}</h6>`); }
  const [num, ...resto] = t.dataset.titulo.split(' · ');
  lista.insertAdjacentHTML('beforeend', `<a href="#${t.id}" data-tela="${t.id}"><i>${num}</i>${resto.join(' · ')}</a>`);
});

function mostrar() {
  const id = location.hash.slice(1) || 'home';
  const tela = document.getElementById(id) || telas[0];
  telas.forEach(t => t.classList.toggle('ativa', t === tela));
  lista.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.tela === tela.id));
  document.getElementById('proto-atual').textContent = tela.dataset.titulo;
  document.title = tela.dataset.titulo.split(' · ').slice(1).join(' · ') + ' · LudiStore';
  document.getElementById('proto').classList.remove('aberto');
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', mostrar);
mostrar();
