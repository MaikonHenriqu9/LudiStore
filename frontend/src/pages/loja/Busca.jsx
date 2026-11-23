import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Filter } from 'lucide-react'
import CardProduto from '../../components/CardProduto.jsx'
import Filtros from '../../components/Filtros.jsx'
import Campo from '../../components/Campo.jsx'
import Vazio from '../../components/Vazio.jsx'
import { useCarrinho } from '../../context/CarrinhoContext.jsx'
import { buscarTexto, filtrar, ordenar, ORDENS } from '../../utils/catalogo.js'
import { BRINQUEDOS, CATEGORIAS, MARCAS } from '../../dados/exemplo.js'
import * as brinquedosService from '../../services/brinquedos.js'

// /busca?q=blocos — procura no nome, descrição, marca, SKU e categorias.
export default function Busca() {
  const { adicionar } = useCarrinho()
  const [params] = useSearchParams()
  const termo = params.get('q') || ''
  const [filtros, setFiltros] = useState({})
  const [ordem, setOrdem] = useState('nome')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [lista, setLista] = useState(() => BRINQUEDOS.filter((b) => b.ativo))

  useEffect(() => {
    brinquedosService.listar(ordem)
      .then((dados) => {
        if (dados && Array.isArray(dados) && dados.length > 0) {
          setLista(dados.filter((b) => b.ativo))
        }
      })
      .catch(() => {})
  }, [ordem])

  const encontrados = useMemo(() => buscarTexto(lista.filter((b) => b.ativo), termo), [lista, termo])
  const resultado = ordenar(filtrar(encontrados, filtros), ordem)

  // Só mostra nos filtros as categorias e marcas que apareceram na busca
  const categorias = CATEGORIAS.filter((c) => encontrados.some((b) => b.categorias.includes(c)))
  const marcas = MARCAS.filter((m) => encontrados.some((b) => b.marca === m))

  return (
    <div className="container">
      <div className="migalhas"><Link to="/">Início</Link> <ChevronRight /> <b>Busca</b></div>

      <div className="linha entre" style={{ marginBottom: 20, alignItems: 'flex-end' }}>
        <div>
          <h1 className="t-h1">{termo ? `Resultados para “${termo}”` : 'Buscar brinquedos'}</h1>
          <p className="t-corpo c-suave">{resultado.length} {resultado.length === 1 ? 'brinquedo encontrado' : 'brinquedos encontrados'}</p>
        </div>
        <div className="linha">
          <button className="btn btn--contorno btn--p so-mobile" onClick={() => setFiltrosAbertos(!filtrosAbertos)}><Filter size={16} />Filtros</button>
          <span className="t-pequeno c-suave so-desktop">Ordenar por</span>
          <Campo tipo="select" opcoes={ORDENS} value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar por" />
        </div>
      </div>

      {encontrados.length === 0 ? (
        <Vazio titulo={`Nenhum resultado para “${termo}”`}
               texto="Confira a ortografia ou tente termos mais gerais, como “pelúcia” ou “carrinho”." />
      ) : (
        <div className="listagem">
          <Filtros base={encontrados} valor={filtros} onChange={setFiltros} aberto={filtrosAbertos}
                   categorias={categorias} marcas={marcas} campos={['categorias', 'marcas', 'estoque']} />
          <div>
            {resultado.length > 0
              ? <div className="grade-produtos">{resultado.map((b) => <CardProduto key={b.id} brinquedo={b} onAdicionar={adicionar} />)}</div>
              : <Vazio titulo="Nenhum brinquedo com esses filtros" acao="Limpar filtros" onAcao={() => setFiltros({})} />}
          </div>
        </div>
      )}
    </div>
  )
}
