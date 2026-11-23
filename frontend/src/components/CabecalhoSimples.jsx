import { Lock } from 'lucide-react'
import Logo from './Logo.jsx'

// Login, cadastro e checkout: só a logo e um texto à direita.
export default function CabecalhoSimples({ texto = 'Ambiente 100% seguro' }) {
  return (
    <header className="cabecalho-simples">
      <Logo />
      <span className="cabecalho-simples__seg"><Lock size={16} />{texto}</span>
    </header>
  )
}
