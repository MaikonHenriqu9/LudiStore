import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Check, X } from 'lucide-react'
import Campo from '../../components/Campo.jsx'
import MenuConta from '../../components/MenuConta.jsx'
import Selo from '../../components/Selo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { atualizar } from '../../services/usuarios.js'
import { iniciais, data } from '../../utils/formatar.js'

const digitos = (v) => v.replace(/\D/g, '')
const PERFIL = { CLIENTE: 'Cliente', VENDEDOR: 'Vendedor', ADMIN: 'Administrador' }

// Campos que esta tela edita (iguais ao UsuarioUpdateDTO, menos a senha)
const CAMPOS = ['nome', 'email', 'cpf', 'cnpj', 'telefone', 'data_nascimento', 'sexo',
  'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf']

// Um bloco do formulário com o próprio botão "Salvar" e a própria mensagem
function Secao({ id, titulo, subtitulo, children, onSalvar, estado }) {
  return (
    <form className="caixa" id={id} onSubmit={(e) => { e.preventDefault(); onSalvar() }} noValidate>
      <div className="linha entre" style={{ marginBottom: 16 }}>
        <div><h2 className="t-h2">{titulo}</h2>{subtitulo && <p className="t-pequeno c-suave">{subtitulo}</p>}</div>
      </div>
      {children}
      <div className="linha" style={{ justifyContent: 'flex-end', marginTop: 20, flexWrap: 'wrap' }}>
        {estado?.ok && <span className="t-pequeno-forte c-verde linha" style={{ gap: 6 }}><Check size={16} />{estado.ok}</span>}
        {estado?.erro && <span className="t-pequeno-forte c-rosa linha" style={{ gap: 6 }}><X size={16} />{estado.erro}</span>}
        <button className="btn btn--primario" disabled={estado?.enviando}>{estado?.enviando ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}

export default function MinhaConta() {
  const { usuario, atualizarUsuario } = useAuth()
  const [f, setF] = useState(() => Object.fromEntries(CAMPOS.map((c) => [c, usuario[c] ?? ''])))
  const [senha, setSenha] = useState({ nova: '', confirmar: '' })
  const [erros, setErros] = useState({})
  const [estados, setEstados] = useState({})

  // mudar('cpf', 11): aceita colar "111.222.333-44", guarda só os 11 dígitos
  const mudar = (campo, maxDigitos) => (e) =>
    setF({ ...f, [campo]: maxDigitos ? digitos(e.target.value).slice(0, maxDigitos) : e.target.value })

  // Envia só os campos da seção (PATCH aceita envio parcial)
  async function salvar(secao, campos) {
    setEstados({ ...estados, [secao]: { enviando: true } })
    setErros({})
    const corpo = Object.fromEntries(campos.map((c) => [c, f[c] === '' && c === 'data_nascimento' ? null : f[c]]))
    try {
      const atualizado = await atualizar(usuario.id, corpo)
      atualizarUsuario(atualizado)
      setEstados({ ...estados, [secao]: { ok: 'Dados salvos.' } })
    } catch (err) {
      setErros(err.campos)
      setEstados({ ...estados, [secao]: { erro: err.message } })
    }
  }

  async function salvarSenha() {
    if (senha.nova.length < 8) { setErros({ nova: 'A senha precisa ter pelo menos 8 caracteres.' }); return }
    if (senha.nova !== senha.confirmar) { setErros({ confirmar: 'As senhas não conferem.' }); return }
    setEstados({ ...estados, senha: { enviando: true } })
    try {
      await atualizar(usuario.id, { senha: senha.nova })
      setSenha({ nova: '', confirmar: '' })
      setErros({})
      setEstados({ ...estados, senha: { ok: 'Senha alterada.' } })
    } catch (err) {
      setEstados({ ...estados, senha: { erro: err.message } })
    }
  }

  const pf = usuario.tipo_pessoa !== 'PJ'

  return (
    <div className="container">
      <div className="migalhas"><Link to="/">Início</Link> <ChevronRight /> Minha conta <ChevronRight /> <b>Meus dados</b></div>
      <div className="conta">
        <MenuConta />
        <div className="coluna" style={{ gap: 20 }}>
          <Secao id="dados" titulo="Meus dados" subtitulo="Mantenha suas informações atualizadas para receber seus pedidos."
                 estado={estados.dados}
                 onSalvar={() => salvar('dados', ['nome', 'email', 'cpf', 'cnpj', 'telefone', 'data_nascimento', 'sexo'])}>
            <div className="linha" style={{ gap: 18, marginBottom: 22 }}>
              <span className="avatar avatar--g">{iniciais(usuario.nome)}</span>
              <div>
                <b className="t-h3">{usuario.nome}</b>
                <div className="linha" style={{ gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <Selo cor="azul">{PERFIL[usuario.perfil]} · {pf ? 'Pessoa física' : 'Pessoa jurídica'}</Selo>
                  {usuario.criado_em && <span className="t-pequeno c-suave">Conta criada em {data(usuario.criado_em)}</span>}
                </div>
              </div>
            </div>
            <div className="form-grade">
              <Campo rotulo={pf ? 'Nome completo' : 'Razão social'} value={f.nome} onChange={mudar('nome')} erro={erros.nome} />
              <Campo rotulo="E-mail" tipo="email" value={f.email} onChange={mudar('email')} erro={erros.email} />
              <Campo rotulo={pf ? 'CPF' : 'CPF (opcional)'} value={f.cpf} onChange={mudar('cpf', 11)} erro={erros.cpf} inputMode="numeric" />
              <Campo rotulo={pf ? 'CNPJ (opcional)' : 'CNPJ'} value={f.cnpj} onChange={mudar('cnpj', 14)} erro={erros.cnpj} inputMode="numeric" />
              <Campo rotulo={usuario.perfil === 'VENDEDOR' ? 'Telefone *' : 'Telefone'} value={f.telefone} onChange={mudar('telefone', 11)} erro={erros.telefone} inputMode="numeric" />
              <Campo rotulo="Data de nascimento" tipo="date" value={f.data_nascimento} onChange={mudar('data_nascimento')} erro={erros.data_nascimento} />
              <Campo rotulo="Sexo" tipo="select" value={f.sexo || 'N/I'} onChange={mudar('sexo')}
                     opcoes={[['N/I', 'Não informar'], ['F', 'Feminino'], ['M', 'Masculino'], ['O', 'Outro']]} />
            </div>
          </Secao>

          <Secao id="endereco" titulo="Endereço" subtitulo="Opcional · aparece no checkout como endereço de entrega."
                 estado={estados.endereco}
                 onSalvar={() => salvar('endereco', ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf'])}>
            <div className="form-grade" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
              <Campo rotulo="CEP" value={f.cep} onChange={mudar('cep', 8)} erro={erros.cep} inputMode="numeric" />
              <Campo rotulo="Logradouro" value={f.logradouro} onChange={mudar('logradouro')} erro={erros.logradouro} />
              <Campo rotulo="Número" value={f.numero} onChange={mudar('numero')} erro={erros.numero} />
              <Campo rotulo="Complemento" value={f.complemento} onChange={mudar('complemento')} erro={erros.complemento} />
              <Campo rotulo="Bairro" value={f.bairro} onChange={mudar('bairro')} erro={erros.bairro} />
              <div className="form-grade" style={{ gridTemplateColumns: '1fr 80px', gap: 12 }}>
                <Campo rotulo="Cidade" value={f.cidade} onChange={mudar('cidade')} erro={erros.cidade} />
                <Campo rotulo="UF" value={f.uf} onChange={(e) => setF({ ...f, uf: e.target.value.toUpperCase().slice(0, 2) })} erro={erros.uf} />
              </div>
            </div>
          </Secao>

          <Secao id="senha" titulo="Alterar senha" estado={estados.senha} onSalvar={salvarSenha}>
            <div className="form-grade">
              <Campo rotulo="Nova senha" tipo="password" value={senha.nova} erro={erros.nova} autoComplete="new-password"
                     onChange={(e) => setSenha({ ...senha, nova: e.target.value })} placeholder="Mínimo 8 caracteres" />
              <Campo rotulo="Confirmar nova senha" tipo="password" value={senha.confirmar} erro={erros.confirmar} autoComplete="new-password"
                     onChange={(e) => setSenha({ ...senha, confirmar: e.target.value })} />
            </div>
          </Secao>
        </div>
      </div>
    </div>
  )
}
