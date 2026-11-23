import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, Pencil, MapPin, Lock, X } from 'lucide-react'
import { ItemCarrinho } from './Carrinho.jsx'
import { useCarrinho } from '../../context/CarrinhoContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { criar } from '../../services/pedidos.js'
import { reais } from '../../utils/formatar.js'

// Checkout = revisar e confirmar. A API recebe só os itens:
// POST /api/pedidos/  { itens: [{ brinquedo_id, quantidade }] }
export default function Checkout() {
  const { itens, total, quantidadeTotal, limpar } = useCarrinho()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const concluido = useRef(false)   // pedido feito: não redirecionar para o carrinho vazio

  if (itens.length === 0) return concluido.current ? null : <Navigate to="/carrinho" replace />

  const vendedores = new Set(itens.map((i) => i.brinquedo.vendedor)).size
  const temEndereco = usuario.logradouro && usuario.cidade
  // Se a API reclamar de um brinquedo pelo nome, destaca a linha dele
  const itemComProblema = itens.find((i) => erro.includes(i.brinquedo.nome))?.brinquedo.id

  async function confirmar() {
    setErro('')
    setEnviando(true)
    try {
      const pedido = await criar(itens.map((i) => ({ brinquedo_id: i.brinquedo.id, quantidade: i.quantidade })))
      concluido.current = true
      navegar('/conta/pedidos', { replace: true, state: { pedidoNovo: pedido.id } })
      limpar()
    } catch (err) {
      // 400 com { erro: "Estoque insuficiente para ..." } ou "Você não pode comprar o próprio produto"
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 64 }}>
      <div className="etapas" style={{ margin: '32px 0 30px' }}>
        <div className="etapa ok"><i><Check size={16} /></i>Carrinho</div><hr className="ok" />
        <div className="etapa on"><i>2</i>Revisão</div><hr />
        <div className="etapa"><i>3</i>Pedido confirmado</div>
      </div>

      <div className="carrinho">
        <div className="coluna" style={{ gap: 16 }}>
          {erro && (
            <div className="alerta" role="alert">
              <X size={16} style={{ marginTop: 2, flex: 'none' }} />
              <span><b>{erro}</b> Ajuste o carrinho e confirme de novo.</span>
            </div>
          )}

          <div className="caixa">
            <div className="linha entre" style={{ marginBottom: 6 }}>
              <h2 className="t-h2">Revise seus itens</h2>
              <Link to="/carrinho" className="btn btn--texto btn--p"><Pencil size={16} />Editar carrinho</Link>
            </div>
            {itens.map((item) => (
              <ItemCarrinho key={item.brinquedo.id} item={item} somenteLeitura destaque={item.brinquedo.id === itemComProblema} />
            ))}
          </div>

          <div className="caixa linha" style={{ gap: 16 }}>
            <span className="bolha bolha--verde"><MapPin size={20} /></span>
            <div className="cresce">
              <b>Endereço do seu cadastro</b>
              <div className="t-pequeno c-suave">
                {temEndereco
                  ? `${usuario.logradouro}, ${usuario.numero}${usuario.complemento ? `, ${usuario.complemento}` : ''} · ${usuario.bairro} · ${usuario.cidade}/${usuario.uf} · ${usuario.cep}`
                  : 'Você ainda não informou um endereço.'}
              </div>
            </div>
            <Link to="/conta#endereco" className="btn btn--texto btn--p">{temEndereco ? 'Alterar em Minha conta' : 'Adicionar endereço'}</Link>
          </div>

          <div className="alerta alerta--info">
            <Lock size={16} style={{ marginTop: 2, flex: 'none' }} />
            <span>Ao confirmar, a API grava o pedido numa única transação: confere o estoque de cada item, guarda o preço do momento e baixa o estoque. Se um item falhar, nada é gravado.</span>
          </div>
        </div>

        <div className="caixa resumo">
          <h3 className="t-h2" style={{ marginBottom: 12 }}>Seu pedido</h3>
          <ul>
            <li><span>Itens</span><b>{quantidadeTotal}</b></li>
            <li><span>Vendedores</span><b>{vendedores}</b></li>
          </ul>
          <div className="resumo__total"><b className="t-corpo-forte">Total</b><span className="t-preco-g" style={{ fontSize: 30 }}>{reais(total)}</span></div>
          <button className="btn btn--destaque btn--g btn--bloco" style={{ marginTop: 18 }} onClick={confirmar} disabled={enviando}>
            {enviando ? 'Confirmando…' : 'Confirmar pedido'}
          </button>
          <Link to="/carrinho" className="btn btn--texto btn--bloco" style={{ marginTop: 6 }}><ChevronLeft size={16} />Voltar ao carrinho</Link>
          <p className="t-pequeno c-suave" style={{ marginTop: 12, textAlign: 'center' }}>Você não pode comprar um produto que você mesmo vende.</p>
        </div>
      </div>
    </div>
  )
}
