import { NavLink, useNavigate } from 'react-router-dom'
import { User, Package, MapPin, Lock, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { iniciais, data } from '../utils/formatar.js'

// Menu da área do cliente (Minha conta e Meus pedidos).
// Endereço e senha são seções da própria página Minha conta (âncoras #endereco e #senha).
export default function MenuConta() {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()
  const classe = ({ isActive }) => (isActive ? 'on' : undefined)

  return (
    <nav className="conta__menu">
      {usuario && (
        <div className="conta__perfil">
          <span className="avatar">{iniciais(usuario.nome)}</span>
          <div>
            <b>{usuario.nome}</b>
            {usuario.criado_em && <div className="t-pequeno c-suave">Cliente desde {data(usuario.criado_em)}</div>}
          </div>
        </div>
      )}
      <NavLink to="/conta" end className={classe}><User size={20} />Meus dados</NavLink>
      <NavLink to="/conta/pedidos" className={classe}><Package size={20} />Meus pedidos</NavLink>
      <a href="/conta#endereco"><MapPin size={20} />Endereço</a>
      <a href="/conta#senha"><Lock size={20} />Alterar senha</a>
      <a href="/login" className="sair" onClick={(e) => { e.preventDefault(); sair(); navegar('/login') }}>
        <LogOut size={20} />Sair
      </a>
    </nav>
  )
}
