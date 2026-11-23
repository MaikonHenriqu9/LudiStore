import { Outlet } from 'react-router-dom'
import MenuLateral from '../components/MenuLateral.jsx'
import TopoPainel from '../components/TopoPainel.jsx'

// Painéis do vendedor e do admin. A proteção por perfil (só VENDEDOR/ADMIN entra)
// é ligada na etapa 4, junto com o login de verdade.
export default function LayoutPainel({ perfil }) {
  return (
    <div className="painel">
      <MenuLateral perfil={perfil} />
      <div className="painel__main">
        <TopoPainel />
        <Outlet />
      </div>
    </div>
  )
}
