import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Ao trocar de página, volta para o topo (o React Router não faz isso sozinho).
// Se o endereço tiver âncora (#endereco), rola até ela.
export default function RolarParaOTopo() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
