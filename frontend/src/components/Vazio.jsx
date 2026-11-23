import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

// Estado vazio: lista sem resultados, carrinho vazio, sem pedidos…
export default function Vazio({ icone: Icone = SearchX, titulo, texto, acao = 'Voltar para a loja', para = '/', onAcao }) {
  return (
    <div className="caixa vazio">
      <div className="vazio__icone"><Icone size={40} /></div>
      <h3 className="t-h2">{titulo}</h3>
      {texto && <p className="t-corpo c-suave" style={{ margin: '6px 0 18px' }}>{texto}</p>}
      {onAcao
        ? <button className="btn btn--primario" onClick={onAcao}>{acao}</button>
        : acao && <Link to={para} className="btn btn--primario">{acao}</Link>}
    </div>
  )
}
