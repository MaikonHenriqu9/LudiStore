import { Search, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { iniciais } from '../utils/formatar.js'

const PAPEL = { ADMIN: 'Administrador', VENDEDOR: 'Vendedor', CLIENTE: 'Cliente' }

// Barra do topo dos painéis. A busca filtra a tela atual (onBuscar é opcional).
export default function TopoPainel({ onBuscar }) {
  const { usuario } = useAuth()
  return (
    <div className="painel__topo">
      <div className="campo__caixa">
        <Search size={16} />
        <input placeholder="Buscar no painel…" onChange={(e) => onBuscar?.(e.target.value)} />
      </div>
      <div className="linha" style={{ gap: 16 }}>
        <span className="sino"><Bell size={20} /></span>
        {usuario && (
          <>
            <span className="avatar">{iniciais(usuario.nome)}</span>
            <div className="t-pequeno"><b>{usuario.nome}</b><div className="c-suave">{PAPEL[usuario.perfil]}</div></div>
          </>
        )}
      </div>
    </div>
  )
}
