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
          Aqui você adiciona, edita e remove as viagens que aparecem no site — <b>sem precisar mexer em código nem chamar ninguém</b>.
          Quanto mais campos você preencher (roteiro, o que está incluso, fotos e localização), <b>mais completa fica a página de detalhes</b>.
        </div>

        <div className={s.layout}>
          {/* FORM */}
          <div className={s.panel} ref={formRef}>
            <h2>{editSlug ? 'Editando viagem' : 'Nova viagem'}</h2>
            <p className={s.sub}>Os campos marcados com ✶ são os essenciais.</p>

            <label className={s.formLabel}>✶ Título da viagem</label>
            <input className={s.input} value={form.titulo} onChange={e => setField('titulo', e.target.value)} placeholder="Ex: Praia & Sol — Nordeste" />

            <label className={s.formLabel}>✶ Datas</label>
            <input className={s.input} value={form.data} onChange={e => setField('data', e.target.value)} placeholder="Ex: 15 a 22 de Setembro" />

            <label className={s.formLabel}>✶ Resumo curto (aparece no cartão)</label>
            <textarea className={s.textarea} value={form.descricao} onChange={e => setField('descricao', e.target.value)} placeholder="Uma frase chamativa sobre a viagem." />

            <div className={s.row}>
              <div>
                <label className={s.formLabel}>✶ Preço (a partir de R$)</label>
                <input className={s.input} value={form.preco} onChange={e => setField('preco', e.target.value)} placeholder="Ex: 2.490" />
              </div>
              <div>
                <label className={s.formLabel}>✶ Vagas</label>
                <input className={s.input} value={form.vagas} onChange={e => setField('vagas', e.target.value)} placeholder="Ex: 8 vagas" />
              </div>
            </div>

            <label className={s.formLabel}>✶ Foto principal (URL)</label>
            <input className={s.input} value={form.imagem} onChange={e => setField('imagem', e.target.value)} placeholder="https://...jpg" />

            <label className={s.formLabel}>Localização (para o mapa)</label>
            <input className={s.input} value={form.local} onChange={e => setField('local', e.target.value)} placeholder="Ex: Maragogi, Alagoas, Brasil" />
            <p className={s.hint}>Cidade e estado já bastam.</p>

            <label className={s.formLabel}>Descrição completa</label>
            <textarea className={s.textarea} value={form.detalhes} onChange={e => setField('detalhes', e.target.value)} placeholder="Conte com calma como é a viagem..." />

            <label className={s.formLabel}>O que está incluso</label>
            <textarea className={s.textarea} value={form.inclusos} onChange={e => setField('inclusos', e.target.value)} placeholder={'Um item por linha:\nPassagem aérea\nHospedagem com café'} />
            <p className={s.hint}>Um item por linha.</p>

            <label className={s.formLabel}>Roteiro dia a dia</label>
            <textarea className={s.textarea} value={form.roteiro} onChange={e => setField('roteiro', e.target.value)} placeholder={'Um dia por linha:\nDia 1 — Chegada e check-in\nDia 2 — Passeio de barco'} />
            <p className={s.hint}>Um dia por linha. Use o travessão (—) entre o dia e o que acontece.</p>

            <label className={s.formLabel}>Galeria de fotos (URLs)</label>
            <textarea className={s.textarea} value={form.galeria} onChange={e => setField('galeria', e.target.value)} placeholder="Uma URL de imagem por linha" />
            <p className={s.hint}>Uma URL por linha.</p>

            <div className={s.checkRow}>
              <input type="checkbox" id="esgotado" checked={form.esgotado} onChange={e => setField('esgotado', e.target.checked)} />
              <label htmlFor="esgotado">Marcar como esgotado</label>
            </div>

            <div className={s.btns}>
              <button className={s.btnSolid} onClick={salvar}>Salvar viagem</button>
              <button className={s.btnGhost} onClick={limpar}>Limpar</button>
            </div>
          </div>

          {/* LISTA */}
          <div className={s.panel}>
            <h2>Viagens publicadas</h2>
            <p className={s.sub}>{viagens.length} viagem(ns) cadastrada(s)</p>

            <div className={s.list}>
              {viagens.length === 0 ? (
                <div className={s.empty}>Nenhuma viagem ainda. Adicione a primeira ao lado.</div>
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
                        className={s.icbtn}
                        title="Ver no site"
                      >↗</Link>
                      <button className={s.icbtn} title="Editar" onClick={() => editar(v)}>✎</button>
                      <button className={s.icbtn} title="Remover" onClick={() => remover(v)}>🗑</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={s.btns} style={{ marginTop: 24 }}>
              <button className={s.btnGhost} onClick={baixarJSON}>⤓ Backup JSON</button>
              <button className={s.btnDanger} onClick={handleRestaurar}>Restaurar exemplos</button>
            </div>

            <div className={s.pubBox}>
              <b>Publicação automática:</b> toda viagem que você salva, edita ou remove
              já fica no ar para todo mundo na hora — não precisa baixar nem subir arquivo.<br />
              O <b>Backup JSON</b> é opcional, só para você guardar uma cópia de segurança.
            </div>
          </div>
        </div>
      </div>

      <div className={`${s.toast}${toastVisible ? ' ' + s.visible : ''}`}>{toastMsg}</div>
    </div>
  )
}
