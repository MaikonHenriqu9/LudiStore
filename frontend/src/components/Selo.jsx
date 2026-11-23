// <Selo cor="verde">Ativo</Selo>
// cores: amarelo, rosa, azul, verde, cinza, marinho
export default function Selo({ cor = 'azul', children, ...resto }) {
  return <span className={`selo selo--${cor}`} {...resto}>{children}</span>
}
