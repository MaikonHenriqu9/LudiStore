import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Store, Package, Receipt, ChevronRight, Tag } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import * as usuariosService from '../../services/usuarios.js'
import * as brinquedosService from '../../services/brinquedos.js'
import * as pedidosService from '../../services/pedidos.js'
import { iniciais, data, reais } from '../../utils/formatar.js'

export default function AdminGeral() {
  const [usuarios, setUsuarios] = useState([])
  const [brinquedos, setBrinquedos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const [u, b, p] = await Promise.all([
          usuariosService.listar().catch(() => []),
          brinquedosService.listar('recentes').catch(() => []),
          pedidosService.listar().catch(() => [])
        ])
        setUsuarios(u)
        setBrinquedos(b)
        setPedidos(p)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const clientesQtd = usuarios.filter((u) => u.perfil === 'CLIENTE').length
  const vendedoresQtd = usuarios.filter((u) => u.perfil === 'VENDEDOR').length
  const brinquedosAtivosQtd = brinquedos.filter((b) => b.ativo).length
  const pedidosQtd = pedidos.length

  const ultimosUsuarios = useMemo(() => {
    return [...usuarios].slice(-5).reverse()
  }, [usuarios])

  const ultimosBrinquedos = useMemo(() => {
    return [...brinquedos]
      .sort((a, b) => {
        if (a.criado_em && b.criado_em) {
          return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
        }
        return (b.id || 0) - (a.id || 0)
      })
      .slice(0, 5)
  }, [brinquedos])

  return (
    <div className="painel__corpo">
      <div className="painel__titulo">
        <div>
          <h1 className="t-h1">Olá, Admin 👋</h1>
          <p>Resumo geral e status da plataforma LudiStore.</p>
        </div>
        <div className="linha">
          <Link to="/admin/catalogo" className="btn btn--contorno">
            <Tag size={16} /> Marcas e categorias
          </Link>
          <Link to="/admin/pedidos" className="btn btn--primario">
            <Receipt size={16} /> Ver pedidos
          </Link>
        </div>
      </div>

      <div className="indicadores">
        <div className="card-indicador">
          <span className="card-indicador__bolha"><Users size={20} /></span>
          <div>
            <b>{carregando ? '—' : clientesQtd}</b>
            <small>Clientes</small>
          </div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha rosa"><Store size={20} /></span>
          <div>
            <b>{carregando ? '—' : vendedoresQtd}</b>
            <small>Vendedores</small>
          </div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha amarelo"><Package size={20} /></span>
          <div>
            <b>{carregando ? '—' : brinquedosAtivosQtd}</b>
            <small>Brinquedos ativos</small>
          </div>
        </div>
        <div className="card-indicador">
          <span className="card-indicador__bolha verde"><Receipt size={20} /></span>
          <div>
            <b>{carregando ? '—' : pedidosQtd}</b>
            <small>Total de pedidos</small>
          </div>
        </div>
      </div>

      <div className="duas-colunas">
        <div className="caixa">
          <div className="linha entre">
            <h3 className="t-h3">Pedidos por período</h3>
            <span className="t-pequeno c-suave">Últimos meses</span>
          </div>
          <div className="grafico" style={{ marginTop: 20 }}>
            <div><span style={{ height: '35%' }}></span>Jul</div>
            <div><span style={{ height: '48%' }}></span>Ago</div>
            <div><span style={{ height: '60%' }}></span>Set</div>
            <div><span style={{ height: '52%' }}></span>Out</div>
            <div><span style={{ height: '75%' }}></span>Nov</div>
            <div className="on"><span style={{ height: '90%' }}></span><b style={{ color: 'var(--marinho-900)' }}>Atual</b></div>
          </div>
        </div>

        <div className="caixa">
          <div className="linha entre">
            <h3 className="t-h3">Novos usuários</h3>
            <Link to="/admin/usuarios" className="ver-tudo">Ver todos</Link>
          </div>
          <ul className="lista-simples" style={{ marginTop: 12 }}>
            {ultimosUsuarios.length === 0 ? (
              <li className="t-pequeno c-suave">Nenhum usuário cadastrado.</li>
            ) : (
              ultimosUsuarios.map((u) => {
                const corSelo = u.perfil === 'ADMIN' ? 'amarelo' : u.perfil === 'VENDEDOR' ? 'rosa' : 'azul'
                return (
                  <li key={u.id}>
                    <span className="avatar avatar--p">{iniciais(u.nome)}</span>
                    <span className="cresce">
                      <b>{u.nome}</b>
                      <div className="t-pequeno c-suave">{u.email}</div>
                    </span>
                    <Selo cor={corSelo}>{u.perfil}</Selo>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>

      <div className="tabela-caixa" style={{ marginTop: 24 }}>
        <div className="tabela-caixa__barra">
          <h3 className="t-h3 cresce">Últimos brinquedos cadastrados</h3>
          <Link to="/admin/produtos" className="ver-tudo">
            Gerenciar produtos <ChevronRight size={16} />
          </Link>
        </div>
        <div className="tabela-rolagem">
          <table className="tabela">
          <thead>
            <tr>
              <th>Brinquedo</th>
              <th>Criado por</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ultimosBrinquedos.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Nenhum brinquedo encontrado.</td></tr>
            ) : (
              ultimosBrinquedos.map((b) => {
                const cat = Array.isArray(b.categorias)
                  ? (typeof b.categorias[0] === 'object' ? b.categorias[0].nome : b.categorias[0])
                  : 'Geral'
                return (
                  <tr key={b.id}>
                    <td>
                      <div className="prod">
                        <img src={b.imagem_url || '/img/blocos.jpg'} alt="" />
                        <b>{b.nome}</b>
                      </div>
                    </td>
                    <td>
                      <div className="linha">
                        <span className="avatar avatar--p">{iniciais(b.vendedor || 'Vendedor')}</span>
                        {b.vendedor || 'Vendedor'}
                      </div>
                    </td>
                    <td>{cat}</td>
                    <td><b>{reais(b.preco)}</b></td>
                    <td>
                      {b.ativo ? (
                        <Selo cor="verde">Ativo</Selo>
                      ) : (
                        <Selo cor="cinza">Desativado</Selo>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
