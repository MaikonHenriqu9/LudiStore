// Dados de exemplo no MESMO formato que a API devolve.
// Usados enquanto as telas são montadas (etapa 3). Na etapa 4 são trocados
// pelas chamadas reais em src/services/.

const diasAtras = (d) => new Date(Date.now() - d * 86400000).toISOString()

// GET /api/brinquedos/  (BrinquedoResponseDTO)
export const BRINQUEDOS = [
  { id: 1, sku: 'BRM-BLC-120', nome: 'Kit Blocos de Montar 120 peças', descricao: 'Um kit colorido com 120 blocos de madeira para construir torres, castelos e tudo o que a imaginação mandar. Peças com cantos arredondados e pintura atóxica.', preco: '99.90', estoque: 12, idade_minima: 3, imagem_url: '/img/blocos.jpg', ativo: true, marca: 'Brinca Mais', vendedor: 'Sandra Rodrigues', categorias: ['Blocos de montar'], criado_em: diasAtras(40) },
  { id: 2, sku: 'BRM-URS-040', nome: 'Urso de Pelúcia Fofinho 40 cm', descricao: 'Pelúcia macia e lavável, com costuras reforçadas.', preco: '89.90', estoque: 30, idade_minima: 0, imagem_url: '/img/urso.jpg', ativo: true, marca: 'Mundo dos Brinquedos', vendedor: 'Sandra Rodrigues', categorias: ['Pelúcias'], criado_em: diasAtras(30) },
  { id: 3, sku: 'MDB-CAR-777', nome: 'Carrinho de Controle Remoto Turbo', descricao: 'Carrinho com controle remoto, tração traseira e bateria recarregável.', preco: '199.90', estoque: 0, idade_minima: 6, imagem_url: '/img/carro.jpg', ativo: true, marca: 'Toy Center', vendedor: 'Mundo dos Brinquedos', categorias: ['Veículos'], criado_em: diasAtras(3) },
  { id: 4, sku: 'BRM-JOG-010', nome: 'Jogo de Tabuleiro Aventura em Família', descricao: 'Jogo cooperativo para 2 a 6 jogadores.', preco: '129.90', estoque: 8, idade_minima: 5, imagem_url: '/img/jogo.jpg', ativo: true, marca: 'Estrela Guia', vendedor: 'Sandra Rodrigues', categorias: ['Jogos'], criado_em: diasAtras(5) },
  { id: 5, sku: 'MDB-BON-002', nome: 'Boneca de Pano Lulu', descricao: 'Boneca de pano feita à mão, com cabelo de lã.', preco: '79.90', estoque: 4, idade_minima: 3, imagem_url: '/img/boneca.jpg', ativo: true, marca: 'Ateliê Pequenos', vendedor: 'Mundo dos Brinquedos', categorias: ['Bonecas'], criado_em: diasAtras(60) },
  { id: 6, sku: 'MDB-ARG-001', nome: 'Torre de Argolas Montessori', descricao: 'Argolas de madeira em cores suaves para empilhar.', preco: '59.90', estoque: 2, idade_minima: 1, imagem_url: '/img/argolas.jpg', ativo: true, marca: 'Brinca Mais', vendedor: 'Mundo dos Brinquedos', categorias: ['Baby'], criado_em: diasAtras(90) },
]

// GET /api/categorias/ e GET /api/marcas/
export const CATEGORIAS = ['Bonecas', 'Veículos', 'Jogos', 'Pelúcias', 'Blocos de montar', 'Baby']
export const MARCAS = ['Brinca Mais', 'Toy Center', 'Mundo dos Brinquedos', 'Estrela Guia', 'Ateliê Pequenos']

// Usuários de exemplo (UsuarioResponseDTO, resumido)
export const USUARIO_CLIENTE = { id: 7, nome: 'Ana Souza', email: 'ana@email.com', perfil: 'CLIENTE' }
export const USUARIO_VENDEDOR = { id: 3, nome: 'Sandra Rodrigues', email: 'sandra@email.com', perfil: 'VENDEDOR', tipo_pessoa: 'PF' }
export const USUARIO_ADMIN = { id: 1, nome: 'Admin LudiStore', email: 'admin@ludistore.com', perfil: 'ADMIN' }
