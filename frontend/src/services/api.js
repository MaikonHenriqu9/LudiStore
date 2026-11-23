// Cliente HTTP da LudiStore. Todas as chamadas à API passam por aqui.
// Em desenvolvimento, "/api" é repassado pelo Vite para http://127.0.0.1:8000 (vite.config.js).

const BASE = '/api'
const CHAVE_SESSAO = 'ludistore:sessao'   // a mesma do AuthContext

function tokenSalvo() {
  try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO))?.token ?? null } catch { return null }
}

// Erro com o que a API devolveu:
//  - regra de negócio (400/404): { "erro": "Estoque insuficiente..." }
//  - formato inválido (400):     { "email": ["Informe um e-mail válido."], ... }
//  - sem login / sem permissão:   { "detail": "..." } com status 401 / 403
export class ErroApi extends Error {
  constructor(status, corpo) {
    const campos = corpo && typeof corpo === 'object' && !corpo.erro && !corpo.detail ? corpo : null
    const primeiroDoCampo = campos ? Object.values(campos).flat()[0] : null
    super(corpo?.erro || corpo?.detail || primeiroDoCampo || `Erro ${status} ao falar com o servidor.`)
    this.status = status
    this.campos = campos   // { campo: 'mensagem' } para mostrar embaixo de cada campo
      ? Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]))
      : {}
  }
}

/**
 * requisicao('/brinquedos/')                                  GET
 * requisicao('/pedidos/', { metodo: 'POST', corpo: {...} })   POST com JSON
 * O token do usuário logado vai automaticamente no cabeçalho Authorization.
 */
export async function requisicao(caminho, { metodo = 'GET', corpo, token = tokenSalvo() } = {}) {
  const cabecalhos = { Accept: 'application/json' }
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'
  if (token) cabecalhos.Authorization = `Bearer ${token}`

  let resposta
  try {
    resposta = await fetch(BASE + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new ErroApi(0, { erro: 'Não foi possível falar com o servidor. Confira se o back-end está rodando.' })
  }

  if (resposta.status === 204) return null
  const dados = await resposta.json().catch(() => null)
  if (!resposta.ok) throw new ErroApi(resposta.status, dados)
  return dados
}
