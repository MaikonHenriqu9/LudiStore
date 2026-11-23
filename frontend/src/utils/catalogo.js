// Busca, filtros e ordenação do catálogo, feitos no front.
// A API (GET /api/brinquedos/) devolve o catálogo inteiro e só ordena (?ordem=).
// Por isso filtrar por categoria, marca, idade, preço e texto acontece aqui.

// Mesmas 4 estratégias do back-end (catalogo/strategies/)
export const ORDENS = [
  ['nome', 'Nome (A–Z)'],
  ['menor_preco', 'Menor preço'],
  ['maior_preco', 'Maior preço'],
  ['recentes', 'Mais recentes'],
]

export function ordenar(lista, ordem = 'nome') {
  const copia = [...lista]
  switch (ordem) {
    case 'menor_preco': return copia.sort((a, b) => a.preco - b.preco)
    case 'maior_preco': return copia.sort((a, b) => b.preco - a.preco)
    case 'recentes': return copia.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
    default: return copia.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }
}

// Ignora acentos e maiúsculas: "pelucia" encontra "Pelúcia"
const normalizar = (t = '') => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function buscarTexto(lista, termo) {
  const t = normalizar(termo.trim())
  if (!t) return lista
  return lista.filter((b) =>
    [b.nome, b.descricao, b.marca, b.sku, ...b.categorias].some((campo) => normalizar(campo).includes(t)))
}

/**
 * filtros = {
 *   categorias: ['Pelúcias'],   marcas: ['Brinca Mais'],
 *   idadeAte: 3,                // mostra brinquedos com idade_minima ≤ 3
 *   precoMin: 20, precoMax: 200,
 *   soComEstoque: true,
 * }
 */
export function filtrar(lista, f = {}) {
  return lista.filter((b) =>
    (!f.categorias?.length || b.categorias.some((c) => f.categorias.includes(c))) &&
    (!f.marcas?.length || f.marcas.includes(b.marca)) &&
    (f.idadeAte == null || b.idade_minima <= f.idadeAte) &&
    (f.precoMin == null || f.precoMin === '' || Number(b.preco) >= Number(f.precoMin)) &&
    (f.precoMax == null || f.precoMax === '' || Number(b.preco) <= Number(f.precoMax)) &&
    (!f.soComEstoque || b.estoque > 0))
}

// Quantos brinquedos há em cada valor de um campo (para os números dos filtros)
export function contar(lista, campo) {
  const total = {}
  for (const b of lista) {
    const valores = Array.isArray(b[campo]) ? b[campo] : [b[campo]]
    for (const v of valores) total[v] = (total[v] || 0) + 1
  }
  return total
}
