import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, X, Tag, TrendingUp, Search, ChevronDown, Pencil, Eye, Trash2, RotateCcw, Check } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import * as brinquedosService from '../../services/brinquedos.js'
import * as pedidosService from '../../services/pedidos.js'
import { reais, data } from '../../utils/formatar.js'

export default function MeusProdutos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [vendas, setVendas] = useState([])
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [produtoDesativando, setProdutoDesativando] = useState(null)
  const [aviso, setAviso] = useState(null)

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [listaProdutos, listaVendas] = await Promise.all([
        brinquedosService.meus().catch(() => []),
        pedidosService.vendas().catch(() => [])
      ])
      setProdutos(listaProdutos)
      setVendas(listaVendas)
    } catch {
      setErro('Erro ao carregar os produtos.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const faturamento = useMemo(() => {
    return vendas.reduce((tot, v) => tot + Number(v.subtotal || (v.quantidade * v.preco_unitario) || 0), 0)
  }, [vendas])

  const categorias = useMemo(() => {
    const set = new Set()
    produtos.forEach((p) => {
      if (Array.isArray(p.categorias)) {
        p.categorias.forEach((c) => set.add(typeof c === 'object' ? c.nome : c))
      }
    })
    return Array.from(set)
  }, [produtos])

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const termo = busca.toLowerCase()
      const bateBusca = !busca || p.nome?.toLowerCase().includes(termo) || p.sku?.toLowerCase().includes(termo)

      const cats = Array.isArray(p.categorias) ? p.categorias.map((c) => (typeof c === 'object' ? c.nome : c)) : []
      const bateCat = !categoriaFiltro || cats.includes(categoriaFiltro)

      let bateStatus = true
      if (statusFiltro === 'ativos') bateStatus = p.ativo && p.estoque > 0
      else if (statusFiltro === 'desativados') bateStatus = !p.ativo
      else if (statusFiltro === 'sem_estoque') bateStatus = p.ativo && p.estoque === 0

      return bateBusca && bateCat && bateStatus
    })
  }, [produtos, busca, categoriaFiltro, statusFiltro])

  async function confirmarDesativacao() {
    if (!produtoDesativando) return
    const id = produtoDesativando.id
    const nome = produtoDesativando.nome
    try {
      await brinquedosService.desativar(id)
      setProdutos((atuais) => atuais.map((p) => (p.id === id ? { ...p, ativo: false } : p)))
      setAviso({ tipo: 'sucesso', texto: `Produto “${nome}” desativado.`, id })
      setProdutoDesativando(null)
    } catch (e) {
      alert(e.message || 'Erro ao desativar o produto.')
    }
  }

  async function reativar(id) {
    try {
      await brinquedosService.reativar(id)
      setProdutos((atuais) => atuais.map((p) => (p.id === id ? { ...p, ativo: true } : p)))
      setAviso({ tipo: 'sucesso', texto: 'Produto reativado com sucesso!' })
      setTimeout(() => setAviso(null), 4000)
    } catch (e) {
      alert(e.message || 'Erro ao reativar o produto.')
    }
  }

  const ativosQtd = produtos.filter((p) => p.ativo).length
  const desativadosQtd = produtos.filter((p) => !p.ativo).length
  const semEstoqueQtd = produtos.filter((p) => p.ativo && p.estoque === 0).length

  return (
    <div className="painel__corpo">
      <div className="painel__titulo">
        <div>
          <h1 className="t-h1">Meus produtos</h1>
          <p>Seus brinquedos, inclusive os desativados. Desativados não aparecem no catálogo.</p>
        </div>
        <Link to="/vendedor/produtos/novo" className="btn btn--destaque">
          <Plus size={18} /> Novo produto
        </Link>
      </div>

      <div className="indicadores">
        <div className="card-indicador">
          <span className="card-indicador__bolha"><Package size={20} /></span>
          <div><b>{ativosQtd}</b><small>Produtos ativos</small></div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha rosa"><X size={20} /></span>
          <div><b>{desativadosQtd}</b><small>Desativados</small></div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha amarelo"><Tag size={20} /></span>
          <div><b>{semEstoqueQtd}</b><small>Sem estoque</small></div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha verde"><TrendingUp size={20} /></span>
          <div><b>{reais(faturamento)}</b><small>Total em vendas</small></div>
        </div>
      </div>

      {aviso && (
        <div className="aviso" style={{ marginBottom: 16 }}>
          <Check size={18} />
          <span>{aviso.texto}</span>
          {aviso.id && (
            <button
              onClick={() => reativar(aviso.id)}
              className="btn btn--texto btn--p"
              style={{ color: '#7DD3FC', textDecoration: 'underline', padding: 0 }}
            >
              Desfazer
            </button>
          )}
        </div>
      )}

      {erro && <div className="aviso c-rosa" style={{ marginBottom: 16 }}>{erro}</div>}

      <div className="tabela-caixa">
        <div className="tabela-caixa__barra">
          <div className="campo__caixa" style={{ width: 300 }}>
            <Search size={16} />
            <input
              placeholder="Buscar por nome ou SKU"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="campo__caixa" style={{ width: 210 }}>
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="campo__caixa" style={{ width: 180 }}>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
              <option value="todos">Todos os status</option>
              <option value="ativos">Ativos</option>
              <option value="desativados">Desativados</option>
              <option value="sem_estoque">Sem estoque</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="tabela-rolagem">
          <table className="tabela">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th>Cadastrado em</th>
              <th style={{ width: 130 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>Carregando produtos…</td>
              </tr>
            ) : produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>Nenhum produto encontrado.</td>
              </tr>
            ) : (
              produtosFiltrados.map((p) => {
                const cats = Array.isArray(p.categorias)
                  ? p.categorias.map((c) => (typeof c === 'object' ? c.nome : c)).join(', ')
                  : ''
                return (
                  <tr key={p.id} className={!p.ativo ? 'inativo' : ''}>
                    <td>
                      <div className="prod">
                        <img src={p.imagem_url || '/img/blocos.jpg'} alt="" />
                        <div>
                          <b>{p.nome}</b>
                          <small>{p.sku}</small>
                        </div>
                      </div>
                    </td>
                    <td>{cats || '—'}</td>
                    <td><b>{reais(p.preco)}</b></td>
                    <td className={p.estoque === 0 ? 'c-rosa' : ''}>
                      <b>{p.estoque}</b>
                    </td>
                    <td>
                      {!p.ativo ? (
                        <Selo cor="cinza">Desativado</Selo>
                      ) : p.estoque === 0 ? (
                        <Selo cor="amarelo">Sem estoque</Selo>
                      ) : (
                        <Selo cor="verde">Ativo</Selo>
                      )}
                    </td>
                    <td className="c-suave">{p.criado_em ? data(p.criado_em) : '—'}</td>
                    <td>
                      <div className="acoes">
                        {p.ativo ? (
                          <>
                            <Link to={`/vendedor/produtos/${p.id}/editar`} className="btn btn--icone" title="Editar">
                              <Pencil size={16} />
                            </Link>
                            <Link to={`/produto/${p.id}`} className="btn btn--icone" title="Ver no catálogo">
                              <Eye size={16} />
                            </Link>
                            <button
                              type="button"
                              className="btn btn--icone perigo"
                              onClick={() => setProdutoDesativando(p)}
                              title="Desativar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--contorno btn--p"
                            onClick={() => reativar(p.id)}
                          >
                            <RotateCcw size={16} /> Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>

        <div className="tabela-caixa__rodape">
          <span>{produtosFiltrados.length} brinquedos · DELETE desativa (exclusão lógica) e PATCH …/reativar/ volta a ativar</span>
        </div>
      </div>

      {produtoDesativando && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="dialogo" style={{ margin: 20 }}>
            <div className="dialogo__icone">
              <Trash2 size={32} />
            </div>
            <h3 className="t-h3">Desativar “{produtoDesativando.nome}”?</h3>
            <p className="t-corpo c-suave" style={{ marginTop: 6 }}>
              O brinquedo sai do catálogo, mas continua salvo nos pedidos antigos. Você pode reativá-lo depois.
            </p>
            <div className="dialogo__acoes">
              <button className="btn btn--contorno btn--p" onClick={() => setProdutoDesativando(null)}>
                Cancelar
              </button>
              <button className="btn btn--destaque btn--p" onClick={confirmarDesativacao}>
                Desativar produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
