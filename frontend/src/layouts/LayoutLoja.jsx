import { Outlet } from 'react-router-dom'
import Cabecalho from '../components/Cabecalho.jsx'
import Rodape from '../components/Rodape.jsx'

// Home, catálogo, busca, produto, carrinho e área do cliente.
export default function LayoutLoja() {
  return (
    <>
      <Cabecalho />
      <main>
        <Outlet />
      </main>
      <Rodape />
    </>
  )
}
