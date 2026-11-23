import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Ordem importa: tokens → componentes → telas → responsivo (sempre por último)
import './styles/tokens.css'
import './styles/componentes.css'
import './styles/telas.css'
import './styles/responsivo.css'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CarrinhoProvider } from './context/CarrinhoContext.jsx'
import RolarParaOTopo from './components/RolarParaOTopo.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CarrinhoProvider>
          <RolarParaOTopo />
          <App />
        </CarrinhoProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
