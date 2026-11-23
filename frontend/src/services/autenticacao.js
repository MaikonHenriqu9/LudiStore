import { requisicao } from './api.js'

// POST /api/auth/login/  → { token, tipo, expira_em_segundos, usuario }
export const login = (email, senha) =>
  requisicao('/auth/login/', { metodo: 'POST', corpo: { email, senha }, token: null })

// GET /api/auth/eu/  → dados do usuário dono do token
export const usuarioAtual = () => requisicao('/auth/eu/')
