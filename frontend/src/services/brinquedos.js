import { requisicao } from './api.js'

// GET /api/brinquedos/?ordem=
export const listar = (ordem) =>
  requisicao(ordem ? `/brinquedos/?ordem=${encodeURIComponent(ordem)}` : '/brinquedos/')

// GET /api/brinquedos/<id>/
export const buscar = (id) => requisicao(`/brinquedos/${id}/`)

// GET /api/brinquedos/meus/  (produtos do vendedor logado, inclusive desativados)
export const meus = () => requisicao('/brinquedos/meus/')

// POST /api/brinquedos/
export const criar = (dados) => requisicao('/brinquedos/', { metodo: 'POST', corpo: dados })

// PATCH /api/brinquedos/<id>/
export const atualizar = (id, dados) => requisicao(`/brinquedos/${id}/`, { metodo: 'PATCH', corpo: dados })

// DELETE /api/brinquedos/<id>/  (desativação lógica)
export const desativar = (id) => requisicao(`/brinquedos/${id}/`, { metodo: 'DELETE' })

// PATCH /api/brinquedos/<id>/reativar/
export const reativar = (id) => requisicao(`/brinquedos/${id}/reativar/`, { metodo: 'PATCH' })
