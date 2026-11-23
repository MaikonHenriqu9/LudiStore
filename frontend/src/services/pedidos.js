import { requisicao } from './api.js'

// POST /api/pedidos/  { itens: [{ brinquedo_id, quantidade }] }
// O comprador é o usuário logado (vem do token).
export const criar = (itens) => requisicao('/pedidos/', { metodo: 'POST', corpo: { itens } })

// GET /api/pedidos/  → pedidos do usuário logado (o admin vê todos; aceita ?comprador_id=)
export const listar = (compradorId) =>
  requisicao(compradorId ? `/pedidos/?comprador_id=${compradorId}` : '/pedidos/')

// GET /api/pedidos/<id>/
export const buscar = (id) => requisicao(`/pedidos/${id}/`)

// GET /api/pedidos/vendas/  → itens vendidos dos brinquedos do vendedor logado (RN14)
export const vendas = () => requisicao('/pedidos/vendas/')
