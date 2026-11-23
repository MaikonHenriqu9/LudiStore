import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Check, Image as ImageIcon, ChevronDown, X } from 'lucide-react'
import Selo from '../../components/Selo.jsx'
import CardProduto from '../../components/CardProduto.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import * as brinquedosService from '../../services/brinquedos.js'
import * as marcasService from '../../services/marcas.js'
import * as categoriasService from '../../services/categorias.js'
import * as usuariosService from '../../services/usuarios.js'

export default function ProdutoForm() {
  const { id } = useParams()
  const ehEdicao = !!id
  const navegar = useNavigate()
  const { usuario, ehAdmin } = useAuth()

  const [marcas, setMarcas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})

  const [form, setForm] = useState({
    nome: '',
    sku: '',
    marca_id: '',
    vendedor_id: '',
    categorias_ids: [],
    descricao: '',
    imagem_url: '',
    preco: '',
    estoque: 0,
    idade_minima: 0,
  })

  useEffect(() => {
    async function inicializar() {
      setCarregando(true)
      try {
        const [listaMarcas, listaCategorias] = await Promise.all([
          marcasService.listar().catch(() => []),
          categoriasService.listar().catch(() => [])
        ])
        setMarcas(listaMarcas)
        setCategorias(listaCategorias)

        if (ehAdmin) {
          const listaUsuarios = await usuariosService.listar().catch(() => [])
          const apenasVendedores = listaUsuarios.filter((u) => u.perfil === 'VENDEDOR' || u.perfil === 'ADMIN')
          setVendedores(apenasVendedores)
        }

        if (ehEdicao) {
          const dados = await brinquedosService.buscar(id)
          setForm({
            nome: dados.nome || '',
            sku: dados.sku || '',
            marca_id: dados.marca_id || (listaMarcas.find((m) => m.nome === dados.marca)?.id) || '',
            vendedor_id: dados.vendedor_id || '',
            categorias_ids: Array.isArray(dados.categorias_ids)
              ? dados.categorias_ids
              : (dados.categorias || []).map((c) => (typeof c === 'object' ? c.id : listaCategorias.find((cat) => cat.nome === c)?.id)).filter(Boolean),
            descricao: dados.descricao || '',
            imagem_url: dados.imagem_url || '',
            preco: dados.preco || '',
            estoque: dados.estoque ?? 0,
            idade_minima: dados.idade_minima ?? 0,
          })
        }
      } catch {
        setErro('Não foi possível carregar os dados do formulário.')
      } finally {
        setCarregando(false)
      }
    }
    inicializar()
  }, [id, ehEdicao, ehAdmin])

  function atualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    if (errosCampos[campo]) {
      setErrosCampos((e) => ({ ...e, [campo]: null }))
    }
  }

  function alternarCategoria(catId) {
    const idNum = Number(catId)
    setForm((f) => {
      const existe = f.categorias_ids.includes(idNum)
      const novo = existe ? f.categorias_ids.filter((i) => i !== idNum) : [...f.categorias_ids, idNum]
      return { ...f, categorias_ids: novo }
    })
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setErrosCampos({})

    const erros = {}
    if (!form.nome.trim()) erros.nome = 'Nome do produto é obrigatório.'
    if (!form.sku.trim()) erros.sku = 'SKU é obrigatório.'
    if (!form.marca_id) erros.marca_id = 'Selecione uma marca.'
    if (form.categorias_ids.length === 0) erros.categorias_ids = 'Selecione ao menos uma categoria.'
    if (Number(form.preco) <= 0 || isNaN(Number(form.preco))) erros.preco = 'O preço deve ser maior que zero.'
    if (Number(form.estoque) < 0 || isNaN(Number(form.estoque))) erros.estoque = 'Estoque inválido.'

    if (Object.keys(erros).length > 0) {
      setErrosCampos(erros)
      return
    }

    setSalvando(true)
    try {
      const corpo = {
        nome: form.nome.trim(),
        sku: form.sku.trim(),
        marca_id: Number(form.marca_id),
        categorias_ids: form.categorias_ids,
        descricao: form.descricao.trim(),
        imagem_url: form.imagem_url.trim(),
        preco: Number(form.preco).toFixed(2),
        estoque: Number(form.estoque),
        idade_minima: Number(form.idade_minima || 0),
      }
      if (ehAdmin && form.vendedor_id) {
        corpo.vendedor_id = Number(form.vendedor_id)
      }

      if (ehEdicao) {
        await brinquedosService.atualizar(id, corpo)
      } else {
        await brinquedosService.criar(corpo)
      }

      const destinoVolta = ehAdmin ? '/admin/produtos' : '/vendedor/produtos'
      navegar(destinoVolta)
    } catch (err) {
      if (err.campos) {
        setErrosCampos(err.campos)
      }
      setErro(err.message || 'Erro ao salvar o produto.')
    } finally {
      setSalvando(false)
    }
  }

  const marcaSelecionada = marcas.find((m) => String(m.id) === String(form.marca_id))?.nome || 'Marca'
  const produtoPreview = {
    id: 0,
    nome: form.nome || 'Nome do produto',
    preco: form.preco || '0.00',
    estoque: Number(form.estoque || 0),
    idade_minima: Number(form.idade_minima || 0),
    marca: marcaSelecionada,
    vendedor: usuario?.nome || 'Vendedor',
    imagem_url: form.imagem_url || '/img/blocos.jpg',
    ativo: true,
  }

  const destinoVolta = ehAdmin ? '/admin/produtos' : '/vendedor/produtos'

  return (
    <div className="painel__corpo">
      <div className="migalhas" style={{ padding: 0 }}>
        <Link to={destinoVolta}>{ehAdmin ? 'Produtos (Admin)' : 'Meus produtos'}</Link>
        <ChevronRight size={14} />
        <b>{ehEdicao ? 'Editar produto' : 'Novo produto'}</b>
      </div>

      <form onSubmit={salvar} noValidate>
        <div className="painel__titulo">
          <div>
            <h1 className="t-h1">{ehEdicao ? 'Editar produto' : 'Novo produto'}</h1>
            <p>Campos com * são obrigatórios. Marca e categorias são cadastradas pelo admin.</p>
          </div>
          <div className="linha">
            <Link to={destinoVolta} className="btn btn--contorno">Cancelar</Link>
            <button type="submit" className="btn btn--primario" disabled={salvando || carregando}>
              <Check size={16} /> {salvando ? 'Salvando…' : 'Salvar produto'}
            </button>
          </div>
        </div>

        {erro && <div className="aviso c-rosa" style={{ marginBottom: 16 }}>{erro}</div>}

        <div className="duas-colunas">
          <div className="coluna" style={{ gap: 20 }}>
            <div className="caixa">
              <h3 className="t-h3" style={{ marginBottom: 16 }}>Informações básicas</h3>
              <div className="form-grade">
                <div className={`campo inteiro ${errosCampos.nome ? 'campo--erro' : ''}`}>
                  <label>Nome do produto *</label>
                  <div className="campo__caixa">
                    <input
                      value={form.nome}
                      onChange={(e) => atualizarCampo('nome', e.target.value)}
                      placeholder="Ex: Kit Blocos de Montar 120 peças"
                    />
                  </div>
                  {errosCampos.nome && <span className="campo__ajuda">{errosCampos.nome}</span>}
                </div>

                <div className={`campo ${errosCampos.sku ? 'campo--erro' : ''}`}>
                  <label>SKU *</label>
                  <div className="campo__caixa">
                    <input
                      value={form.sku}
                      onChange={(e) => atualizarCampo('sku', e.target.value)}
                      placeholder="Ex: BRM-BLC-120"
                    />
                  </div>
                  <span className="campo__ajuda">{errosCampos.sku || 'Código único do produto'}</span>
                </div>

                <div className={`campo ${errosCampos.marca_id ? 'campo--erro' : ''}`}>
                  <label>Marca *</label>
                  <div className="campo__caixa">
                    <select
                      value={form.marca_id}
                      onChange={(e) => atualizarCampo('marca_id', e.target.value)}
                    >
                      <option value="">Selecione uma marca</option>
                      {marcas.map((m) => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                  {errosCampos.marca_id && <span className="campo__ajuda">{errosCampos.marca_id}</span>}
                </div>

                {ehAdmin && (
                  <div className="campo inteiro so-admin-nota">
                    <label>
                      Vendedor <Selo cor="amarelo">só admin</Selo>
                    </label>
                    <div className="campo__caixa">
                      <select
                        value={form.vendedor_id}
                        onChange={(e) => atualizarCampo('vendedor_id', e.target.value)}
                      >
                        <option value="">Deixar com o vendedor original ou você</option>
                        {vendedores.map((v) => (
                          <option key={v.id} value={v.id}>{v.nome} ({v.email})</option>
                        ))}
                      </select>
                      <ChevronDown size={16} />
                    </div>
                    <span className="campo__ajuda">Para o vendedor, o produto fica vinculado automaticamente ao usuário logado.</span>
                  </div>
                )}

                <div className={`campo inteiro ${errosCampos.categorias_ids ? 'campo--erro' : ''}`}>
                  <label>Categorias * <span className="c-fraco">(ao menos uma)</span></label>
                  <div className="chips-cat" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {categorias.map((c) => {
                      const ativa = form.categorias_ids.includes(c.id)
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => alternarCategoria(c.id)}
                          className={`btn btn--p ${ativa ? 'btn--destaque' : 'btn--contorno'}`}
                          style={{ borderRadius: 20 }}
                        >
                          {c.nome} {ativa && <X size={14} style={{ marginLeft: 4 }} />}
                        </button>
                      )
                    })}
                  </div>
                  {errosCampos.categorias_ids && <span className="campo__ajuda">{errosCampos.categorias_ids}</span>}
                </div>

                <div className="campo inteiro">
                  <label>Descrição</label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => atualizarCampo('descricao', e.target.value)}
                    rows={4}
                    placeholder="Descrição detalhada do brinquedo..."
                  />
                </div>
              </div>
            </div>

            <div className="caixa">
              <h3 className="t-h3" style={{ marginBottom: 6 }}>Imagem do produto</h3>
              <p className="t-pequeno c-suave" style={{ marginBottom: 14 }}>
                Cada brinquedo tem uma imagem. Cole o link (URL) de uma foto já hospedada ou utilize as imagens padrão em /img/.
              </p>
              <div className="linha" style={{ gap: 16, alignItems: 'flex-start' }}>
                <div className="miniaturas" style={{ gridTemplateColumns: '1fr', width: 140, margin: 0, flex: 'none' }}>
                  <div className="capa">
                    <img src={form.imagem_url || '/img/blocos.jpg'} alt="Prévia" onError={(e) => { e.target.src = '/img/blocos.jpg' }} />
                  </div>
                </div>
                <div className="campo cresce">
                  <label>URL da imagem</label>
                  <div className="campo__caixa">
                    <ImageIcon size={16} />
                    <input
                      value={form.imagem_url}
                      onChange={(e) => atualizarCampo('imagem_url', e.target.value)}
                      placeholder="Ex: /img/blocos.jpg ou https://..."
                    />
                  </div>
                  <span className="campo__ajuda">Opcional. Sem imagem, o card mostra a imagem padrão.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="coluna" style={{ gap: 20 }}>
            <div className="caixa">
              <h3 className="t-h3" style={{ marginBottom: 16 }}>Preço e estoque</h3>
              <div className="coluna" style={{ gap: 14 }}>
                <div className={`campo ${errosCampos.preco ? 'campo--erro' : ''}`}>
                  <label>Preço *</label>
                  <div className="campo__caixa">
                    <b className="c-fraco">R$</b>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.preco}
                      onChange={(e) => atualizarCampo('preco', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <span className="campo__ajuda">{errosCampos.preco || 'O preço deve ser maior que zero.'}</span>
                </div>

                <div className={`campo ${errosCampos.estoque ? 'campo--erro' : ''}`}>
                  <label>Estoque *</label>
                  <div className="campo__caixa">
                    <input
                      type="number"
                      min="0"
                      value={form.estoque}
                      onChange={(e) => atualizarCampo('estoque', e.target.value)}
                    />
                    <span className="t-pequeno">unidades</span>
                  </div>
                  {errosCampos.estoque && <span className="campo__ajuda">{errosCampos.estoque}</span>}
                </div>

                <div className="campo">
                  <label>Idade mínima</label>
                  <div className="campo__caixa">
                    <input
                      type="number"
                      min="0"
                      value={form.idade_minima}
                      onChange={(e) => atualizarCampo('idade_minima', e.target.value)}
                    />
                    <span className="t-pequeno">anos</span>
                  </div>
                  <span className="campo__ajuda">0 para todas as idades/bebês.</span>
                </div>
              </div>
            </div>

            <div className="caixa">
              <h3 className="t-h3" style={{ marginBottom: 8 }}>Status</h3>
              <div className="linha" style={{ gap: 8 }}>
                <Selo cor="verde">Ativo</Selo>
                <span className="t-pequeno c-suave">
                  Todo produto nasce ativo. Para tirar do catálogo, use “Desativar” na listagem.
                </span>
              </div>
            </div>

            <div className="caixa">
              <h3 className="t-h3" style={{ marginBottom: 12 }}>Pré-visualização</h3>
              <div style={{ maxWidth: 260 }}>
                <CardProduto brinquedo={produtoPreview} semBotao />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
