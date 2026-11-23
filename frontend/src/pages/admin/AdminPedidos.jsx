import { useState, useEffect, useMemo } from 'react'
import { Search, Calendar, ChevronDown, Package } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import * as pedidosService from '../../services/pedidos.js'
import { reais, data, iniciais } from '../../utils/formatar.js'

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [compradorFiltro, setCompradorFiltro] = useState('')
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState(null)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const dados = await pedidosService.listar()
        setPedidos(dados || [])
        if (dados && dados.length > 0) {
          setPedidoSelecionadoId(dados[0].id)
        }
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const compradores = useMemo(() => {
    const mapa = new Map()
    pedidos.forEach((p) => {
      const nome = p.comprador_nome || p.comprador?.nome || p.comprador || `Cliente #${p.comprador_id || ''}`
      const id = p.comprador_id || (typeof p.comprador === 'object' ? p.comprador.id : nome)
      mapa.set(String(id), nome)
    })
    return Array.from(mapa.entries()).map(([id, nome]) => ({ id, nome }))
  }, [pedidos])

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const termo = busca.toLowerCase()
      const compradorNome = (p.comprador_nome || p.comprador?.nome || p.comprador || '').toLowerCase()
      const pedidoStr = String(p.id)

      const bateBusca = !busca || pedidoStr.includes(termo) || compradorNome.includes(termo)
      const compradorId = String(p.comprador_id || (typeof p.comprador === 'object' ? p.comprador.id : ''))
      const bateComprador = !compradorFiltro || compradorId === compradorFiltro

      return bateBusca && bateComprador
    })
  }, [pedidos, busca, compradorFiltro])

  const pedidoAtivo = useMemo(() => {
    return pedidos.find((p) => p.id === pedidoSelecionadoId) || pedidosFiltrados[0] || null
  }, [pedidos, pedidoSelecionadoId, pedidosFiltrados])

  return (
    <div className="painel__corpo">
      <div className="painel__titulo">
        <div>
          <h1 className="t-h1">Pedidos</h1>
          <p>Pedidos confirmados da plataforma. Os registros são imutáveis após a confirmação.</p>
        </div>
        <div className="campo__caixa" style={{ width: 200 }}>
          <Calendar size={16} />
          <select defaultValue="todos">
            <option value="todos">Todos os períodos</option>
          </select>
        </div>
      </div>

      <div className="duas-colunas" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="tabela-caixa">
          <div className="tabela-caixa__barra">
            <div className="campo__caixa" style={{ width: 260 }}>
              <Search size={16} />
              <input
                placeholder="Nº do pedido ou comprador"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="campo__caixa" style={{ width: 200 }}>
              <select
                value={compradorFiltro}
                onChange={(e) => setCompradorFiltro(e.target.value)}
              >
                <option value="">Todos os compradores</option>
                {compradores.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="tabela-rolagem">
            <table className="tabela">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Comprador</th>
                <th>Itens</th>
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Carregando pedidos…</td></tr>
              ) : pedidosFiltrados.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Nenhum pedido encontrado.</td></tr>
              ) : (
                pedidosFiltrados.map((p) => {
                  const qtdItens = Array.isArray(p.itens)
                    ? p.itens.reduce((acc, i) => acc + Number(i.quantidade || 1), 0)
                    : (p.quantidade_itens || 1)
                  const compradorNome = p.comprador_nome || p.comprador?.nome || p.comprador || `Cliente #${p.comprador_id || ''}`
                  const selecionado = pedidoAtivo?.id === p.id

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setPedidoSelecionadoId(p.id)}
                      style={{
                        cursor: 'pointer',
                        background: selecionado ? 'var(--azul-50)' : undefined
                      }}
                    >
                      <td>
                        <b className={selecionado ? 'c-azul' : ''}>#{p.id}</b>
                      </td>
                      <td>{compradorNome}</td>
                      <td>{qtdItens}</td>
                      <td>{p.criado_em ? data(p.criado_em) : 'Hoje'}</td>
                      <td><b>{reais(p.total)}</b></td>
                      <td>
                        <Selo cor="verde">{p.status || 'Confirmado'}</Selo>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            </table>
          </div>
        </div>

        {pedidoAtivo ? (
          <div className="caixa">
            <div className="linha entre">
              <div>
                <span className="t-rotulo c-suave">Detalhe do pedido</span>
                <h3 className="t-h2">#{pedidoAtivo.id}</h3>
              </div>
              <Selo cor="verde">{pedidoAtivo.status || 'Confirmado'}</Selo>
            </div>

            <div className="linha" style={{ margin: '14px 0' }}>
              <span className="avatar">
                {iniciais(pedidoAtivo.comprador_nome || pedidoAtivo.comprador?.nome || pedidoAtivo.comprador || 'CL')}
              </span>
              <div>
                <b>{pedidoAtivo.comprador_nome || pedidoAtivo.comprador?.nome || pedidoAtivo.comprador || 'Cliente'}</b>
                <div className="t-pequeno c-suave">
                  {pedidoAtivo.comprador?.email || pedidoAtivo.comprador_email || 'Email cadastrado'}
                  {pedidoAtivo.comprador?.cpf ? ` · CPF ${pedidoAtivo.comprador.cpf}` : ''}
                </div>
              </div>
            </div>

            <div className="divisor" />

            <h4 className="t-h3" style={{ margin: '12px 0 8px' }}>Itens do pedido</h4>
            <ul className="lista-simples">
              {Array.isArray(pedidoAtivo.itens) && pedidoAtivo.itens.length > 0 ? (
                pedidoAtivo.itens.map((item, idx) => (
                  <li key={idx}>
                    <img
                      src={item.imagem_url || '/img/blocos.jpg'}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                      alt=""
                    />
                    <span className="cresce t-pequeno">
                      <b>{item.brinquedo_nome || item.brinquedo || `Brinquedo #${item.brinquedo_id}`}</b>
                      <div className="c-suave">
                        {item.quantidade} × {reais(item.preco_unitario)}
                      </div>
                    </span>
                    <b>{reais(item.subtotal || (item.quantidade * item.preco_unitario))}</b>
                  </li>
                ))
              ) : (
                <li className="t-pequeno c-suave">Sem itens detalhados.</li>
              )}
            </ul>

            <div className="divisor" />

            <div className="resumo__total" style={{ marginTop: 14 }}>
              <b>Total</b>
              <span className="t-preco-card">{reais(pedidoAtivo.total)}</span>
            </div>
          </div>
        ) : (
          <div className="caixa" style={{ textAlign: 'center', padding: 32 }}>
            <Package size={32} className="c-suave" style={{ margin: '0 auto 8px' }} />
            <p className="c-suave">Selecione um pedido para ver os detalhes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
