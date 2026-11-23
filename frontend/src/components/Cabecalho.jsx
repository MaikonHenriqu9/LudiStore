import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, User, Package, ShoppingCart, Menu, Star, ShieldCheck, Store } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCarrinho } from '../context/CarrinhoContext.jsx'
import { reais } from '../utils/formatar.js'
import { CATEGORIAS } from '../dados/exemplo.js'

// Para onde o link "Minha conta" leva, conforme o perfil
const AREA_DO_PERFIL = { CLIENTE: '/conta', VENDEDOR: '/vendedor/produtos', ADMIN: '/admin' }

export default function Cabecalho() {
  const { usuario } = useAuth()
  const { quantidadeTotal, total } = useCarrinho()
  const [params] = useSearchParams()
  const [termo, setTermo] = useState(params.get('q') ?? '')
  const navegar = useNavigate()

  function buscar(e) {
    e.preventDefault()
    if (termo.trim()) navegar(`/busca?q=${encodeURIComponent(termo.trim())}`)
  }

  const primeiroNome = usuario?.nome.split(' ')[0]

  return (
    <header className="cabecalho">
      <div className="cabecalho__faixa">
        <span><ShieldCheck size={16} />Compra segura com login</span>
        <span><Package size={16} />Estoque atualizado em tempo real</span>
        <span><Store size={16} />Brinquedos de vendedores parceiros</span>
      </div>

      <div className="cabecalho__principal">
        <Logo />
        <form className="busca" role="search" onSubmit={buscar}>
          <input value={termo} onChange={(e) => setTermo(e.target.value)}
                 placeholder="O que você está procurando? Busque por brinquedo, marca ou idade"
                 aria-label="Buscar brinquedos" />
          <button aria-label="Buscar"><Search size={20} /></button>
        </form>
        <div className="cabecalho__acoes">
          <Link to={usuario ? AREA_DO_PERFIL[usuario.perfil] : '/login'} className="acao">
            <span className="acao__bolha"><User size={20} /></span>
            <span>
              <small>{usuario ? `Olá, ${primeiroNome}` : 'Olá, visitante'}</small>
              <strong>{usuario ? 'Minha conta' : 'Entre ou cadastre-se'}</strong>
            </span>
          </Link>
          <Link to="/conta/pedidos" className="acao">
            <span className="acao__bolha"><Package size={20} /></span>
            <span><small>Acompanhe</small><strong>Meus pedidos</strong></span>
          </Link>
          <Link to="/carrinho" className="acao" aria-label={`Carrinho com ${quantidadeTotal} itens`}>
            <span className="acao__bolha acao__bolha--cheia">
              <ShoppingCart size={20} />
              {quantidadeTotal > 0 && <span className="acao__qtd">{quantidadeTotal}</span>}
            </span>
            <span><small>Carrinho</small><strong>{reais(total)}</strong></span>
          </Link>
        </div>
      </div>

      <nav className="cabecalho__menu" aria-label="Categorias">
        <Link to="/catalogo" className="cabecalho__todas"><Menu size={16} />Todas as categorias</Link>
        {CATEGORIAS.map((c) => (
          <Link key={c} to={`/catalogo?categoria=${encodeURIComponent(c)}`}>{c}</Link>
        ))}
        <Link to="/catalogo?ordem=recentes" className="cabecalho__ofertas"><Star size={16} />Novidades</Link>
      </nav>
    </header>
  )
}
