import { Link } from 'react-router-dom'
import { ROTAS } from '../rotas.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCarrinho } from '../context/CarrinhoContext.jsx'
import CardProduto from '../components/CardProduto.jsx'
import Selo from '../components/Selo.jsx'
import { BRINQUEDOS, USUARIO_CLIENTE, USUARIO_VENDEDOR, USUARIO_ADMIN } from '../dados/exemplo.js'

// Página de apoio ao desenvolvimento (some antes da entrega):
// lista as 18 telas, simula o login de cada perfil e mostra os componentes.
export default function MapaTelas() {
  const { usuario, entrar, sair } = useAuth()
  const { adicionar, limpar, quantidadeTotal } = useCarrinho()

  // Simula a resposta de POST /api/auth/login/ (sem chamar a API)
  const simular = (u) => entrar({ token: 'token-de-teste', tipo: 'Bearer', expira_em_segundos: 8 * 3600, usuario: u })

  return (
    <div className="container" style={{ padding: '32px var(--margem-pagina) 64px' }}>
      <h1 className="t-h1">Mapa de telas</h1>
      <p className="t-corpo c-suave" style={{ margin: '4px 0 20px' }}>
        Página só para desenvolvimento: as 18 telas, um simulador de login e os componentes prontos.
      </p>

      <div className="caixa" style={{ marginBottom: 20 }}>
        <div className="linha entre" style={{ flexWrap: 'wrap' }}>
          <div>
            <b>Simular login</b>{' '}
            {usuario ? <Selo cor="verde">{usuario.nome} · {usuario.perfil}</Selo> : <Selo cor="cinza">Visitante</Selo>}
          </div>
          <div className="linha" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn--contorno btn--p" onClick={() => simular(USUARIO_CLIENTE)}>Cliente</button>
            <button className="btn btn--contorno btn--p" onClick={() => simular(USUARIO_VENDEDOR)}>Vendedor</button>
            <button className="btn btn--contorno btn--p" onClick={() => simular(USUARIO_ADMIN)}>Admin</button>
            <button className="btn btn--perigo btn--p" onClick={sair}>Sair</button>
          </div>
        </div>
      </div>

      <div className="tabela-caixa" style={{ marginBottom: 32 }}>
        <table className="tabela">
          <tbody>
            <tr><th>Nº</th><th>Tela</th><th>Rota</th><th>Layout</th></tr>
            {ROTAS.map((r) => (
              <tr key={r.num}>
                <td><b>{r.num}</b></td>
                <td><Link to={r.exemplo || r.caminho} className="c-azul" style={{ fontWeight: 700 }}>{r.nome}</Link></td>
                <td><code>{r.caminho}</code></td>
                <td><Selo cor="cinza">{r.layout}</Selo></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="secao-titulo">
        <h2 className="t-h2">Componente &lt;CardProduto /&gt;</h2>
        <div className="linha">
          <span className="t-pequeno c-suave">{quantidadeTotal} no carrinho</span>
          <button className="btn btn--texto btn--p" onClick={limpar}>Esvaziar carrinho</button>
        </div>
      </div>
      <div className="prateleira">
        {BRINQUEDOS.slice(0, 5).map((b) => <CardProduto key={b.id} brinquedo={b} onAdicionar={adicionar} />)}
      </div>
    </div>
  )
}
