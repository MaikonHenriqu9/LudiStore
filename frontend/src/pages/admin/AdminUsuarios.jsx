import { useState, useEffect, useMemo } from 'react'
import { Search, Pencil, Trash2, RotateCcw, X, Check } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import Campo from '../../components/Campo.jsx'
import * as usuariosService from '../../services/usuarios.js'
import { iniciais, data } from '../../utils/formatar.js'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [aba, setAba] = useState('todos')
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [editForm, setEditForm] = useState({ nome: '', email: '', telefone: '' })
  const [errosEdit, setErrosEdit] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [usuarioDesativando, setUsuarioDesativando] = useState(null)

  async function carregar(termo = busca) {
    setCarregando(true)
    try {
      const dados = await usuariosService.listar(termo)
      setUsuarios(dados || [])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function pesquisar(e) {
    const val = e.target.value
    setBusca(val)
    carregar(val)
  }

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (aba === 'clientes') return u.perfil === 'CLIENTE' && u.ativo
      if (aba === 'vendedores') return u.perfil === 'VENDEDOR' && u.ativo
      if (aba === 'admins') return u.perfil === 'ADMIN' && u.ativo
      if (aba === 'desativados') return !u.ativo
      return true
    })
  }, [usuarios, aba])

  function abrirEdicao(u) {
    setUsuarioEditando(u)
    setEditForm({
      nome: u.nome || '',
      email: u.email || '',
      telefone: u.telefone || '',
    })
    setErrosEdit({})
  }

  async function salvarEdicao() {
    setErrosEdit({})
    if (!editForm.nome.trim()) {
      setErrosEdit({ nome: 'Informe o nome.' })
      return
    }
    if (usuarioEditando.perfil === 'VENDEDOR' && !editForm.telefone.trim()) {
      setErrosEdit({ telefone: 'Telefone é obrigatório para vendedores.' })
      return
    }

    setSalvando(true)
    try {
      const atualizado = await usuariosService.atualizar(usuarioEditando.id, {
        nome: editForm.nome.trim(),
        email: editForm.email.trim(),
        telefone: editForm.telefone.trim(),
      })
      setUsuarios((atuais) => atuais.map((u) => (u.id === usuarioEditando.id ? { ...u, ...atualizado } : u)))
      setUsuarioEditando(null)
    } catch (err) {
      setErrosEdit(err.campos || { geral: err.message || 'Erro ao atualizar usuário.' })
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(id) {
    try {
      await usuariosService.desativar(id)
      setUsuarios((atuais) => atuais.map((u) => (u.id === id ? { ...u, ativo: false } : u)))
      setUsuarioDesativando(null)
    } catch (err) {
      alert(err.message || 'Erro ao desativar usuário.')
    }
  }

  async function reativar(id) {
    try {
      await usuariosService.reativar(id)
      setUsuarios((atuais) => atuais.map((u) => (u.id === id ? { ...u, ativo: true } : u)))
    } catch (err) {
      alert(err.message || 'Erro ao reativar usuário.')
    }
  }

  const clientesQtd = usuarios.filter((u) => u.perfil === 'CLIENTE' && u.ativo).length
  const vendedoresQtd = usuarios.filter((u) => u.perfil === 'VENDEDOR' && u.ativo).length
  const adminsQtd = usuarios.filter((u) => u.perfil === 'ADMIN' && u.ativo).length
  const desativadosQtd = usuarios.filter((u) => !u.ativo).length

  return (
    <div className="painel__corpo">
      <div className="painel__titulo">
        <div>
          <h1 className="t-h1">Usuários</h1>
          <p>Pesquise por nome, e-mail, CPF, CNPJ, telefone ou id.</p>
        </div>
      </div>

      <div className="abas">
        <button type="button" className={aba === 'todos' ? 'on' : ''} onClick={() => setAba('todos')}>
          Todos <small>{usuarios.length}</small>
        </button>
        <button type="button" className={aba === 'clientes' ? 'on' : ''} onClick={() => setAba('clientes')}>
          Clientes <small>{clientesQtd}</small>
        </button>
        <button type="button" className={aba === 'vendedores' ? 'on' : ''} onClick={() => setAba('vendedores')}>
          Vendedores <small>{vendedoresQtd}</small>
        </button>
        <button type="button" className={aba === 'admins' ? 'on' : ''} onClick={() => setAba('admins')}>
          Administradores <small>{adminsQtd}</small>
        </button>
        <button type="button" className={aba === 'desativados' ? 'on' : ''} onClick={() => setAba('desativados')}>
          Desativados <small>{desativadosQtd}</small>
        </button>
      </div>

      <div className="tabela-caixa">
        <div className="tabela-caixa__barra">
          <div className="campo__caixa" style={{ width: 340 }}>
            <Search size={16} />
            <input
              placeholder="Buscar por nome, e-mail, CPF, CNPJ ou telefone"
              value={busca}
              onChange={pesquisar}
            />
          </div>
          {busca && <span className="t-pequeno c-suave">{usuariosFiltrados.length} resultado(s) para “{busca}”</span>}
        </div>

        <div className="tabela-rolagem">
          <table className="tabela">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Documento</th>
              <th>Perfil</th>
              <th>Tipo</th>
              <th>Cadastro</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Carregando usuários…</td></tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>Nenhum usuário encontrado.</td></tr>
            ) : (
              usuariosFiltrados.map((u) => {
                const documento = u.tipo_pessoa === 'PJ' ? (u.cnpj || '—') : (u.cpf || (u.perfil === 'ADMIN' ? 'dispensado' : '—'))
                const corPerfil = u.perfil === 'ADMIN' ? 'amarelo' : u.perfil === 'VENDEDOR' ? 'rosa' : 'azul'
                return (
                  <tr key={u.id} className={!u.ativo ? 'inativo' : ''}>
                    <td>
                      <div className="linha">
                        <span className="avatar avatar--p" style={!u.ativo ? { filter: 'grayscale(1)' } : undefined}>
                          {iniciais(u.nome)}
                        </span>
                        <div>
                          <b>{u.nome}</b>
                          <div className="t-pequeno c-suave">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={u.perfil === 'ADMIN' && !u.cpf ? 'c-fraco' : ''}>{documento}</td>
                    <td>
                      <Selo cor={corPerfil}>{u.perfil}</Selo>
                    </td>
                    <td>{u.tipo_pessoa || 'PF'}</td>
                    <td>{u.criado_em ? data(u.criado_em) : '—'}</td>
                    <td>
                      {u.ativo ? (
                        <Selo cor="verde">Ativo</Selo>
                      ) : (
                        <Selo cor="cinza">Desativado</Selo>
                      )}
                    </td>
                    <td>
                      <div className="acoes">
                        {u.ativo ? (
                          <>
                            <button
                              type="button"
                              className="btn btn--icone"
                              onClick={() => abrirEdicao(u)}
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn--icone perigo"
                              onClick={() => setUsuarioDesativando(u)}
                              title="Desativar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--contorno btn--p"
                            onClick={() => reativar(u.id)}
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
      </div>

      {usuarioEditando && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="dialogo" style={{ width: 480, margin: 20 }}>
            <div className="linha entre" style={{ marginBottom: 6 }}>
              <h3 className="t-h3">Editar usuário</h3>
              <button
                type="button"
                className="btn btn--icone"
                onClick={() => setUsuarioEditando(null)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="t-pequeno c-suave" style={{ marginBottom: 14 }}>
              O perfil não pode ser alterado (RN20). As regras do cadastro valem: vendedor precisa de telefone.
            </p>

            {errosEdit.geral && <div className="aviso c-rosa" style={{ marginBottom: 12 }}>{errosEdit.geral}</div>}

            <div className="coluna" style={{ gap: 12 }}>
              <Campo rotulo="Nome" erro={errosEdit.nome}>
                <input
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                />
              </Campo>

              <Campo rotulo="E-mail" erro={errosEdit.email}>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </Campo>

              <Campo
                rotulo="Telefone"
                ajuda={usuarioEditando.perfil === 'VENDEDOR' ? 'Telefone é obrigatório para vendedores.' : undefined}
                erro={errosEdit.telefone}
              >
                <input
                  value={editForm.telefone}
                  onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                  placeholder="DDD + número"
                />
              </Campo>

              <div className="linha" style={{ marginTop: 8 }}>
                <span className="t-pequeno c-suave">Perfil</span>
                <Selo cor={usuarioEditando.perfil === 'ADMIN' ? 'amarelo' : usuarioEditando.perfil === 'VENDEDOR' ? 'rosa' : 'azul'}>
                  {usuarioEditando.perfil}
                </Selo>
              </div>
            </div>

            <div className="dialogo__acoes" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn--contorno btn--p"
                onClick={() => setUsuarioEditando(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primario btn--p"
                disabled={salvando}
                onClick={salvarEdicao}
              >
                {salvando ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {usuarioDesativando && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="dialogo" style={{ margin: 20 }}>
            <div className="dialogo__icone">
              <Trash2 size={32} />
            </div>
            <h3 className="t-h3">Desativar “{usuarioDesativando.nome}”?</h3>
            <p className="t-corpo c-suave" style={{ marginTop: 6 }}>
              O usuário deixará de conseguir fazer login, mas seus pedidos e dados antigos serão mantidos.
            </p>
            <div className="dialogo__acoes">
              <button className="btn btn--contorno btn--p" onClick={() => setUsuarioDesativando(null)}>
                Cancelar
              </button>
              <button className="btn btn--destaque btn--p" onClick={() => desativar(usuarioDesativando.id)}>
                Desativar usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
