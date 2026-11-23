import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

export default function NaoEncontrada() {
  return (
    <div className="container" style={{ padding: '64px var(--margem-pagina)' }}>
      <div className="caixa vazio" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="vazio__icone"><SearchX size={40} /></div>
        <h1 className="t-h2">Página não encontrada</h1>
        <p className="t-corpo c-suave" style={{ margin: '6px 0 18px' }}>O endereço que você abriu não existe na LudiStore.</p>
        <Link to="/" className="btn btn--primario">Voltar para a loja</Link>
      </div>
    </div>
  )
}
