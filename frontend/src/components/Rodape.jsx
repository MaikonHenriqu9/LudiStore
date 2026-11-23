import { Link } from 'react-router-dom'
import { Mail, Smartphone, CalendarDays, ShieldCheck } from 'lucide-react'
import Logo from './Logo.jsx'

const COLUNAS = [
  ['Institucional', [['Sobre a LudiStore', '/'], ['Seja um vendedor', '/cadastro'], ['Como comprar', '/']]],
  ['Minha conta', [['Meus dados', '/conta'], ['Meus pedidos', '/conta/pedidos'], ['Meu carrinho', '/carrinho'], ['Área do vendedor', '/vendedor/produtos']]],
  ['Ajuda', [['Central de atendimento', '/'], ['Trocas e devoluções', '/'], ['Privacidade e LGPD', '/']]],
]

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape__cols">
        <div>
          <Logo variante="branco" />
          <p style={{ marginTop: 14, maxWidth: 280 }}>
            Brinquedos que acompanham cada fase da infância, de vendedores parceiros de todo o Brasil.
          </p>
        </div>
        {COLUNAS.map(([titulo, links]) => (
          <div key={titulo}>
            <h4>{titulo}</h4>
            <ul>{links.map(([texto, para]) => <li key={texto}><Link to={para}>{texto}</Link></li>)}</ul>
          </div>
        ))}
        <div>
          <h4>Atendimento</h4>
          <ul>
            <li className="ic"><Mail size={16} />sac@ludistore.com.br</li>
            <li className="ic"><Smartphone size={16} />(11) 4000-0000</li>
            <li className="ic"><CalendarDays size={16} />Seg a sex, das 9h às 18h</li>
          </ul>
        </div>
      </div>
      <div className="rodape__base">
        <div>Projeto IES300 · Engenharia de Software III</div>
        <div className="seg"><ShieldCheck size={16} />Senhas criptografadas · Dados protegidos pela LGPD</div>
        <div>© {new Date().getFullYear()} LudiStore · FateCreators</div>
      </div>
    </footer>
  )
}
