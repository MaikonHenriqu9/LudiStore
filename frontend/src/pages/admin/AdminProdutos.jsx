import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import * as brinquedosService from '../../services/brinquedos.js'
import * as marcasService from '../../services/marcas.js'
import * as categoriasService from '../../services/categorias.js'
import { reais, iniciais } from '../../utils/formatar.js'

export default function AdminProdutos() {
  const [brinquedos, setBrinquedos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState('ativos')
  const [busca, setBusca] = useState('')
  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [marcaFiltro, setMarcaFiltro] = useState('')
  const [produtoDesativando, setProdutoDesativando] = useState(null)

  async function carregar() {
    setCarregando(true)
    try {
      const [listaBrinquedos, listaMarcas, listaCategorias] = await Promise.all([
        brinquedosService.listar().catch(() => []),
        marcasService.listar().catch(() => []),
        categoriasService.listar().catch(() => [])
      ])
      setBrinquedos(listaBrinquedos)
      setMarcas(listaMarcas)
      setCategorias(listaCategorias)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const vendedores = useMemo(() => {
    const set = new Set()
    brinquedos.forEach((b) => {
      if (b.vendedor) set.add(b.vendedor)
    })
    return Array.from(set)
  }, [brinquedos])

  const produtosAba = useMemo(() => {
    if (aba === 'sem_estoque') {
      return brinquedos.filter((b) => b.estoque === 0)
    }
    return brinquedos.filter((b) => b.ativo)
  }, [brinquedos, aba])

  const produtosFiltrados = useMemo(() => {
    return produtosAba.filter((b) => {
      const termo = busca.toLowerCase()
      const bateBusca = !busca || b.nome?.toLowerCase().includes(termo) || b.sku?.toLowerCase().includes(termo)
      const bateVendedor = !vendedorFiltro || b.vendedor === vendedorFiltro
      const bateMarca = !marcaFiltro || b.marca === marcaFiltro

      const cats = Array.isArray(b.categorias)
        ? b.categorias.map((c) => (typeof c === 'object' ? c.nome : c))
        : []
      const bateCat = !categoriaFiltro || cats.includes(categoriaFiltro)

      return bateBusca && bateVendedor && bateMarca && bateCat
    })
  }, [produtosAba, busca, vendedorFiltro, marcaFiltro, categoriaFiltro])

  async function confirmarDesativacao() {
    if (!produtoDesativando) return
    try {
      await brinquedosService.desativar(produtoDesativando.id)
      setBrinquedos((atuais) => atuais.filter((b) => b.id !== produtoDesativando.id))
      setProdutoDesativando(null)
    } catch (e) {
      alert(e.message || 'Erro ao desativar o produto.')
    }
  }

  const ativosQtd = brinquedos.filter((b) => b.ativo).length
  const semEstoqueQtd = brinquedos.filter((b) => b.ativo && b.estoque === 0).length

  return (
    <div className="painel__corpo">
      <div className="painel__titulo">
        <div>
          <h1 className="t-h1">Produtos</h1>
          <p>Brinquedos ativos de todos os vendedores. O admin pode editar e desativar qualquer um.</p>
        </div>
        <Link to="/vendedor/produtos/novo" className="btn btn--destaque">
          <Plus size={18} /> Cadastrar em nome de um vendedor
        </Link>
      </div>

      <div className="abas">
        <button
          type="button"
          className={aba === 'ativos' ? 'on' : ''}
          onClick={() => setAba('ativos')}
        >
          Ativos <small>{ativosQtd}</small>
        </button>
        <button
          type="button"
          className={aba === 'sem_estoque' ? 'on' : ''}
          onClick={() => setAba('sem_estoque')}
        >
          Sem estoque <small>{semEstoqueQtd}</small>
        </button>
      </div>

      <div className="tabela-caixa">
        <div className="tabela-caixa__barra">
          <div className="campo__caixa" style={{ width: 280 }}>
            <Search size={16} />
            <input
              placeholder="Buscar por nome ou SKU"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="campo__caixa" style={{ width: 220 }}>
            <select value={vendedorFiltro} onChange={(e) => setVendedorFiltro(e.target.value)}>
              <option value="">Todos os vendedores</option>
              {vendedores.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="campo__caixa" style={{ width: 210 }}>
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="campo__caixa" style={{ width: 190 }}>
            <select value={marcaFiltro} onChange={(e) => setMarcaFiltro(e.target.value)}>
              <option value="">Todas as marcas</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.nome}>{m.nome}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="tabela-rolagem">
          <table className="tabela">
          <thead>
            <tr>
              <th>Brinquedo</th>
              <th>Vendedor (criado por)</th>
              <th>Marca</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Carregando produtos…</td></tr>
            ) : produtosFiltrados.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Nenhum brinquedo encontrado.</td></tr>
            ) : (
              produtosFiltrados.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="prod">
                      <img src={b.imagem_url || '/img/blocos.jpg'} alt="" />
                      <div>
                        <b>{b.nome}</b>
                        <small>{b.sku}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="linha">
                      <span className="avatar avatar--p">{iniciais(b.vendedor || 'Vendedor')}</span>
                      {b.vendedor || 'Vendedor'}
                    </div>
                  </td>
                  <td>{b.marca || '—'}</td>
                  <td><b>{reais(b.preco)}</b></td>
                  <td className={b.estoque === 0 ? 'c-rosa' : ''}>
                    <b>{b.estoque}</b>
                  </td>
                  <td>
                    {b.estoque === 0 ? (
                      <Selo cor="amarelo">Sem estoque</Selo>
                    ) : (
                      <Selo cor="verde">Ativo</Selo>
                    )}
                  </td>
                  <td>
                    <div className="acoes">
                      <Link to={`/admin/produtos/${b.id}/editar`} className="btn btn--icone" title="Editar">
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        className="btn btn--icone perigo"
                        onClick={() => setProdutoDesativando(b)}
                        title="Desativar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        <div className="tabela-caixa__rodape">
          <span>A API lista só os ativos. Um brinquedo desativado pode ser reativado pelo endpoint …/reativar/.</span>
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
              O brinquedo sairá da vitrine pública mas o histórico continuará nos pedidos anteriores.
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
