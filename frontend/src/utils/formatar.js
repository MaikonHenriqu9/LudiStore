// Funções de formatação usadas em várias telas.

// 99.9 ou "99.90" (a API manda Decimal como texto) → "R$ 99,90"
export const reais = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// idade_minima → texto do card
export const idade = (n) =>
  n === 0 ? 'Todas as idades' : `A partir de ${n} ${n === 1 ? 'ano' : 'anos'}`

// "2026-11-22T10:42:00-03:00" → "22/11/2026"
export const data = (iso) => new Date(iso).toLocaleDateString('pt-BR')

// Iniciais para o avatar: "Sandra Rodrigues" → "SR"
export const iniciais = (nome = '') =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

// Brinquedo cadastrado há até 15 dias conta como novidade
const QUINZE_DIAS = 15 * 24 * 60 * 60 * 1000
export const ehNovo = (criadoEm) => Date.now() - new Date(criadoEm).getTime() < QUINZE_DIAS

// Selo do card calculado a partir do estoque e do criado_em → [texto, cor] ou null
export function seloDoBrinquedo(b) {
  if (b.estoque === 0) return ['Esgotado', 'cinza']
  if (b.estoque <= 5) return [`Últimas ${b.estoque}`, 'rosa']
  if (ehNovo(b.criado_em)) return ['Novidade', 'azul']
  return null
}
