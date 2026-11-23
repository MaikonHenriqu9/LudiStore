import { Routes, Route } from 'react-router-dom'

import LayoutLoja from './layouts/LayoutLoja.jsx'
import LayoutAcesso from './layouts/LayoutAcesso.jsx'
import LayoutPainel from './layouts/LayoutPainel.jsx'
import RotaProtegida from './components/RotaProtegida.jsx'

// Loja
import Home from './pages/loja/Home.jsx'
import Catalogo from './pages/loja/Catalogo.jsx'
import Busca from './pages/loja/Busca.jsx'
import Produto from './pages/loja/Produto.jsx'
// Acesso
import Login from './pages/acesso/Login.jsx'
import Cadastro from './pages/acesso/Cadastro.jsx'
// Cliente
import MinhaConta from './pages/cliente/MinhaConta.jsx'
import Carrinho from './pages/cliente/Carrinho.jsx'
import Checkout from './pages/cliente/Checkout.jsx'
import MeusPedidos from './pages/cliente/MeusPedidos.jsx'
// Vendedor
import MeusProdutos from './pages/vendedor/MeusProdutos.jsx'
import ProdutoForm from './pages/vendedor/ProdutoForm.jsx'
import MinhasVendas from './pages/vendedor/MinhasVendas.jsx'
// Admin
import AdminGeral from './pages/admin/AdminGeral.jsx'
import AdminProdutos from './pages/admin/AdminProdutos.jsx'
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'
import AdminPedidos from './pages/admin/AdminPedidos.jsx'
import AdminCatalogo from './pages/admin/AdminCatalogo.jsx'
// Apoio ao desenvolvimento
import MapaTelas from './pages/MapaTelas.jsx'
import NaoEncontrada from './pages/NaoEncontrada.jsx'

export default function App() {
  return (
    <Routes>
      {/* Páginas com cabeçalho e rodapé da loja */}
      <Route element={<LayoutLoja />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/busca" element={<Busca />} />
        <Route path="/produto/:id" element={<Produto />} />
        {/* Só para quem está logado */}
        <Route element={<RotaProtegida />}>
          <Route path="/conta" element={<MinhaConta />} />
          <Route path="/conta/pedidos" element={<MeusPedidos />} />
        </Route>
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/telas" element={<MapaTelas />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>

      {/* Páginas com cabeçalho simples (sem menu) */}
      <Route element={<LayoutAcesso />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route element={<RotaProtegida />}>
          <Route path="/checkout" element={<Checkout />} />
        </Route>
      </Route>

      {/* Painel do vendedor */}
      <Route element={<RotaProtegida perfis={['VENDEDOR', 'ADMIN']} />}>
      <Route path="/vendedor" element={<LayoutPainel perfil="vendedor" />}>
        <Route path="produtos" element={<MeusProdutos />} />
        <Route path="produtos/novo" element={<ProdutoForm />} />
        <Route path="produtos/:id/editar" element={<ProdutoForm />} />
        <Route path="vendas" element={<MinhasVendas />} />
      </Route>
      </Route>

      {/* Painel do administrador */}
      <Route element={<RotaProtegida perfis={['ADMIN']} />}>
      <Route path="/admin" element={<LayoutPainel perfil="admin" />}>
        <Route index element={<AdminGeral />} />
        <Route path="produtos" element={<AdminProdutos />} />
        <Route path="produtos/:id/editar" element={<ProdutoForm />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="pedidos" element={<AdminPedidos />} />
        <Route path="catalogo" element={<AdminCatalogo />} />
      </Route>
      </Route>
    </Routes>
  )
}
