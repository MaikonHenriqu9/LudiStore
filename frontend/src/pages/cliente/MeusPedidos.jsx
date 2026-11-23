import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, ChevronDown, ChevronUp, Check, Package, X } from 'lucide-react'
import MenuConta from '../../components/MenuConta.jsx'
import Selo from '../../components/Selo.jsx'
import Vazio from '../../components/Vazio.jsx'
import { listar } from '../../services/pedidos.js'
import { reais } from '../../utils/formatar.js'

const dataHora = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

// Um pedido da lista. Abre e fecha para mostrar os itens.
function CartaoPedido({ pedido: p, aberto, onAlternar, novo }) {
  const qtd = p.itens.reduce((s, i) => s + i.quantidade, 0)
  return (
    <div className="pedido-card" style={novo ? { outline: '2px solid var(--azul-500)' } : undefined}>
      <div className="linha entre" style={{ flexWrap: 'wrap', rowGap: 10 }}>
        <div>
          <b className="t-h3">Pedido #{p.id}</b>
          <div className="t-pequeno c-suave">Realizado em {dataHora(p.criado_em)} · {qtd} {qtd === 1 ? 'item' : 'itens'}</div>
        </div>
        <Selo cor="verde">{p.status === 'CONFIRMADO' ? 'Confirmado' : p.status}</Selo>
        <div style={{ textAlign: 'right' }}><div className="t-pequeno c-suave">Total</div><div className="t-preco-card">{reais(p.total)}</div></div>
        <button className="btn btn--contorno btn--p" onClick={onAlternar} aria-expanded={aberto}>
          {aberto ? <><ChevronUp size={16} />Fechar</> : <><ChevronDown size={16} />Ver itens</>}
        </button>
      </div>
      {aberto && (
        <>
          <div className="divisor" />
          <ul className="lista-simples">
            {p.itens.map((i) => (
              <li key={i.brinquedo_id}>
                <span className="bolha bolha--azul" style={{ width: 44, height: 44 }}><Package size={20} /></span>
                <span className="cresce">
                  <Link to={`/produto/${i.brinquedo_id}`}><b>{i.brinquedo}</b></Link>
                  <div className="t-pequeno c-suave">{i.quantidade} × {reais(i.preco_unitario)}</div>
                </span>
                <b>{reais(i.subtotal)}</b>
              </li>
            ))}
          </ul>
          <p className="t-pequeno c-suave" style={{ marginTop: 10 }}>Os preços são os do momento da compra, mesmo que o vendedor mude o valor depois.</p>
        </>
      )}
    </div>
  )
}

// GET /api/pedidos/  → histórico do usuário logado (RN15)
export default function MeusPedidos() {
  const { state } = useLocation()
  const pedidoNovo = state?.pedidoNovo
  const [pedidos, setPedidos] = useState(null)
  const [erro, setErro] = useState('')
  const [aberto, setAberto] = useState(pedidoNovo ?? null)

  useEffect(() => {
    listar()
      .then((lista) => setPedidos([...lista].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))))
      .catch((err) => setErro(err.message))
  }, [])

  return (
    <div className="container">
      <div className="migalhas"><Link to="/">Início</Link> <ChevronRight /> <Link to="/conta">Minha conta</Link> <ChevronRight /> <b>Meus pedidos</b></div>
      <div className="conta">
        <MenuConta />
        <div className="coluna" style={{ gap: 16 }}>
          {pedidoNovo && (
            <div className="aviso"><Check size={20} /><span><b>Pedido #{pedidoNovo} confirmado!</b> O estoque dos itens já foi reservado.</span></div>
          )}
          <div className="linha entre">
            <h2 className="t-h1">Meus pedidos</h2>
            {pedidos && <span className="t-pequeno c-suave">{pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}</span>}
          </div>

          {erro && <div className="alerta" role="alert"><X size={16} style={{ marginTop: 2, flex: 'none' }} /><span>{erro}</span></div>}
          {!pedidos && !erro && <div className="caixa t-corpo c-suave">Carregando pedidos…</div>}
          {pedidos?.length === 0 && (
            <Vazio icone={Package} titulo="Você ainda não fez pedidos" texto="Quando você comprar, seus pedidos aparecem aqui." acao="Ver catálogo" para="/catalogo" />
          )}
          {pedidos?.map((p) => (
            <CartaoPedido key={p.id} pedido={p} novo={p.id === pedidoNovo}
                          aberto={aberto === p.id} onAlternar={() => setAberto(aberto === p.id ? null : p.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
