import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Filter, X } from 'lucide-react'
import CardProduto from '../../components/CardProduto.jsx'
import Filtros from '../../components/Filtros.jsx'
import Campo from '../../components/Campo.jsx'
import Vazio from '../../components/Vazio.jsx'
import { useCarrinho } from '../../context/CarrinhoContext.jsx'
import { filtrar, ordenar, ORDENS } from '../../utils/catalogo.js'
import { BRINQUEDOS, CATEGORIAS, MARCAS } from '../../dados/exemplo.js'
import * as brinquedosService from '../../services/brinquedos.js'

// Lê os filtros que vêm no endereço: /catalogo?categoria=Pelúcias&marca=...&idade=3&ordem=recentes
function filtrosDaUrl(params) {
  const f = {}
  if (params.get('categoria')) f.categorias = [params.get('categoria')]
  if (params.get('marca')) f.marcas = [params.get('marca')]
  if (params.get('idade') != null) f.idadeAte = Number(params.get('idade'))
  return f
}

export default function Catalogo() {
  const { adicionar } = useCarrinho()
  const [params, setParams] = useSearchParams()
  const [filtros, setFiltros] = useState(() => filtrosDaUrl(params))
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const ordem = params.get('ordem') || 'nome'

  // Clicou em outra categoria no menu: atualiza os filtros
  useEffect(() => { setFiltros(filtrosDaUrl(params)) }, [params])

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

  const base = useMemo(() => lista.filter((b) => b.ativo), [lista])
  const resultado = useMemo(() => ordenar(filtrar(base, filtros), ordem), [base, filtros, ordem])

  const categoriaAtual = filtros.categorias?.length === 1 ? filtros.categorias[0] : null

  // Etiquetas dos filtros ativos, com botão para remover cada uma
  const ativos = [
    ...(filtros.categorias || []).map((c) => [c, () => setFiltros({ ...filtros, categorias: filtros.categorias.filter((x) => x !== c) })]),
    ...(filtros.marcas || []).map((m) => [m, () => setFiltros({ ...filtros, marcas: filtros.marcas.filter((x) => x !== m) })]),
    ...(filtros.idadeAte != null ? [[`Até ${filtros.idadeAte} anos`, () => setFiltros({ ...filtros, idadeAte: null })]] : []),
    ...(filtros.soComEstoque ? [['Só com estoque', () => setFiltros({ ...filtros, soComEstoque: false })]] : []),
  ]

  return (
    <div className="container">
      <div className="migalhas">
        <Link to="/">Início</Link> <ChevronRight /> {categoriaAtual ? <><Link to="/catalogo">Catálogo</Link> <ChevronRight /> <b>{categoriaAtual}</b></> : <b>Catálogo</b>}
      </div>

      <div className="cat-topo">
        <div>
          <h1 className="t-h1">{categoriaAtual || 'Todos os brinquedos'}</h1>
          <p className="t-corpo c-suave" style={{ marginTop: 4 }}>Brinquedos ativos de todas as marcas e vendedores.</p>
          <div className="cat-topo__sub">
            <Link to="/catalogo" className={'pilula' + (!categoriaAtual ? ' pilula--ativa' : '')}>Todas</Link>
            {CATEGORIAS.map((c) => (
              <Link key={c} to={`/catalogo?categoria=${encodeURIComponent(c)}`} className={'pilula' + (categoriaAtual === c ? ' pilula--ativa' : '')}>{c}</Link>
            ))}
          </div>
        </div>
        <div className="cat-topo__imgs">
          {resultado.slice(0, 3).map((b) => <img key={b.id} src={b.imagem_url} alt="" />)}
        </div>
      </div>

      <div className="listagem">
        <Filtros base={base} valor={filtros} onChange={setFiltros} aberto={filtrosAbertos} categorias={CATEGORIAS} marcas={MARCAS} />

        <div>
          <div className="barra-lista">
            <span className="t-corpo"><b>{resultado.length}</b> {resultado.length === 1 ? 'brinquedo' : 'brinquedos'}</span>
            <div className="linha">
              <button className="btn btn--contorno btn--p so-mobile" onClick={() => setFiltrosAbertos(!filtrosAbertos)}>
                <Filter size={16} />Filtros
              </button>
              <span className="t-pequeno c-suave so-desktop">Ordenar por</span>
              <Campo tipo="select" opcoes={ORDENS} value={ordem} aria-label="Ordenar por"
                     onChange={(e) => { params.set('ordem', e.target.value); setParams(params) }} />
            </div>
          </div>

          {ativos.length > 0 && (
            <div className="ativos">
              {ativos.map(([texto, remover]) => (
                <button key={texto} className="pilula pilula--azul" onClick={remover}>{texto} <X size={16} /></button>
              ))}
            </div>
          )}

          {resultado.length > 0
            ? <div className="grade-produtos">{resultado.map((b) => <CardProduto key={b.id} brinquedo={b} onAdicionar={adicionar} />)}</div>
            : <Vazio titulo="Nenhum brinquedo com esses filtros" texto="Tente tirar algum filtro ou escolher outra categoria." acao="Limpar filtros" onAcao={() => setFiltros({})} />}
        </div>
      </div>
    </div>
  )
}
