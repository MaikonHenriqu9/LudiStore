import { Link } from 'react-router-dom'
import { Hammer, ArrowLeft, LayoutGrid } from 'lucide-react'
import { ROTAS } from '../rotas.js'

// Provisório (etapa 1): marca a página enquanto ela não é migrada do protótipo.
// Some quando a tela for montada nas próximas etapas.
export default function EmConstrucao({ prototipo }) {
  const rota = ROTAS.find((r) => r.prototipo === prototipo)

  return (
    <div className="container" style={{ padding: '48px var(--margem-pagina)' }}>
      <div className="caixa vazio" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="vazio__icone"><Hammer size={40} /></div>
        <span className="selo selo--azul">Tela {rota.num}</span>
        <h1 className="t-h1" style={{ margin: '10px 0 6px' }}>{rota.nome}</h1>
        <p className="t-corpo c-suave">
          Rota <code>{rota.caminho}</code> funcionando. O conteúdo vem do protótipo{' '}
          <code>docs/templates-html/index.html#{rota.prototipo}</code>.
        </p>
        <div className="linha" style={{ justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn--contorno btn--p"><ArrowLeft size={16} />Início</Link>
          <Link to="/telas" className="btn btn--primario btn--p"><LayoutGrid size={16} />Mapa de telas</Link>
        </div>
      </div>
    </div>
  )
}
