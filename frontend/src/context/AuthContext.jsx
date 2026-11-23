import { createContext, useContext, useState } from 'react'

// Guarda quem está logado. A resposta de POST /api/auth/login/ é:
// { token, tipo: 'Bearer', expira_em_segundos, usuario: { id, nome, perfil, ... } }
// Na etapa 4 a tela de Login chama a API e passa essa resposta para entrar().

const AuthContext = createContext(null)
const CHAVE = 'ludistore:sessao'

function lerSessao() {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE))
    if (!s || Date.now() > s.expiraEm) return null   // token vencido (8 h)
    return s
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao)

  function entrar(respostaLogin) {
    const nova = {
      token: respostaLogin.token,
      usuario: respostaLogin.usuario,
      expiraEm: Date.now() + respostaLogin.expira_em_segundos * 1000,
    }
    try { localStorage.setItem(CHAVE, JSON.stringify(nova)) } catch { /* sem localStorage */ }
    setSessao(nova)
  }

  // Depois de salvar "Minha conta", troca os dados guardados pelo que a API devolveu
  function atualizarUsuario(usuarioNovo) {
    setSessao((atual) => {
      if (!atual) return atual
      const nova = { ...atual, usuario: usuarioNovo }
      try { localStorage.setItem(CHAVE, JSON.stringify(nova)) } catch { /* sem localStorage */ }
      return nova
    })
  }

  function sair() {
    try { localStorage.removeItem(CHAVE) } catch { /* sem localStorage */ }
    setSessao(null)
  }

  const usuario = sessao?.usuario ?? null
  const valor = {
    usuario,
    token: sessao?.token ?? null,
    logado: !!usuario,
    ehAdmin: usuario?.perfil === 'ADMIN',
    ehVendedor: usuario?.perfil === 'VENDEDOR',
    entrar,
    atualizarUsuario,
    sair,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
