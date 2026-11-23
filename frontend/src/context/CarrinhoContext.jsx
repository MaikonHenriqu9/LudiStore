import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// O carrinho não existe na API: fica no navegador (localStorage).
// No checkout ele vira o corpo do POST /api/pedidos/: { itens: [{ brinquedo_id, quantidade }] }

const CarrinhoContext = createContext(null)
const CHAVE = 'ludistore:carrinho'

function lerSalvo() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || [] } catch { return [] }
}

export function CarrinhoProvider({ children }) {
  // cada item: { brinquedo: {...dados da API}, quantidade }
  const [itens, setItens] = useState(lerSalvo)

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(itens)) } catch { /* sem localStorage */ }
  }, [itens])

  function adicionar(brinquedo, quantidade = 1) {
    setItens((atual) => {
      const existe = atual.find((i) => i.brinquedo.id === brinquedo.id)
      if (existe) {
        return atual.map((i) => i.brinquedo.id === brinquedo.id
          ? { ...i, quantidade: Math.min(i.quantidade + quantidade, brinquedo.estoque) }
          : i)
      }
      return [...atual, { brinquedo, quantidade: Math.min(quantidade, brinquedo.estoque) }]
    })
  }

  function alterarQuantidade(id, quantidade) {
    setItens((atual) => atual.map((i) => i.brinquedo.id === id
      ? { ...i, quantidade: Math.max(1, Math.min(quantidade, i.brinquedo.estoque)) }
      : i))
  }

  const remover = (id) => setItens((atual) => atual.filter((i) => i.brinquedo.id !== id))
  const limpar = () => setItens([])

  const resumo = useMemo(() => ({
    quantidadeTotal: itens.reduce((s, i) => s + i.quantidade, 0),
    total: itens.reduce((s, i) => s + i.quantidade * Number(i.brinquedo.preco), 0),
  }), [itens])

  return (
    <CarrinhoContext.Provider value={{ itens, adicionar, alterarQuantidade, remover, limpar, ...resumo }}>
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext)
  if (!ctx) throw new Error('useCarrinho precisa estar dentro de <CarrinhoProvider>')
  return ctx
}
