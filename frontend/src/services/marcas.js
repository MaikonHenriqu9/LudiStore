import { requisicao } from './api.js'

// GET /api/marcas/
export const listar = () => requisicao('/marcas/')

// GET /api/marcas/<id>/
export const buscar = (id) => requisicao(`/marcas/${id}/`)

// POST /api/marcas/
export const criar = (dados) => requisicao('/marcas/', { metodo: 'POST', corpo: dados })

// PATCH /api/marcas/<id>/
export const atualizar = (id, dados) => requisicao(`/marcas/${id}/`, { metodo: 'PATCH', corpo: dados })

// DELETE /api/marcas/<id>/
export const desativar = (id) => requisicao(`/marcas/${id}/`, { metodo: 'DELETE' })

// PATCH /api/marcas/<id>/reativar/
export const reativar = (id) => requisicao(`/marcas/${id}/reativar/`, { metodo: 'PATCH' })
