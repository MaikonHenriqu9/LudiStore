import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Protege um grupo de rotas no App.jsx:
 *   <Route element={<RotaProtegida />}> ... </Route>                     só logado
 *   <Route element={<RotaProtegida perfis={['VENDEDOR','ADMIN']} />}>   só esses perfis
 * Sem login → vai para /login e volta depois (?proximo=).
 * Logado com outro perfil → volta para a loja.
 * A API também confere o token e o perfil: isto aqui é só para a navegação.
 */
export default function RotaProtegida({ perfis }) {
  const { usuario } = useAuth()
  const { pathname, search } = useLocation()

  if (!usuario) return <Navigate to={`/login?proximo=${encodeURIComponent(pathname + search)}`} replace />
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to="/" replace />
  return <Outlet />
}
