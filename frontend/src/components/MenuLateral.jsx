import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Package, Plus, TrendingUp, User, Store, LogOut, LayoutDashboard, Users, Receipt, Tag } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { iniciais } from '../utils/formatar.js'

// Itens de cada painel: [caminho, texto, ícone]
const MENUS = {
  vendedor: {
    titulo: 'Área do vendedor',
    itens: [
      ['/vendedor/produtos', 'Meus produtos', Package],
      ['/vendedor/produtos/novo', 'Novo produto', Plus],
      ['/vendedor/vendas', 'Minhas vendas', TrendingUp],
      ['/conta', 'Meu perfil', User],
    ],
  },
  admin: {
    titulo: 'Administração',
    itens: [
      ['/admin', 'Visão geral', LayoutDashboard],
      ['/admin/produtos', 'Produtos', Package],
      ['/admin/usuarios', 'Usuários', Users],
      ['/admin/pedidos', 'Pedidos', Receipt],
      ['/admin/catalogo', 'Marcas e categorias', Tag],
    ],
  },
}

export default function MenuLateral({ perfil }) {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()
  const menu = MENUS[perfil]

  function fazerLogout() {
    sair()
    navegar('/login')
  }

  return (
    <aside className="lateral">
      <Logo variante="branco" pequena />
      <div className="lateral__grupo">{menu.titulo}</div>
      {menu.itens.map(([para, texto, Icone]) => (
        <NavLink key={para} to={para} end
                 className={({ isActive }) => 'item-menu' + (isActive ? ' item-menu--ativo' : '')}>
          <Icone size={20} />{texto}
        </NavLink>
      ))}
      <div className="lateral__grupo">Loja</div>
      <Link to="/" className="item-menu"><Store size={20} />Ver loja</Link>
      <button type="button" className="item-menu" onClick={fazerLogout}
              style={{ background: 'none', border: 0, textAlign: 'left' }}>
        <LogOut size={20} />Sair
      </button>
      {usuario && (
        <div className="lateral__usuario">
          <span className="avatar avatar--p">{iniciais(usuario.nome)}</span>
          <div><b>{usuario.nome}</b><small>{usuario.email}</small></div>
        </div>
      )}
    </aside>
  )
}
