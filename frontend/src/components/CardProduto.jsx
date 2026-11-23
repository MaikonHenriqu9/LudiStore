import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, ImageOff } from 'lucide-react'
import Selo from './Selo.jsx'
import { reais, idade, seloDoBrinquedo } from '../utils/formatar.js'

/**
 * Card do catálogo. Recebe um brinquedo no formato da API (GET /api/brinquedos/).
 *
 * <CardProduto brinquedo={b} onAdicionar={(b) => ...} />
 * <CardProduto brinquedo={b} semBotao />     (pré-visualização no formulário)
 */
export default function CardProduto({ brinquedo: b, onAdicionar, semBotao = false }) {
  const navegar = useNavigate()
  const selo = seloDoBrinquedo(b)
  const esgotado = b.estoque === 0

  return (
    <article className={'card-produto' + (esgotado ? ' card-produto--esgotado' : '')}
             onClick={() => navegar(`/produto/${b.id}`)}>
      <div className="card-produto__imagem">
        {b.imagem_url
          ? <img src={b.imagem_url} alt={b.nome} loading="lazy" />
          : <div className="vazio-mini" style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--neutro-400)' }}><ImageOff size={36} /></div>}
        {selo && <Selo cor={selo[1]}>{selo[0]}</Selo>}
      </div>
      <div className="card-produto__info">{b.marca} · {idade(b.idade_minima)}</div>
      <h3 className="card-produto__nome">
        <Link to={`/produto/${b.id}`} onClick={(e) => e.stopPropagation()}>{b.nome}</Link>
      </h3>
      <div className="card-produto__precos"><span className="card-produto__preco">{reais(b.preco)}</span></div>

      {!semBotao && (esgotado
        ? <button className="btn btn--contorno btn--p btn--bloco" disabled onClick={(e) => e.stopPropagation()}>Esgotado</button>
        : <button className="btn btn--primario btn--p btn--bloco"
                  onClick={(e) => { e.stopPropagation(); onAdicionar?.(b) }}>
            <ShoppingCart size={16} />Adicionar ao carrinho
          </button>)}
    </article>
  )
}
