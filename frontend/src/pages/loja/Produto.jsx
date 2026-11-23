import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Minus, Plus, ShoppingCart, Store, Package, ImageOff, Check } from 'lucide-react'
import CardProduto from '../../components/CardProduto.jsx'
import Selo from '../../components/Selo.jsx'
import Vazio from '../../components/Vazio.jsx'
import { useCarrinho } from '../../context/CarrinhoContext.jsx'
import { reais, idade, iniciais, seloDoBrinquedo } from '../../utils/formatar.js'
import { BRINQUEDOS } from '../../dados/exemplo.js'
import * as brinquedosService from '../../services/brinquedos.js'

// /produto/:id  →  GET /api/brinquedos/<id>/
export default function Produto() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { adicionar, itens } = useCarrinho()
  const [quantidade, setQuantidade] = useState(1)
  const [aba, setAba] = useState('descricao')
  const [adicionado, setAdicionado] = useState(false)
  const [b, setB] = useState(() => BRINQUEDOS.find((x) => String(x.id) === id && x.ativo))
  const [carregando, setCarregando] = useState(!b)

  useEffect(() => {
    brinquedosService.buscar(id)
      .then((dados) => {
        if (dados && dados.ativo) setB(dados)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) {
    return <div className="container" style={{ padding: '48px 0', textAlign: 'center' }}>Carregando produto…</div>
  }

  if (!b) {
    return (
      <div className="container" style={{ padding: '48px 0' }}>
        <Vazio titulo="Brinquedo não encontrado" texto="Ele pode ter sido desativado pelo vendedor." acao="Ver catálogo" para="/catalogo" />
      </div>
    )
  }

  const esgotado = b.estoque === 0
  const noCarrinho = itens.find((i) => i.brinquedo.id === b.id)?.quantidade || 0
  const maximo = Math.max(0, b.estoque - noCarrinho)
  const selo = seloDoBrinquedo(b)

  // Mais brinquedos da mesma faixa de idade (±2 anos), sem o atual
  const relacionados = BRINQUEDOS
    .filter((x) => x.ativo && x.id !== b.id && Math.abs(x.idade_minima - b.idade_minima) <= 2)
    .slice(0, 5)

  function adicionarAoCarrinho() {
    adicionar(b, quantidade)
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 2500)
  }

  return (
    <div className="container">
      <div className="migalhas">
        <Link to="/">Início</Link> <ChevronRight />
        <Link to={`/catalogo?categoria=${encodeURIComponent(b.categorias[0])}`}>{b.categorias[0]}</Link> <ChevronRight />
        <b>{b.nome}</b>
      </div>

      <div className="produto">
        <div className="galeria galeria--unica">
          <div className="galeria__principal">
            {b.imagem_url
              ? <img src={b.imagem_url} alt={b.nome} style={esgotado ? { opacity: 0.55, filter: 'grayscale(.6)' } : undefined} />
              : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--neutro-400)' }}><ImageOff size={64} /></div>}
          </div>
        </div>

        <div className="info-produto">
          <div className="linha" style={{ gap: 8, flexWrap: 'wrap' }}>
            {b.categorias.map((c) => <Selo key={c} cor="azul">{c}</Selo>)}
            {esgotado ? <Selo cor="cinza">Esgotado</Selo> : <Selo cor="verde">{b.estoque} em estoque</Selo>}
            {selo && selo[0] === 'Novidade' && <Selo cor="amarelo">Novidade</Selo>}
          </div>
          <h1 className="t-h1">{b.nome}</h1>
          <div className="linha t-pequeno c-suave" style={{ gap: 14, flexWrap: 'wrap' }}>
            <span>SKU {b.sku}</span>
            <span>Marca <b style={{ color: 'var(--marinho-900)' }}>{b.marca}</b></span>
            <span>{idade(b.idade_minima)}</span>
          </div>

          <div className="preco-caixa">
            <div className="t-preco-g">{reais(b.preco)}</div>
            <div className="t-pequeno c-suave" style={{ marginTop: 4 }}>Preço por unidade</div>
          </div>

          <div className="vendedor-caixa">
            <span className="avatar">{iniciais(b.vendedor)}</span>
            <div className="cresce"><div className="t-pequeno c-suave">Vendido por</div><b>{b.vendedor}</b></div>
            <Store size={20} className="c-fraco" />
          </div>

          {!esgotado && (
            <div className="linha" style={{ gap: 16, flexWrap: 'wrap' }}>
              <span className="t-corpo-forte">Quantidade</span>
              <div className="qtd">
                <button aria-label="Diminuir" onClick={() => setQuantidade(Math.max(1, quantidade - 1))}><Minus size={16} /></button>
                <span>{quantidade}</span>
                <button aria-label="Aumentar" onClick={() => setQuantidade(Math.min(maximo, quantidade + 1))}><Plus size={16} /></button>
              </div>
              <span className="t-pequeno c-suave">
                Máximo: {maximo}{noCarrinho > 0 && ` (você já tem ${noCarrinho} no carrinho)`}
              </span>
            </div>
          )}

          {esgotado ? (
            <button className="btn btn--contorno btn--g" disabled>Esgotado</button>
          ) : (
            <div className="grade" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn btn--destaque btn--g" disabled={maximo === 0}
                      onClick={() => { adicionar(b, quantidade); navegar('/checkout') }}>Comprar agora</button>
              <button className="btn btn--primario btn--g" disabled={maximo === 0} onClick={adicionarAoCarrinho}>
                {adicionado ? <><Check size={20} />Adicionado!</> : <><ShoppingCart size={20} />Adicionar ao carrinho</>}
              </button>
            </div>
          )}

          <div className="alerta alerta--info t-pequeno">
            <Package size={16} style={{ marginTop: 2, flex: 'none' }} />
            <span>O estoque é reservado só quando o pedido é confirmado. Se outra pessoa comprar antes, avisamos no checkout.</span>
          </div>
        </div>
      </div>

      <div className="caixa secao" style={{ padding: '8px 28px 28px' }}>
        <div className="abas">
          <button className={aba === 'descricao' ? 'on' : ''} onClick={() => setAba('descricao')}>Descrição</button>
          <button className={aba === 'detalhes' ? 'on' : ''} onClick={() => setAba('detalhes')}>Detalhes</button>
        </div>
        <div style={{ marginTop: 22 }}>
          {aba === 'descricao' ? (
            <p className="t-corpo" style={{ color: 'var(--marinho-700)', maxWidth: 760 }}>{b.descricao || 'O vendedor não incluiu uma descrição.'}</p>
          ) : (
            <table className="ficha" style={{ maxWidth: 560 }}>
              <tbody>
                <tr><td>SKU</td><td>{b.sku}</td></tr>
                <tr><td>Marca</td><td>{b.marca}</td></tr>
                <tr><td>Categorias</td><td>{b.categorias.join(', ')}</td></tr>
                <tr><td>Idade mínima</td><td>{b.idade_minima === 0 ? 'Todas as idades' : `${b.idade_minima} anos`}</td></tr>
                <tr><td>Estoque</td><td>{b.estoque} unidades</td></tr>
                <tr><td>Vendedor</td><td>{b.vendedor}</td></tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="secao">
          <div className="secao-titulo"><h2 className="t-h2">Mais brinquedos para a mesma idade</h2></div>
          <div className="prateleira">{relacionados.map((x) => <CardProduto key={x.id} brinquedo={x} onAdicionar={adicionar} />)}</div>
        </section>
      )}
    </div>
  )
}
