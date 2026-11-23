import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Minus, Plus, Trash2, Package, ShoppingCart, ShieldCheck } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import Vazio from '../../components/Vazio.jsx'
import CardProduto from '../../components/CardProduto.jsx'
import { useCarrinho } from '../../context/CarrinhoContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { reais } from '../../utils/formatar.js'
import { BRINQUEDOS } from '../../dados/exemplo.js'

// Linha do carrinho. Também é usada no Checkout (somenteLeitura).
export function ItemCarrinho({ item, somenteLeitura, destaque }) {
  const { alterarQuantidade, remover } = useCarrinho()
  const { brinquedo: b, quantidade } = item
  return (
    <div className="item-carrinho">
      <Link to={`/produto/${b.id}`}><img src={b.imagem_url || '/favicon.svg'} alt={b.nome} /></Link>
      <div className="cresce">
        <Link to={`/produto/${b.id}`} className="t-corpo-forte">{b.nome}</Link>
        <div className="t-pequeno c-suave">
          {somenteLeitura ? `Vendido por ${b.vendedor} · ${reais(b.preco)} cada` : <>SKU {b.sku} · {b.estoque <= 5 ? <span className="c-rosa">Últimas {b.estoque} unidades</span> : `${b.estoque} em estoque`}</>}
        </div>
        {!somenteLeitura && (
          <div className="qtd qtd--p" style={{ marginTop: 10 }}>
            <button aria-label="Diminuir" onClick={() => alterarQuantidade(b.id, quantidade - 1)} disabled={quantidade <= 1}><Minus size={16} /></button>
            <span>{quantidade}</span>
            <button aria-label="Aumentar" onClick={() => alterarQuantidade(b.id, quantidade + 1)} disabled={quantidade >= b.estoque}><Plus size={16} /></button>
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        {somenteLeitura
          ? <div className={'t-pequeno ' + (destaque ? 'c-rosa' : 'c-suave')}>Qtd {quantidade}</div>
          : <div className="t-pequeno c-suave">{reais(b.preco)} cada</div>}
        <div className="t-preco-card">{reais(quantidade * b.preco)}</div>
        {!somenteLeitura && (
          <button className="btn btn--texto btn--p c-rosa" onClick={() => remover(b.id)}><Trash2 size={16} /><span>Remover</span></button>
        )}
      </div>
    </div>
  )
}

export default function Carrinho() {
  const { itens, total, quantidadeTotal, adicionar } = useCarrinho()
  const { usuario } = useAuth()
  const navegar = useNavigate()

  // Agrupa por vendedor, como no protótipo
  const porVendedor = itens.reduce((grupos, item) => {
    (grupos[item.brinquedo.vendedor] ||= []).push(item)
    return grupos
  }, {})

  const sugestoes = BRINQUEDOS.filter((b) => b.ativo && b.estoque > 0 && !itens.some((i) => i.brinquedo.id === b.id)).slice(0, 5)

  return (
    <div className="container">
      <div className="migalhas"><Link to="/">Início</Link> <ChevronRight /> <b>Carrinho</b></div>
      <div className="linha" style={{ marginBottom: 20, gap: 12 }}>
        <h1 className="t-h1">Meu carrinho</h1>
        {quantidadeTotal > 0 && <Selo cor="azul">{quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'}</Selo>}
      </div>

      {itens.length === 0 ? (
        <Vazio icone={ShoppingCart} titulo="Seu carrinho está vazio" texto="Explore o catálogo e adicione os brinquedos que você gostar." acao="Ver catálogo" para="/catalogo" />
      ) : (
        <div className="carrinho">
          <div className="coluna" style={{ gap: 16 }}>
            <div className="alerta alerta--info">
              <Package size={16} style={{ marginTop: 2, flex: 'none' }} />
              <span>O carrinho fica salvo neste navegador. O estoque só é reservado quando você confirma o pedido.</span>
            </div>
            {Object.entries(porVendedor).map(([vendedor, lista]) => (
              <div key={vendedor} className="caixa" style={{ padding: '8px 24px' }}>
                <div className="linha entre" style={{ padding: '14px 0 10px' }}>
                  <span className="t-pequeno c-suave">Vendido por <b className="c-azul">{vendedor}</b></span>
                  <span className="t-pequeno c-suave">{lista.length} {lista.length === 1 ? 'produto' : 'produtos'}</span>
                </div>
                {lista.map((item) => <ItemCarrinho key={item.brinquedo.id} item={item} />)}
              </div>
            ))}
          </div>

          <div className="caixa resumo">
            <h3 className="t-h2" style={{ marginBottom: 12 }}>Resumo do pedido</h3>
            <ul>
              {itens.map(({ brinquedo: b, quantidade }) => (
                <li key={b.id}><span>{b.nome} × {quantidade}</span><b>{reais(quantidade * b.preco)}</b></li>
              ))}
            </ul>
            <div className="resumo__total">
              <b className="t-corpo-forte">Total ({quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'})</b>
              <span className="t-preco-g" style={{ fontSize: 30 }}>{reais(total)}</span>
            </div>
            <button className="btn btn--destaque btn--g btn--bloco" style={{ marginTop: 18 }} onClick={() => navegar('/checkout')}>
              Continuar para o pedido
            </button>
            <Link to="/catalogo" className="btn btn--contorno btn--bloco" style={{ marginTop: 10 }}>Continuar comprando</Link>
            <p className="t-pequeno c-suave linha" style={{ marginTop: 14, justifyContent: 'center', gap: 6 }}>
              <ShieldCheck size={16} className="c-verde" />{usuario ? 'Você está logado.' : 'Você vai precisar entrar na sua conta.'}
            </p>
          </div>
        </div>
      )}

      {sugestoes.length > 0 && (
        <section className="secao">
          <div className="secao-titulo"><h2 className="t-h2">Aproveite e leve também</h2></div>
          <div className="prateleira">{sugestoes.map((b) => <CardProduto key={b.id} brinquedo={b} onAdicionar={adicionar} />)}</div>
        </section>
      )}
    </div>
  )
}
