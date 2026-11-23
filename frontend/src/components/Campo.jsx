import { useId } from 'react'

/**
 * Campo de formulário com rótulo, ícone opcional e mensagem de erro/ajuda.
 *
 * <Campo rotulo="E-mail" icone={<Mail size={16} />} value={email} onChange={...} />
 * <Campo rotulo="CPF" erro="CPF já cadastrado." ... />
 * <Campo rotulo="Marca" tipo="select" opcoes={['Brinca Mais', ...]} ... />
 * <Campo rotulo="Descrição" tipo="textarea" ... />
 *
 * Qualquer outra prop (value, onChange, placeholder, name...) vai direto para o input.
 */
export default function Campo({ rotulo, icone, sufixo, erro, ajuda, tipo = 'text', opcoes = [], foco = false, className = '', ...input }) {
  const id = useId()
  const classes = ['campo', erro && 'campo--erro', foco && 'campo--foco', className].filter(Boolean).join(' ')

  let controle
  if (tipo === 'textarea') {
    controle = <textarea id={id} {...input} />
  } else if (tipo === 'select') {
    controle = (
      <div className="campo__caixa">
        {icone}
        <select id={id} {...input}>
          {opcoes.map((op) => {
            const [valor, texto] = Array.isArray(op) ? op : [op, op]
            return <option key={valor} value={valor}>{texto}</option>
          })}
        </select>
      </div>
    )
  } else {
    controle = (
      <div className="campo__caixa">
        {icone}
        <input id={id} type={tipo} {...input} />
        {sufixo}
      </div>
    )
  }

  return (
    <div className={classes}>
      {rotulo && <label htmlFor={id}>{rotulo}</label>}
      {controle}
      {(erro || ajuda) && <span className="campo__ajuda">{erro || ajuda}</span>}
    </div>
  )
}
