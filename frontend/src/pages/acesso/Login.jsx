import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, X, LogIn } from 'lucide-react'
import Campo from '../../components/Campo.jsx'
import Selo from '../../components/Selo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { login } from '../../services/autenticacao.js'

// Para onde cada perfil vai depois do login (se não veio de outra página)
const DESTINO = { CLIENTE: '/', VENDEDOR: '/vendedor/produtos', ADMIN: '/admin' }

export default function Login() {
  const { entrar } = useAuth()
  const navegar = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    if (!email || !senha) { setErro('Preencha o e-mail e a senha.'); return }

    setEnviando(true)
    try {
      const resposta = await login(email.trim(), senha)
      entrar(resposta)
      navegar(params.get('proximo') || DESTINO[resposta.usuario.perfil] || '/', { replace: true })
    } catch (err) {
      setErro(err.status === 401 || err.status === 400 ? 'E-mail ou senha inválidos.' : err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="acesso">
      <div className="acesso__arte">
        <div className="acesso__fotos">
          <img src="/img/urso.jpg" alt="" /><img src="/img/blocos.jpg" alt="" /><img src="/img/boneca.jpg" alt="" />
        </div>
        <Selo cor="amarelo" style={{ alignSelf: 'flex-start' }}>Bem-vindo de volta</Selo>
        <h2 className="t-display" style={{ fontSize: 42 }}>Que bom te ver<br />por aqui de novo!</h2>
        <p>Acompanhe seus pedidos e, se você vende na LudiStore, gerencie seus produtos e vendas.</p>
      </div>

      <div className="acesso__form">
        <form onSubmit={enviar} noValidate>
          <div>
            <h1 className="t-h1">Entrar</h1>
            <p className="t-corpo c-suave">Use o e-mail e a senha da sua conta LudiStore.</p>
          </div>

          {params.get('proximo') && !erro && (
            <div className="alerta alerta--info"><Lock size={16} style={{ marginTop: 2, flex: 'none' }} /><span>Entre na sua conta para continuar.</span></div>
          )}
          {erro && <div className="alerta" role="alert"><X size={16} style={{ marginTop: 2, flex: 'none' }} /><span><b>{erro}</b></span></div>}

          <Campo rotulo="E-mail" tipo="email" icone={<Mail size={16} />} value={email} autoComplete="email"
                 onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" />
          <Campo rotulo="Senha" tipo={verSenha ? 'text' : 'password'} icone={<Lock size={16} />} value={senha}
                 autoComplete="current-password" onChange={(e) => setSenha(e.target.value)}
                 sufixo={<button type="button" className="btn btn--texto btn--p" onClick={() => setVerSenha(!verSenha)}
                                 aria-label={verSenha ? 'Esconder senha' : 'Mostrar senha'}>{verSenha ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
          <p className="t-pequeno c-suave">Por segurança, a sessão expira depois de 8 horas.</p>

          <button className="btn btn--primario btn--g btn--bloco" disabled={enviando}>
            <LogIn size={20} />{enviando ? 'Entrando…' : 'Entrar'}
          </button>
          <div className="separador">ou</div>
          <p className="t-corpo" style={{ textAlign: 'center' }}>
            Ainda não tem conta? <Link to="/cadastro" className="c-rosa" style={{ fontWeight: 700 }}>Cadastre-se grátis</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
