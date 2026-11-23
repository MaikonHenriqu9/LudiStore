import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Package, Gift, Store, ChevronRight } from 'lucide-react'
import CardProduto from '../../components/CardProduto.jsx'
import Selo from '../../components/Selo.jsx'
import { useCarrinho } from '../../context/CarrinhoContext.jsx'
import { ordenar } from '../../utils/catalogo.js'
import { BRINQUEDOS, CATEGORIAS, MARCAS } from '../../dados/exemplo.js'
import * as brinquedosService from '../../services/brinquedos.js'

const BENEFICIOS = [
  [ShieldCheck, 'azul', 'Compra segura', 'Login com token e senha criptografada'],
  [Package, 'verde', 'Estoque garantido', 'O item é reservado no momento do pedido'],
  [Gift, 'amarelo', 'Para cada idade', 'Todo brinquedo informa a idade mínima'],
  [Store, 'rosa', 'Lojas parceiras', 'Vendedores identificados por CPF ou CNPJ'],
]

// [idade, rótulo, fundo, cor do texto]
const IDADES = [
  [0, 'todas as idades', 'Bebês', 'azul-50', 'azul-500'],
  [1, 'ano', 'A partir de 1 ano', 'rosa-50', 'rosa-600'],
  [3, 'anos', 'A partir de 3 anos', 'amarelo-50', 'marinho-900'],
  [6, 'anos', 'A partir de 6 anos', 'verde-50', 'verde-600'],
  [9, 'anos', 'A partir de 9 anos', 'azul-50', 'azul-700'],
  [12, 'anos', 'A partir de 12 anos', 'rosa-50', 'rosa-600'],
]

// Fundo e imagem de cada categoria no bloco "Navegue por categoria"
const VISUAL_CATEGORIA = {
  Bonecas: ['rosa-50', '/img/boneca.jpg'], Veículos: ['azul-50', '/img/carro.jpg'], Jogos: ['verde-50', '/img/jogo.jpg'],
  Pelúcias: ['amarelo-50', '/img/urso.jpg'], 'Blocos de montar': ['azul-50', '/img/blocos.jpg'], Baby: ['rosa-50', '/img/argolas.jpg'],
}
const CORES_MARCA = ['azul-500', 'rosa-500', 'verde-600', 'amarelo-400', 'rosa-600', 'azul-700']

const ABAS = [['recentes', 'Mais recentes'], ['menor_preco', 'Menor preço'], ['maior_preco', 'Maior preço'], ['nome', 'A–Z']]

function TituloSecao({ titulo, para, link = 'Ver tudo', children }) {
  return (
    <div className="secao-titulo">
      {children || <h2 className="t-h2">{titulo}</h2>}
      {para && <Link to={para} className="ver-tudo">{link} <ChevronRight size={16} /></Link>}
    </div>
  )
}

export default function Home() {
  const { adicionar } = useCarrinho()
  const [ordem, setOrdem] = useState('recentes')
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

  const brinquedos = lista
  const vitrine = ordenar(brinquedos, ordem).slice(0, 5)
  const ateCem = ordenar(brinquedos.filter((b) => Number(b.preco) <= 100 && b.estoque > 0), 'menor_preco').slice(0, 5)
  const qtdPorCategoria = (c) => brinquedos.filter((b) => {
    const cats = Array.isArray(b.categorias) ? b.categorias.map(cat => typeof cat === 'object' ? cat.nome : cat) : []
    return cats.includes(c)
  }).length

  return (
    <div className="container">
      {/* Banner principal */}
      <section className="hero">
        <div className="hero__confete" />
        <div className="hero__texto">
          <span><Selo cor="rosa">Natal LudiStore</Selo></span>
          <h1 className="t-display">Brinquedos que viram memórias de infância</h1>
          <p>Presentes para todas as idades, escolhidos por faixa etária e vendidos por lojas parceiras.</p>
          <div className="linha">
            <Link to="/catalogo?ordem=recentes" className="btn btn--destaque btn--g">Ver novidades</Link>
            <a href="#idades" className="btn btn--contorno btn--g">Presentes por idade</a>
          </div>
        </div>
        <div className="hero__fotos" aria-hidden="true">
          {['urso', 'blocos', 'argolas', 'carro'].map((f) => (
            <div key={f} className="hero__foto"><img src={`/img/${f}.jpg`} alt="" /></div>
          ))}
        </div>
      </section>

      <div className="beneficios">
        {BENEFICIOS.map(([Icone, cor, titulo, texto]) => (
          <div key={titulo} className="beneficio">
            <span className={`bolha bolha--${cor}`}><Icone size={24} /></span>
            <div><div className="t-corpo-forte">{titulo}</div><div className="t-pequeno c-suave">{texto}</div></div>
          </div>
        ))}
      </div>

      {/* Compre por idade (idade_minima) */}
      <section className="secao" id="idades">
        <TituloSecao titulo="Compre por idade mínima" para="/catalogo" link="Ver catálogo" />
        <div className="idades">
          {IDADES.map(([n, unidade, texto, fundo, cor]) => (
            <Link key={n} to={n === 0 ? '/catalogo?idade=0' : `/catalogo?idade=${n}`} className="idade">
              <span className="idade__circulo" style={{ background: `var(--${fundo})`, color: `var(--${cor})` }}>
                <b>{n}+</b><small>{unidade}</small>
              </span>
              {texto}
            </Link>
          ))}
        </div>
      </section>

      {/* Vitrine com as 4 ordenações da API */}
      <section className="secao">
        <TituloSecao para={`/catalogo?ordem=${ordem}`}>
          <div className="linha" style={{ gap: 8, flexWrap: 'wrap' }}>
            <h2 className="t-h2" style={{ marginRight: 16 }}>Catálogo</h2>
            {ABAS.map(([valor, texto]) => (
              <button key={valor} className={'pilula' + (ordem === valor ? ' pilula--ativa' : '')} onClick={() => setOrdem(valor)}>{texto}</button>
            ))}
          </div>
        </TituloSecao>
        <div className="prateleira">
          {vitrine.map((b) => <CardProduto key={b.id} brinquedo={b} onAdicionar={adicionar} />)}
        </div>
      </section>

      <section className="secao">
        <TituloSecao titulo="Navegue por categoria" para="/catalogo" link="Todas as categorias" />
        <div className="categorias">
          {CATEGORIAS.map((c) => {
            const [fundo, img] = VISUAL_CATEGORIA[c] || ['azul-50', '/img/blocos.jpg']
            const qtd = qtdPorCategoria(c)
            return (
              <Link key={c} to={`/catalogo?categoria=${encodeURIComponent(c)}`} className="categoria" style={{ background: `var(--${fundo})` }}>
                <img src={img} alt="" />
                <b className="t-h3">{c}</b>
                <span className="t-pequeno c-suave">{qtd} {qtd === 1 ? 'item' : 'itens'}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="secao banners">
        <div className="banner" style={{ background: 'var(--amarelo-400)' }}>
          <div>
            <Selo cor="rosa">Pelúcias</Selo>
            <h3 className="t-h1">Abraços que<br />duram para sempre</h3>
            <p className="t-corpo" style={{ color: 'var(--marinho-700)' }}>Macias, laváveis e para todas as idades</p>
            <Link to="/catalogo?categoria=Pel%C3%BAcias" className="btn btn--contorno btn--p">Ver pelúcias</Link>
          </div>
          <img src="/img/urso.jpg" alt="" />
        </div>
        <div className="banner" style={{ background: 'var(--azul-50)' }}>
          <div>
            <Selo cor="azul" style={{ background: '#fff' }}>Primeira infância</Selo>
            <h3 className="t-h1">Brinquedos<br />Montessori</h3>
            <p className="t-corpo" style={{ color: 'var(--marinho-700)' }}>Estímulo sensorial para os pequenos</p>
            <Link to="/catalogo?categoria=Baby" className="btn btn--primario btn--p">Explorar</Link>
          </div>
          <img src="/img/argolas.jpg" alt="" />
        </div>
      </section>

      {ateCem.length > 0 && (
        <section className="secao">
          <TituloSecao titulo="Até R$ 100" para="/catalogo?ordem=menor_preco" />
          <div className="prateleira">
            {ateCem.map((b) => <CardProduto key={b.id} brinquedo={b} onAdicionar={adicionar} />)}
          </div>
        </section>
      )}

      <section className="secao">
        <TituloSecao titulo="Marcas" />
        <div className="marcas">
          {MARCAS.map((m, i) => (
            <Link key={m} to={`/catalogo?marca=${encodeURIComponent(m)}`} className="marca">
              <i style={{ background: `var(--${CORES_MARCA[i % CORES_MARCA.length]})` }} />{m}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
