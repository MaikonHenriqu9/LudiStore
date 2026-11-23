import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Store, X, Check } from 'lucide-react'
import Campo from '../../components/Campo.jsx'
import Selo from '../../components/Selo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { cadastrar } from '../../services/usuarios.js'
import { login } from '../../services/autenticacao.js'

const digitos = (v) => v.replace(/\D/g, '')

// Força da senha: 0 a 4 (tamanho, número, letra maiúscula, símbolo)
function forcaDa(senha) {
  return [senha.length >= 8, /\d/.test(senha), /[A-Z]/.test(senha), /[^A-Za-z0-9]/.test(senha)].filter(Boolean).length
}
const NOME_FORCA = ['muito fraca', 'fraca', 'média', 'boa', 'forte']

// Validação no front, igual às regras da API (RN16 a RN18)
function validar(f) {
  const e = {}
  if (!f.nome.trim()) e.nome = 'Informe o nome.'
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Informe um e-mail válido.'
  if (f.tipo_pessoa === 'PF' && f.cpf.length !== 11) e.cpf = 'O CPF precisa ter 11 dígitos.'
  if (f.tipo_pessoa === 'PJ' && f.cnpj.length !== 14) e.cnpj = 'O CNPJ precisa ter 14 dígitos.'
  if (f.perfil === 'VENDEDOR' && !(f.telefone.length >= 10)) e.telefone = 'Telefone é obrigatório para vendedores.'
  if (f.senha.length < 8) e.senha = 'A senha precisa ter pelo menos 8 caracteres.'
  if (f.confirmar !== f.senha) e.confirmar = 'As senhas não conferem.'
  return e
}

export default function Cadastro() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const [f, setF] = useState({ perfil: 'CLIENTE', tipo_pessoa: 'PF', nome: '', email: '', cpf: '', cnpj: '', telefone: '', data_nascimento: '', sexo: 'N/I', senha: '', confirmar: '' })
  const [aceite, setAceite] = useState(false)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  // mudar('cpf', 11): aceita colar "111.222.333-44", guarda só os 11 dígitos
  const mudar = (campo, maxDigitos) => (e) =>
    setF({ ...f, [campo]: maxDigitos ? digitos(e.target.value).slice(0, maxDigitos) : e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setErroGeral('')
    const encontrados = validar(f)
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
    if (!aceite) { setErroGeral('Aceite os termos de uso para criar a conta.'); return }

    // Monta o corpo do POST /api/usuarios/ só com o que foi preenchido
    const { confirmar, ...dados } = f
    if (dados.tipo_pessoa === 'PF') delete dados.cnpj; else delete dados.cpf
    if (!dados.data_nascimento) delete dados.data_nascimento
    if (!dados.telefone) delete dados.telefone

    setEnviando(true)
    try {
      await cadastrar(dados)
      entrar(await login(dados.email, dados.senha))   // já entra logado
      navegar(dados.perfil === 'VENDEDOR' ? '/vendedor/produtos' : '/', { replace: true })
    } catch (err) {
      setErros(err.campos || {})
      setErroGeral(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const forca = forcaDa(f.senha)
  const pf = f.tipo_pessoa === 'PF'

  return (
    <div className="acesso" style={{ gridTemplateColumns: '.85fr 1.15fr' }}>
      <div className="acesso__arte" style={{ background: 'linear-gradient(150deg,var(--rosa-500),#FDA4AF 70%,#FECDD3)' }}>
        <div className="acesso__fotos" style={{ left: 40 }}>
          <img src="/img/argolas.jpg" alt="" /><img src="/img/carro.jpg" alt="" /><img src="/img/jogo.jpg" alt="" />
        </div>
        <Selo cor="marinho" style={{ alignSelf: 'flex-start' }}>Crie sua conta</Selo>
        <h2 className="t-display" style={{ fontSize: 40 }}>Compre ou venda<br />brinquedos na LudiStore</h2>
        <p style={{ color: '#fff' }}>Clientes compram brinquedos de várias lojas. Vendedores cadastram os próprios produtos e acompanham as vendas.</p>
      </div>

      <div className="acesso__form">
        <form onSubmit={enviar} noValidate style={{ width: 560 }}>
          <div>
            <h1 className="t-h1">Criar conta</h1>
            <p className="t-corpo c-suave">Escolha como você quer usar a LudiStore.</p>
          </div>

          <div className="perfis" role="radiogroup" aria-label="Perfil">
            {[['CLIENTE', ShoppingCart, 'azul', 'Sou cliente', 'Quero comprar brinquedos'], ['VENDEDOR', Store, 'rosa', 'Sou vendedor', 'Quero vender meus produtos']].map(([valor, Icone, cor, titulo, texto]) => (
              <button type="button" key={valor} role="radio" aria-checked={f.perfil === valor}
                      className={'perfil-op' + (f.perfil === valor ? ' on' : '')} onClick={() => setF({ ...f, perfil: valor })}>
                <span className={`bolha bolha--${cor}`}><Icone size={20} /></span>
                <div style={{ textAlign: 'left' }}><b>{titulo}</b><div className="t-pequeno c-suave">{texto}</div></div>
              </button>
            ))}
          </div>

          <div className="linha entre">
            <span className="t-corpo-forte">Tipo de pessoa</span>
            <div className="segmento">
              <button type="button" className={pf ? 'on' : ''} onClick={() => setF({ ...f, tipo_pessoa: 'PF' })}>Pessoa física</button>
              <button type="button" className={!pf ? 'on' : ''} onClick={() => setF({ ...f, tipo_pessoa: 'PJ' })}>Pessoa jurídica</button>
            </div>
          </div>

          {erroGeral && <div className="alerta" role="alert"><X size={16} style={{ marginTop: 2, flex: 'none' }} /><span><b>{erroGeral}</b></span></div>}

          <div className="form-grade">
            <Campo className="inteiro" rotulo={pf ? 'Nome completo *' : 'Razão social *'} value={f.nome} onChange={mudar('nome')} erro={erros.nome} autoComplete="name" />
            <Campo rotulo="E-mail *" tipo="email" value={f.email} onChange={mudar('email')} erro={erros.email} autoComplete="email" />
            {pf
              ? <Campo rotulo="CPF * (só números)" value={f.cpf} onChange={mudar('cpf', 11)} erro={erros.cpf} inputMode="numeric" />
              : <Campo rotulo="CNPJ * (só números)" value={f.cnpj} onChange={mudar('cnpj', 14)} erro={erros.cnpj} inputMode="numeric" />}
            <Campo rotulo={f.perfil === 'VENDEDOR' ? 'Telefone *' : 'Telefone'} value={f.telefone} onChange={mudar('telefone', 11)}
                   erro={erros.telefone} inputMode="numeric" placeholder="11900000000" />
            {pf && <Campo rotulo="Data de nascimento" tipo="date" value={f.data_nascimento} onChange={mudar('data_nascimento')} erro={erros.data_nascimento} />}
            {pf && <Campo rotulo="Sexo" tipo="select" value={f.sexo} onChange={mudar('sexo')}
                          opcoes={[['N/I', 'Não informar'], ['F', 'Feminino'], ['M', 'Masculino'], ['O', 'Outro']]} />}
            <div>
              <Campo rotulo="Senha *" tipo="password" value={f.senha} onChange={mudar('senha')} erro={erros.senha} autoComplete="new-password" />
              {f.senha && (
                <>
                  <div className="forca" style={{ marginTop: 6 }}>{[1, 2, 3, 4].map((n) => <i key={n} className={forca >= n ? 'on' : ''} />)}</div>
                  <span className="campo__ajuda">Força da senha: {NOME_FORCA[forca]}</span>
                </>
              )}
            </div>
            <Campo rotulo="Confirmar senha *" tipo="password" value={f.confirmar} onChange={mudar('confirmar')} erro={erros.confirmar}
                   autoComplete="new-password" sufixo={f.confirmar && f.confirmar === f.senha ? <Check size={16} className="c-verde" /> : null} />
          </div>

          <p className="t-pequeno c-suave">O endereço é opcional e pode ser preenchido depois, em Minha conta.</p>
          <label className="check" onClick={(e) => { e.preventDefault(); setAceite(!aceite) }}>
            <i className={aceite ? 'on' : ''} />
            <span>Li e aceito os <b className="c-azul">Termos de uso</b> e a <b className="c-azul">Política de privacidade</b></span>
          </label>

          <button className="btn btn--destaque btn--g btn--bloco" disabled={enviando}>{enviando ? 'Criando conta…' : 'Criar minha conta'}</button>
          <p className="t-pequeno c-suave" style={{ textAlign: 'center' }}>
            Já tem conta? <Link to="/login" className="c-azul" style={{ fontWeight: 700 }}>Entrar</Link> · Contas de administrador são criadas só pelo admin.
          </p>
        </form>
      </div>
    </div>
  )
}
