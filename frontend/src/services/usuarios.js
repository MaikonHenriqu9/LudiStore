import { requisicao } from './api.js'

// POST /api/usuarios/  (cadastro público: CLIENTE ou VENDEDOR)
export const cadastrar = (dados) => requisicao('/usuarios/', { metodo: 'POST', corpo: dados, token: null })

// PATCH /api/usuarios/<id>/  (só os campos enviados; o perfil não muda)
export const atualizar = (id, dados) => requisicao(`/usuarios/${id}/`, { metodo: 'PATCH', corpo: dados })

// Usados pelo admin
export const listar = (busca) => requisicao(busca ? `/usuarios/?busca=${encodeURIComponent(busca)}` : '/usuarios/')
export const desativar = (id) => requisicao(`/usuarios/${id}/`, { metodo: 'DELETE' })
export const reativar = (id) => requisicao(`/usuarios/${id}/reativar/`, { metodo: 'PATCH' })
