import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Receipt, Package, Star, Search, Calendar } from 'lucide-react'
import * as pedidosService from '../../services/pedidos.js'
import { reais, data } from '../../utils/formatar.js'

export default function MinhasVendas() {
  const [vendas, setVendas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      setErro('')
      try {
        const dados = await pedidosService.vendas()
        setVendas(dados || [])
      } catch {
        setErro('Erro ao carregar as vendas do vendedor.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const faturamentoTotal = useMemo(() => {
    return vendas.reduce((s, v) => s + Number(v.subtotal || (v.quantidade * v.preco_unitario) || 0), 0)
  }, [vendas])

  const pedidosDistintos = useMemo(() => {
    return new Set(vendas.map((v) => v.pedido_id)).size
  }, [vendas])

  const unidadesVendidas = useMemo(() => {
    return vendas.reduce((s, v) => s + Number(v.quantidade || 0), 0)
  }, [vendas])

  const ticketMedio = pedidosDistintos > 0 ? faturamentoTotal / pedidosDistintos : 0

  const vendasFiltradas = useMemo(() => {
    return vendas.filter((v) => {
      const termo = busca.toLowerCase()
      const produtoNome = (v.brinquedo_nome || v.brinquedo || '').toLowerCase()
      const compradorNome = (v.comprador_nome || v.comprador || '').toLowerCase()
      return !busca || produtoNome.includes(termo) || compradorNome.includes(termo)
    })
  }, [vendas, busca])

  const rankingMaisVendidos = useMemo(() => {
    const mapa = {}
    vendas.forEach((v) => {
      const chave = v.brinquedo_id || v.brinquedo_nome || v.brinquedo
      if (!mapa[chave]) {
        mapa[chave] = {
          nome: v.brinquedo_nome || v.brinquedo,
          quantidade: 0,
          total: 0,
          imagem_url: v.imagem_url || '/img/blocos.jpg',
        }
      }
      mapa[chave].quantidade += Number(v.quantidade || 0)
      mapa[chave].total += Number(v.subtotal || (v.quantidade * v.preco_unitario) || 0)
    })
    return Object.values(mapa).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)
  }, [vendas])

  return (
    <div className="painel__corpo">
      <div className="painel__titulo">
        <div>
          <h1 className="t-h1">Minhas vendas</h1>
          <p>Todos os itens dos seus produtos vendidos na LudiStore.</p>
        </div>
        <div className="campo__caixa" style={{ width: 200 }}>
          <Calendar size={16} />
          <select defaultValue="30">
            <option value="30">Últimos 30 dias</option>
            <option value="todos">Todo o período</option>
          </select>
        </div>
      </div>

      <div className="indicadores">
        <div className="card-indicador">
          <span className="card-indicador__bolha verde"><TrendingUp size={20} /></span>
          <div>
            <b>{reais(faturamentoTotal)}</b>
            <small>Faturamento no período</small>
          </div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha"><Receipt size={20} /></span>
          <div>
            <b>{pedidosDistintos}</b>
            <small>Pedidos com seus produtos</small>
          </div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha amarelo"><Package size={20} /></span>
          <div>
            <b>{unidadesVendidas}</b>
            <small>Unidades vendidas</small>
          </div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha rosa"><Star size={20} /></span>
          <div>
            <b>{reais(ticketMedio)}</b>
            <small>Ticket médio</small>
          </div>
        </div>
      </div>

      {erro && <div className="aviso c-rosa" style={{ marginBottom: 16 }}>{erro}</div>}

      <div className="duas-colunas">
        <div className="tabela-caixa">
          <div className="tabela-caixa__barra">
            <h3 className="t-h3 cresce">Vendas recentes</h3>
            <div className="campo__caixa" style={{ width: 240 }}>
              <Search size={16} />
              <input
                placeholder="Buscar produto ou comprador"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="tabela-rolagem">
            <table className="tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Pedido</th>
                <th>Produto</th>
                <th>Comprador</th>
                <th>Qtd</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>Carregando vendas…</td>
                </tr>
              ) : vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>Nenhuma venda encontrada.</td>
                </tr>
              ) : (
                vendasFiltradas.map((v, idx) => (
                  <tr key={idx}>
                    <td>{v.criado_em ? data(v.criado_em) : 'Hoje'}</td>
                    <td><b>#{v.pedido_id}</b></td>
                    <td>
                      <div className="prod">
                        <img src={v.imagem_url || '/img/blocos.jpg'} alt="" />
                        <b>{v.brinquedo_nome || v.brinquedo}</b>
                      </div>
                    </td>
                    <td>{v.comprador_nome || v.comprador || 'Cliente'}</td>
                    <td>{v.quantidade}</td>
                    <td><b>{reais(v.subtotal || (v.quantidade * v.preco_unitario))}</b></td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>

          <div className="tabela-caixa__rodape">
            <span>Preço registrado no momento da compra (RN13)</span>
          </div>
        </div>

        <div className="caixa">
          <h3 className="t-h3">Mais vendidos</h3>
          {rankingMaisVendidos.length === 0 ? (
            <p className="t-pequeno c-suave" style={{ marginTop: 12 }}>Nenhuma venda ainda.</p>
          ) : (
            <ul className="lista-simples" style={{ marginTop: 10 }}>
              {rankingMaisVendidos.map((prod, idx) => (
                <li key={idx}>
                  <img
                    src={prod.imagem_url}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                    alt=""
                  />
                  <span className="cresce">
                    <b>{prod.nome}</b>
                    <div className="t-pequeno c-suave">{prod.quantidade} unidades</div>
                  </span>
                  <b>{reais(prod.total)}</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
