import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { slug } from '../../utils/slug.js'
import s from './AdminPage.module.css'

const EMPTY_FORM = {
  titulo: '', data: '', descricao: '', preco: '', vagas: '',
  imagem: '', local: '', detalhes: '', inclusos: '', roteiro: '', galeria: '', esgotado: false,
}

function linhas(v) {
  return (v || '').split('\n').map(x => x.trim()).filter(Boolean)
}

function download(nome, conteudo) {
  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = nome
  a.click()
  URL.revokeObjectURL(a.href)
}

function LoginScreen({ onSuccess }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })
      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json().catch(() => ({}))
        setErro(data.erro || 'Senha incorreta. Tente de novo.')
        setSenha('')
      }
    } catch {
      setErro('Não foi possível conectar. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={s.loginPage}>
      <form className={s.loginCard} onSubmit={entrar}>
        <div className={s.brand}>
          <span className={s.brandV}>Viajas</span>
          <span className={s.brandC}>Comigo</span>
        </div>
        <p className={s.loginTitle}>Painel de viagens</p>
        <p className={s.loginSub}>Digite a senha para acessar.</p>

        <input
          className={s.input}
          type="password"
          value={senha}
          autoFocus
          onChange={e => { setSenha(e.target.value); setErro('') }}
          placeholder="Senha"
        />
        {erro && <p className={s.loginErro}>{erro}</p>}

        <button type="submit" className={s.btnSolid} style={{ width: '100%', marginTop: 18 }} disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <Link to="/" className={s.loginBack}>← Voltar ao site</Link>
      </form>
    </div>
  )
}

export default function AdminPage(props) {
  // null = ainda verificando a sessão no servidor
  const [authed, setAuthed] = useState(null)

  useEffect(() => {
    let ativo = true
    fetch('/api/me')
      .then(r => r.json())
      .then(d => { if (ativo) setAuthed(!!d.authed) })
      .catch(() => { if (ativo) setAuthed(false) })
    return () => { ativo = false }
  }, [])

  async function logout() {
    await fetch('/api/logout', { method: 'POST' }).catch(() => {})
    setAuthed(false)
  }

  if (authed === null) {
    return <div className={s.loginPage}><p className={s.loginSub}>Carregando…</p></div>
  }
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />
  return <AdminPanel {...props} onLogout={logout} />
}

function AdminPanel({ viagens, addViagem, updateViagem, deleteViagem, restaurar, onLogout }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editSlug, setEditSlug] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)
  const formRef = useRef(null)

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400)
  }, [])

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function salvar() {
    if (!form.titulo.trim()) { toast('Dê um título à viagem'); return }
    const obj = {
      titulo: form.titulo.trim(),
      data: form.data.trim(),
      descricao: form.descricao.trim(),
      preco: form.preco.trim(),
      vagas: form.vagas.trim(),
      imagem: form.imagem.trim() || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      local: form.local.trim(),
      detalhes: form.detalhes.trim(),
      inclusos: linhas(form.inclusos),
      roteiro: linhas(form.roteiro),
      galeria: linhas(form.galeria),
      esgotado: form.esgotado,
    }
    try {
      if (editSlug) {
        await updateViagem(editSlug, obj)
        toast('Viagem atualizada ✓')
      } else {
        await addViagem(obj)
        toast('Viagem adicionada ✓')
      }
      limpar()
    } catch (err) {
      toast(err.message || 'Erro ao salvar')
    }
  }

  function editar(viagem) {
    setForm({
      titulo: viagem.titulo || '',
      data: viagem.data || '',
      descricao: viagem.descricao || '',
      preco: viagem.preco || '',
      vagas: viagem.vagas || '',
      imagem: viagem.imagem || '',
      local: viagem.local || '',
      detalhes: viagem.detalhes || '',
      inclusos: (viagem.inclusos || []).join('\n'),
      roteiro: (viagem.roteiro || []).join('\n'),
      galeria: (viagem.galeria || []).join('\n'),
      esgotado: !!viagem.esgotado,
    })
    setEditSlug(slug(viagem.titulo))
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function remover(viagem) {
    if (!window.confirm(`Remover a viagem "${viagem.titulo}"?`)) return
    try {
      await deleteViagem(slug(viagem.titulo))
      toast('Viagem removida')
    } catch (err) {
      toast(err.message || 'Erro ao remover')
    }
  }

  function limpar() {
    setForm(EMPTY_FORM)
    setEditSlug(null)
  }

  async function handleRestaurar() {
    if (!window.confirm('Isso volta para as viagens de exemplo e apaga as suas alterações. Continuar?')) return
    try {
      await restaurar()
      toast('Exemplos restaurados')
    } catch (err) {
      toast(err.message || 'Erro ao restaurar')
    }
  }

  function baixarJSON() {
    download('viagens-backup.json', JSON.stringify(viagens, null, 2))
    toast('Backup baixado')
  }

  return (
    <div className={s.page}>
      <div className={s.topbar}>
        <div className={s.brand}>
          <span className={s.brandV}>Viajas</span>
          <span className={s.brandC}>Comigo</span>
          <span className={s.tag}>Painel de viagens</span>
        </div>
        <div className={s.topActions}>
          <Link to="/" className={s.viewLink}>Ver o site →</Link>
          <button className={s.viewLink} onClick={onLogout}>Sair</button>
        </div>
      </div>

      <div className={s.wrap}>
        <div className={s.intro}>
          <span className={s.introIcon} aria-hidden="true">👋</span>
          <div>
            <b>Bem-vindo(a) ao seu painel.</b> Aqui você cria, edita e remove as viagens que aparecem no site —
            sem precisar mexer em código nem chamar ninguém. É só preencher os campos do lado <b>esquerdo</b> e clicar
            em <b>Salvar</b>. As viagens já cadastradas ficam à <b>direita</b>.
          </div>
        </div>

        <div className={s.layout}>
          {/* FORM */}
          <div className={s.panel} ref={formRef}>
            <div className={s.panelHead}>
              <span className={`${s.panelBadge} ${editSlug ? s.panelBadgeEdit : ''}`} aria-hidden="true">
                {editSlug ? '✎' : '+'}
              </span>
              <div>
                <h2>{editSlug ? 'Editando uma viagem' : 'Criar uma nova viagem'}</h2>
                <p className={s.sub}>
                  {editSlug
                    ? 'Altere o que precisar e clique em Salvar lá embaixo.'
                    : 'Preencha de cima para baixo. Leva poucos minutos.'}
                </p>
              </div>
            </div>

            {/* PASSO 1 — Obrigatório */}
            <div className={s.section}>
              <div className={s.sectionHead}>
                <span className={s.stepNum}>1</span>
                <div>
                  <h3 className={s.sectionTitle}>Informações principais</h3>
                  <p className={s.sectionDesc}>
                    Esses campos são <b className={s.req}>obrigatórios</b> — são o mínimo para a viagem aparecer no site.
                  </p>
                </div>
              </div>

              <label className={s.formLabel}>Título da viagem <span className={s.tagReq}>obrigatório</span></label>
              <input className={s.input} value={form.titulo} onChange={e => setField('titulo', e.target.value)} placeholder="Ex: Praia & Sol — Nordeste" />

              <label className={s.formLabel}>Datas <span className={s.tagReq}>obrigatório</span></label>
              <input className={s.input} value={form.data} onChange={e => setField('data', e.target.value)} placeholder="Ex: 15 a 22 de Setembro" />

              <label className={s.formLabel}>Resumo curto <span className={s.tagReq}>obrigatório</span></label>
              <textarea className={s.textarea} value={form.descricao} onChange={e => setField('descricao', e.target.value)} placeholder="Uma frase chamativa sobre a viagem." />
              <p className={s.hint}>Aparece no cartão da viagem, na página inicial.</p>

              <div className={s.row}>
                <div>
                  <label className={s.formLabel}>Preço a partir de (R$) <span className={s.tagReq}>obrigatório</span></label>
                  <input className={s.input} value={form.preco} onChange={e => setField('preco', e.target.value)} placeholder="Ex: 2.490" />
                </div>
                <div>
                  <label className={s.formLabel}>Vagas <span className={s.tagReq}>obrigatório</span></label>
                  <input className={s.input} value={form.vagas} onChange={e => setField('vagas', e.target.value)} placeholder="Ex: 8 vagas" />
                </div>
              </div>

              <label className={s.formLabel}>Foto principal <span className={s.tagReq}>obrigatório</span></label>
              <input className={s.input} value={form.imagem} onChange={e => setField('imagem', e.target.value)} placeholder="Cole aqui o link (URL) de uma foto" />
              <p className={s.hint}>Copie o endereço de uma imagem da internet e cole aqui. É a foto de capa da viagem.</p>
            </div>

            {/* PASSO 2 — Opcional */}
            <div className={s.section}>
              <div className={s.sectionHead}>
                <span className={s.stepNum}>2</span>
                <div>
                  <h3 className={s.sectionTitle}>Detalhes da viagem</h3>
                  <p className={s.sectionDesc}>
                    Tudo aqui é <b className={s.opt}>opcional</b>. Quanto mais você preencher, <b>mais bonita e completa</b> fica a página da viagem.
                  </p>
                </div>
              </div>

              <label className={s.formLabel}>Localização (para o mapa)</label>
              <input className={s.input} value={form.local} onChange={e => setField('local', e.target.value)} placeholder="Ex: Maragogi, Alagoas, Brasil" />
              <p className={s.hint}>Cidade e estado já bastam.</p>

              <label className={s.formLabel}>Descrição completa</label>
              <textarea className={s.textarea} value={form.detalhes} onChange={e => setField('detalhes', e.target.value)} placeholder="Conte com calma como é a viagem..." />

              <label className={s.formLabel}>O que está incluso</label>
              <textarea className={s.textarea} value={form.inclusos} onChange={e => setField('inclusos', e.target.value)} placeholder={'Um item por linha:\nPassagem aérea\nHospedagem com café'} />
              <p className={s.hint}>Escreva <b>um item por linha</b> (aperte Enter para pular para o próximo).</p>

              <label className={s.formLabel}>Roteiro dia a dia</label>
              <textarea className={s.textarea} value={form.roteiro} onChange={e => setField('roteiro', e.target.value)} placeholder={'Um dia por linha:\nDia 1 — Chegada e check-in\nDia 2 — Passeio de barco'} />
              <p className={s.hint}>Um dia por linha. Use o travessão (—) entre o dia e o que acontece.</p>

              <label className={s.formLabel}>Galeria de fotos</label>
              <textarea className={s.textarea} value={form.galeria} onChange={e => setField('galeria', e.target.value)} placeholder="Cole um link (URL) de imagem por linha" />
              <p className={s.hint}>Um link de foto por linha.</p>

              <div className={s.checkRow}>
                <input type="checkbox" id="esgotado" checked={form.esgotado} onChange={e => setField('esgotado', e.target.checked)} />
                <label htmlFor="esgotado">Marcar esta viagem como <b>esgotada</b> (sem vagas)</label>
              </div>
            </div>

            <div className={s.saveBar}>
              <button className={s.btnSolid} onClick={salvar}>
                {editSlug ? '✓ Salvar alterações' : '✓ Salvar e publicar viagem'}
              </button>
              <button className={s.btnGhost} onClick={limpar}>
                {editSlug ? 'Cancelar edição' : 'Limpar campos'}
              </button>
            </div>
          </div>

          {/* LISTA */}
          <div className={s.panel}>
            <div className={s.panelHead}>
              <span className={`${s.panelBadge} ${s.panelBadgeList}`} aria-hidden="true">≡</span>
              <div>
                <h2>Viagens no site</h2>
                <p className={s.sub}>
                  {viagens.length === 0
                    ? 'Nenhuma viagem cadastrada ainda.'
                    : `${viagens.length} viagem${viagens.length > 1 ? 's' : ''} publicada${viagens.length > 1 ? 's' : ''} no momento.`}
                </p>
              </div>
            </div>

            <div className={s.list}>
              {viagens.length === 0 ? (
                <div className={s.empty}>
                  Nenhuma viagem ainda.<br />Crie a primeira preenchendo o formulário ao lado.
                </div>
              ) : (
                viagens.map(v => (
                  <div key={v.titulo} className={s.item}>
                    <div className={s.thumb} style={{ backgroundImage: `url('${v.imagem || ''}')` }} />
                    <div className={s.info}>
                      <h3>{v.titulo || '(sem título)'}</h3>
                      <span>{v.data || ''}{v.vagas ? ` · ${v.vagas}` : ''}{v.local ? ` · ${v.local}` : ''}</span>
                      <span className={s.price}>R$ {v.preco || '—'}</span>
                      <span className={`${s.pill} ${v.esgotado ? s.pillNo : s.pillOk}`}>
                        {v.esgotado ? 'Esgotado' : 'Vagas abertas'}
                      </span>
                    </div>
                    <div className={s.itemActions}>
                      <Link
                        to={`/viagem/${slug(v.titulo)}`}
                        target="_blank"
                        className={s.actbtn}
                        title="Abrir a página desta viagem no site"
                      ><span aria-hidden="true">↗</span> Ver</Link>
                      <button className={s.actbtn} title="Alterar os dados desta viagem" onClick={() => editar(v)}>
                        <span aria-hidden="true">✎</span> Editar
                      </button>
                      <button className={`${s.actbtn} ${s.actbtnDanger}`} title="Apagar esta viagem do site" onClick={() => remover(v)}>
                        <span aria-hidden="true">🗑</span> Remover
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={s.pubBox}>
              <b>✓ Tudo é publicado automaticamente.</b> Toda viagem que você salva, edita ou remove
              já fica no ar para todo mundo na hora — não precisa fazer mais nada.
            </div>

            <div className={s.tools}>
              <p className={s.toolsTitle}>Ferramentas extras</p>
              <div className={s.btns}>
                <button className={s.btnGhost} onClick={baixarJSON}>⤓ Baixar cópia de segurança</button>
                <button className={s.btnDanger} onClick={handleRestaurar}>Restaurar viagens de exemplo</button>
              </div>
              <p className={s.hint} style={{ marginTop: 10 }}>
                A <b>cópia de segurança</b> é opcional — guarda um arquivo com todas as viagens no seu computador.
                <br /><b>Restaurar exemplos</b> apaga tudo e volta às viagens de demonstração (cuidado!).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${s.toast}${toastVisible ? ' ' + s.visible : ''}`}>{toastMsg}</div>
    </div>
  )
}
