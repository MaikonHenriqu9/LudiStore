import { requisicao } from './api.js'

// GET /api/categorias/
export const listar = () => requisicao('/categorias/')

// GET /api/categorias/<id>/
export const buscar = (id) => requisicao(`/categorias/${id}/`)

// POST /api/categorias/
export const criar = (dados) => requisicao('/categorias/', { metodo: 'POST', corpo: dados })

// PATCH /api/categorias/<id>/
export const atualizar = (id, dados) => requisicao(`/categorias/${id}/`, { metodo: 'PATCH', corpo: dados })

// DELETE /api/categorias/<id>/
export const desativar = (id) => requisicao(`/categorias/${id}/`, { metodo: 'DELETE' })

// PATCH /api/categorias/<id>/reativar/
export const reativar = (id) => requisicao(`/categorias/${id}/reativar/`, { metodo: 'PATCH' })
