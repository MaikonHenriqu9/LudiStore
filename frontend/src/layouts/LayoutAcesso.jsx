import { Outlet, useLocation } from 'react-router-dom'
import CabecalhoSimples from '../components/CabecalhoSimples.jsx'

// Login, cadastro e checkout: cabeçalho simples, sem menu nem rodapé.
const TEXTOS = {
  '/login': 'Precisa de ajuda? Central de atendimento',
  '/cadastro': 'Já tem conta? Entre pelo login',
  '/checkout': 'Pedido em ambiente seguro',
}

export default function LayoutAcesso() {
  const { pathname } = useLocation()
  return (
    <>
      <CabecalhoSimples texto={TEXTOS[pathname]} />
      <main>
        <Outlet />
      </main>
    </>
  )
}
