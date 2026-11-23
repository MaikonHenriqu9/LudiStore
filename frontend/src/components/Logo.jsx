import { Link } from 'react-router-dom'

// Cubo da logo oficial (vetor). Cores fixas da marca.
function Cubo() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 6 L93 23 L50 41 L7 23 Z" fill="#3E9BD3" stroke="#3E9BD3" strokeWidth="5" strokeLinejoin="round" />
      <path d="M7 23 L50 41 L50 95 L7 77 Z" fill="#FCD20F" stroke="#FCD20F" strokeWidth="5" strokeLinejoin="round" />
      <path d="M50 41 L93 23 L93 77 L50 95 Z" fill="#EC5040" stroke="#EC5040" strokeWidth="5" strokeLinejoin="round" />
      <path d="M28 44 L32.5 53 L42 54.5 L35 61 L37 71 L28 66 L19 71 L21 61 L14 54.5 L23.5 53 Z" fill="#fff" />
    </svg>
  )
}

/**
 * <Logo />                      azul e vermelho, para fundo claro
 * <Logo variante="branco" />    branco e amarelo, para fundo escuro
 * <Logo pequena />              versão menor (painéis)
 * <Logo para={null} />          sem link
 */
export default function Logo({ variante = 'padrao', pequena = false, para = '/' }) {
  const classes = ['logo', variante === 'branco' && 'logo--branco', pequena && 'logo--p'].filter(Boolean).join(' ')
  const conteudo = (
    <>
      <Cubo />
      <div><b>Ludi</b><span>Store</span></div>
    </>
  )
  return para ? <Link to={para} className={classes} aria-label="LudiStore, página inicial">{conteudo}</Link>
              : <span className={classes}>{conteudo}</span>
}
