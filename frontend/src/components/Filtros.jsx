import { Filter } from 'lucide-react'
import { contar } from '../utils/catalogo.js'

const IDADES = [[null, 'Qualquer idade'], [3, 'Até 3 anos'], [6, 'Até 6 anos'], [9, 'Até 9 anos']]

function Check({ marcado, onClick, children, qtd, radio }) {
  return (
    <label className={'check' + (radio ? ' radio' : '')} onClick={(e) => { e.preventDefault(); onClick() }}>
      <i className={marcado ? 'on' : ''} />{children}{qtd != null && <small>{qtd}</small>}
    </label>
  )
}

/**
 * Painel de filtros do catálogo e da busca.
 * <Filtros base={brinquedos} valor={filtros} onChange={setFiltros} aberto={aberto} campos={['categorias','marcas',...]} />
 * "base" é a lista usada para contar quantos itens há em cada opção.
 */
export default function Filtros({ base, valor, onChange, aberto, categorias, marcas,
  campos = ['categorias', 'idade', 'marcas', 'preco', 'estoque'] }) {
  const porCategoria = contar(base, 'categorias')
  const porMarca = contar(base, 'marca')

  const alternar = (chave, item) => {
    const lista = valor[chave] || []
    onChange({ ...valor, [chave]: lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item] })
  }

  return (
    <aside className={'filtros' + (aberto ? ' aberto' : '')}>
      <div className="linha entre" style={{ marginBottom: 8 }}>
        <h3 className="t-h3 linha" style={{ gap: 8 }}><Filter size={20} />Filtros</h3>
        <button className="btn btn--texto btn--p" onClick={() => onChange({})}>Limpar</button>
      </div>

      {campos.includes('categorias') && (
        <div className="filtro"><h4>Categoria</h4>
          {categorias.map((c) => (
            <Check key={c} marcado={valor.categorias?.includes(c)} onClick={() => alternar('categorias', c)} qtd={porCategoria[c] || 0}>{c}</Check>
          ))}
        </div>
      )}

      {campos.includes('idade') && (
        <div className="filtro"><h4>Idade mínima</h4>
          {IDADES.map(([v, texto]) => (
            <Check key={texto} radio marcado={(valor.idadeAte ?? null) === v} onClick={() => onChange({ ...valor, idadeAte: v })}>{texto}</Check>
          ))}
        </div>
      )}

      {campos.includes('marcas') && (
        <div className="filtro"><h4>Marca</h4>
          {marcas.map((m) => (
            <Check key={m} marcado={valor.marcas?.includes(m)} onClick={() => alternar('marcas', m)} qtd={porMarca[m] || 0}>{m}</Check>
          ))}
        </div>
      )}

      {campos.includes('preco') && (
        <div className="filtro"><h4>Preço (R$)</h4>
          <div className="linha">
            <div className="campo__caixa" style={{ height: 40 }}>
              <input type="number" min="0" placeholder="Mín." value={valor.precoMin ?? ''} aria-label="Preço mínimo"
                     onChange={(e) => onChange({ ...valor, precoMin: e.target.value })} />
            </div>
            <span className="c-fraco">–</span>
            <div className="campo__caixa" style={{ height: 40 }}>
              <input type="number" min="0" placeholder="Máx." value={valor.precoMax ?? ''} aria-label="Preço máximo"
                     onChange={(e) => onChange({ ...valor, precoMax: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {campos.includes('estoque') && (
        <div className="filtro"><h4>Disponibilidade</h4>
          <Check marcado={!!valor.soComEstoque} onClick={() => onChange({ ...valor, soComEstoque: !valor.soComEstoque })}>Só com estoque</Check>
        </div>
      )}
    </aside>
  )
}
