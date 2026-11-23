import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, Check, X } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import * as marcasService from '../../services/marcas.js'
import * as categoriasService from '../../services/categorias.js'

export default function AdminCatalogo() {
  const [marcas, setMarcas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [novaMarca, setNovaMarca] = useState('')
  const [marcaErro, setMarcaErro] = useState('')
  const [marcaEditandoId, setMarcaEditandoId] = useState(null)
  const [marcaEditandoNome, setMarcaEditandoNome] = useState('')

  const [novaCategoria, setNovaCategoria] = useState('')
  const [categoriaErro, setCategoriaErro] = useState('')
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null)
  const [categoriaEditandoNome, setCategoriaEditandoNome] = useState('')

  const [aviso, setAviso] = useState(null)

  async function carregar() {
    setCarregando(true)
    try {
      const [m, c] = await Promise.all([
        marcasService.listar().catch(() => []),
        categoriasService.listar().catch(() => [])
      ])
      setMarcas(m)
      setCategorias(c)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function mostrarAviso(texto) {
    setAviso(texto)
    setTimeout(() => setAviso(null), 4000)
  }

  // Marcas
  async function criarMarca(e) {
    e.preventDefault()
    setMarcaErro('')
    if (!novaMarca.trim()) {
      setMarcaErro('Informe o nome da marca.')
      return
    }
    try {
      const criada = await marcasService.criar({ nome: novaMarca.trim() })
      setMarcas((atuais) => [...atuais, criada])
      setNovaMarca('')
      mostrarAviso(`Marca “${criada.nome}” adicionada com sucesso.`)
    } catch (err) {
      setMarcaErro(err.message || 'Já existe uma marca com esse nome.')
    }
  }

  async function salvarEdicaoMarca(id) {
    if (!marcaEditandoNome.trim()) return
    try {
      const atualizada = await marcasService.atualizar(id, { nome: marcaEditandoNome.trim() })
      setMarcas((atuais) => atuais.map((m) => (m.id === id ? { ...m, ...atualizada } : m)))
      setMarcaEditandoId(null)
      mostrarAviso(`Marca “${marcaEditandoNome}” atualizada.`)
    } catch (err) {
      alert(err.message || 'Erro ao atualizar marca.')
    }
  }

  async function desativarMarca(id) {
    try {
      await marcasService.desativar(id)
      setMarcas((atuais) => atuais.map((m) => (m.id === id ? { ...m, ativo: false } : m)))
      mostrarAviso('Marca desativada.')
    } catch (err) {
      alert(err.message || 'Erro ao desativar marca.')
    }
  }

  async function reativarMarca(id) {
    try {
      await marcasService.reativar(id)
      setMarcas((atuais) => atuais.map((m) => (m.id === id ? { ...m, ativo: true } : m)))
      mostrarAviso('Marca reativada.')
    } catch (err) {
      alert(err.message || 'Erro ao reativar marca.')
    }
  }

  // Categorias
  async function criarCategoria(e) {
    e.preventDefault()
    setCategoriaErro('')
    if (!novaCategoria.trim()) {
      setCategoriaErro('Informe o nome da categoria.')
      return
    }
    try {
      const criada = await categoriasService.criar({ nome: novaCategoria.trim() })
      setCategorias((atuais) => [...atuais, criada])
      setNovaCategoria('')
      mostrarAviso(`Categoria “${criada.nome}” adicionada com sucesso.`)
    } catch (err) {
      setCategoriaErro(err.message || 'Já existe uma categoria com esse nome.')
    }
  }

  async function salvarEdicaoCategoria(id) {
    if (!categoriaEditandoNome.trim()) return
    try {
      const atualizada = await categoriasService.atualizar(id, { nome: categoriaEditandoNome.trim() })
      setCategorias((atuais) => atuais.map((c) => (c.id === id ? { ...c, ...atualizada } : c)))
      setCategoriaEditandoId(null)
      mostrarAviso(`Categoria “${categoriaEditandoNome}” atualizada.`)
    } catch (err) {
      alert(err.message || 'Erro ao atualizar categoria.')
    }
  }

  async function desativarCategoria(id) {
    try {
      await categoriasService.desativar(id)
      setCategorias((atuais) => atuais.map((c) => (c.id === id ? { ...c, ativo: false } : c)))
      mostrarAviso('Categoria desativada.')
    } catch (err) {
      alert(err.message || 'Erro ao desativar categoria.')
    }
  }

  async function reativarCategoria(id) {
    try {
      await categoriasService.reativar(id)
      setCategorias((atuais) => atuais.map((c) => (c.id === id ? { ...c, ativo: true } : c)))
      mostrarAviso('Categoria reativada.')
    } catch (err) {
      alert(err.message || 'Erro ao reativar categoria.')
    }
  }

  return (
    <div className="painel__corpo">
      <div className="painel__titulo">
        <div>
          <h1 className="t-h1">Marcas e categorias</h1>
          <p>O nome é único e não diferencia maiúsculas de minúsculas (“Estrela” = “estrela”).</p>
        </div>
      </div>

      {aviso && (
        <div className="aviso" style={{ marginBottom: 16 }}>
          <Check size={18} />
          <span>{aviso}</span>
        </div>
      )}

      <div className="cadastro-simples">
        {/* Bloco de Marcas */}
        <div className="tabela-caixa">
          <div className="tabela-caixa__barra">
            <h3 className="t-h3 cresce">
              Marcas <Selo cor="cinza">{marcas.length}</Selo>
            </h3>
          </div>

          <form onSubmit={criarMarca} style={{ padding: '0 16px 16px' }}>
            <div className="linha" style={{ gap: 8 }}>
              <div className={`campo__caixa cresce ${marcaErro ? 'campo--erro' : ''}`}>
                <input
                  placeholder="Nome da nova marca"
                  value={novaMarca}
                  onChange={(e) => setNovaMarca(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn--primario">
                <Plus size={16} /> Adicionar
              </button>
            </div>
            {marcaErro && <span className="campo__ajuda c-rosa">{marcaErro}</span>}
          </form>

          <div className="tabela-rolagem">
            <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>Carregando marcas…</td></tr>
              ) : marcas.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>Nenhuma marca cadastrada.</td></tr>
              ) : (
                marcas.map((m) => (
                  <tr key={m.id} className={m.ativo === false ? 'inativo' : ''}>
                    <td>
                      {marcaEditandoId === m.id ? (
                        <div className="linha" style={{ gap: 6 }}>
                          <div className="campo__caixa" style={{ height: 38 }}>
                            <input
                              value={marcaEditandoNome}
                              onChange={(e) => setMarcaEditandoNome(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn--primario btn--p"
                            onClick={() => salvarEdicaoMarca(m.id)}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            className="btn btn--contorno btn--p"
                            onClick={() => setMarcaEditandoId(null)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <b>{m.nome}</b>
                      )}
                    </td>
                    <td>
                      {m.ativo !== false ? (
                        <Selo cor="verde">Ativa</Selo>
                      ) : (
                        <Selo cor="cinza">Desativada</Selo>
                      )}
                    </td>
                    <td>
                      <div className="acoes">
                        {m.ativo !== false ? (
                          <>
                            <button
                              type="button"
                              className="btn btn--icone"
                              onClick={() => {
                                setMarcaEditandoId(m.id)
                                setMarcaEditandoNome(m.nome)
                              }}
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn--icone perigo"
                              onClick={() => desativarMarca(m.id)}
                              title="Desativar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--contorno btn--p"
                            onClick={() => reativarMarca(m.id)}
                          >
                            <RotateCcw size={16} /> Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>

        {/* Bloco de Categorias */}
        <div className="tabela-caixa">
          <div className="tabela-caixa__barra">
            <h3 className="t-h3 cresce">
              Categorias <Selo cor="cinza">{categorias.length}</Selo>
            </h3>
          </div>

          <form onSubmit={criarCategoria} style={{ padding: '0 16px 16px' }}>
            <div className="linha" style={{ gap: 8 }}>
              <div className={`campo__caixa cresce ${categoriaErro ? 'campo--erro' : ''}`}>
                <input
                  placeholder="Nome da nova categoria"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn--primario">
                <Plus size={16} /> Adicionar
              </button>
            </div>
            {categoriaErro && <span className="campo__ajuda c-rosa">{categoriaErro}</span>}
          </form>

          <div className="tabela-rolagem">
            <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>Carregando categorias…</td></tr>
              ) : categorias.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>Nenhuma categoria cadastrada.</td></tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id} className={c.ativo === false ? 'inativo' : ''}>
                    <td>
                      {categoriaEditandoId === c.id ? (
                        <div className="linha" style={{ gap: 6 }}>
                          <div className="campo__caixa" style={{ height: 38 }}>
                            <input
                              value={categoriaEditandoNome}
                              onChange={(e) => setCategoriaEditandoNome(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn--primario btn--p"
                            onClick={() => salvarEdicaoCategoria(c.id)}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            className="btn btn--contorno btn--p"
                            onClick={() => setCategoriaEditandoId(null)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <b>{c.nome}</b>
                      )}
                    </td>
                    <td>
                      {c.ativo !== false ? (
                        <Selo cor="verde">Ativa</Selo>
                      ) : (
                        <Selo cor="cinza">Desativada</Selo>
                      )}
                    </td>
                    <td>
                      <div className="acoes">
                        {c.ativo !== false ? (
                          <>
                            <button
                              type="button"
                              className="btn btn--icone"
                              onClick={() => {
                                setCategoriaEditandoId(c.id)
                                setCategoriaEditandoNome(c.nome)
                              }}
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn--icone perigo"
                              onClick={() => desativarCategoria(c.id)}
                              title="Desativar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--contorno btn--p"
                            onClick={() => reativarCategoria(c.id)}
                          >
                            <RotateCcw size={16} /> Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
