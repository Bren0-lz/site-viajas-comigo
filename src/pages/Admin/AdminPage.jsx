import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import s from './AdminPage.module.css'
import c from '../../components/TripCard/TripCard.module.css'
import g from '../Home/HomePage.module.css'
import t from '../TripDetail/TripDetailPage.module.css'

const NOVA_VIAGEM = {
  titulo: 'Nova viagem',
  data: '',
  descricao: '',
  preco: '',
  vagas: '',
  imagem: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
  local: '',
  detalhes: '',
  inclusos: [],
  roteiro: [],
  galeria: [],
  esgotado: false,
}

function linhas(v) {
  return (v || '').split('\n').map(x => x.trim()).filter(Boolean)
}

/* ───────────────────────── LOGIN ───────────────────────── */

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

/* ─────────────── EDIÇÃO INLINE (lápis por campo) ─────────────── */

// Campo de texto curto/longo: mostra o valor + lápis; ao clicar vira input.
function EditText({ v, set, ph, area }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <span className={area ? s.editingBlock : s.editing}>
        {area ? (
          <textarea
            autoFocus
            className={s.inlineArea}
            value={v}
            placeholder={ph}
            onChange={e => set(e.target.value)}
          />
        ) : (
          <input
            autoFocus
            className={s.inlineInput}
            value={v}
            placeholder={ph}
            onChange={e => set(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setEditing(false) }}
          />
        )}
        <button
          type="button"
          className={`${s.pencil} ${s.pencilOk}`}
          onMouseDown={e => e.preventDefault()}
          onClick={() => setEditing(false)}
          title="Pronto"
        >✓</button>
      </span>
    )
  }

  return (
    <span className={s.editable}>
      {v ? <span>{v}</span> : <span className={s.ph}>{ph}</span>}
      <button type="button" className={s.pencil} onClick={() => setEditing(true)} title="Editar este campo">✎</button>
    </span>
  )
}

// Campo de lista (um item por linha): mostra a lista renderizada + lápis;
// ao editar, abre um campo de texto com um item por linha.
function EditList({ value, onChange, ph, children }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  if (editing) {
    return (
      <div className={s.listEdit}>
        <textarea
          autoFocus
          className={s.inlineArea}
          value={text}
          placeholder={ph}
          onChange={e => setText(e.target.value)}
        />
        <div className={s.listEditActions}>
          <button
            type="button"
            className={`${s.pencil} ${s.pencilOk}`}
            onClick={() => { onChange(linhas(text)); setEditing(false) }}
          >✓ Pronto</button>
        </div>
      </div>
    )
  }

  return (
    <div className={s.listView}>
      {children}
      <button
        type="button"
        className={`${s.pencil} ${s.pencilFloat}`}
        onClick={() => { setText((value || []).join('\n')); setEditing(true) }}
        title="Editar esta lista"
      >✎ Editar</button>
    </div>
  )
}

/* ─────────────── EDITOR (cara da página de detalhes) ─────────────── */

function Editor({ trip, upd }) {
  return (
    <div className="pageFade">
      <section className={t.hero} style={{ backgroundImage: `url('${trip.imagem}')` }}>
        <div className={s.heroEditWrap}>
          Foto de capa:&nbsp;
          <EditText v={trip.imagem} set={x => upd('imagem', x)} ph="Cole o link (URL) da foto" />
        </div>

        <div className={`wrap ${t.heroContent}`}>
          <button
            type="button"
            className={`${t.badge}${trip.esgotado ? ' ' + t.esgotado : ''} ${s.badgeBtn}`}
            onClick={() => upd('esgotado', !trip.esgotado)}
            title="Alternar entre Vagas abertas e Esgotado"
          >
            {trip.esgotado ? 'Esgotado' : 'Vagas abertas'} ✎
          </button>
          <h1><EditText v={trip.titulo} set={x => upd('titulo', x)} ph="Título da viagem" /></h1>
          <div className={t.meta}>
            <EditText v={trip.data} set={x => upd('data', x)} ph="Datas" />
            {' · '}
            <EditText v={trip.local} set={x => upd('local', x)} ph="Local" />
          </div>
        </div>
      </section>

      <div className={t.layout}>
        <div className={t.main}>
          <p className={t.lead}>
            <EditText v={trip.detalhes} set={x => upd('detalhes', x)} ph="Descrição completa da viagem…" area />
          </p>

          <div className={t.block}>
            <h2><span className={t.dot} />Fotos da viagem</h2>
            <EditList value={trip.galeria} onChange={x => upd('galeria', x)} ph="Cole um link (URL) de foto por linha">
              {trip.galeria?.length ? (
                <div className={t.galeria}>
                  {trip.galeria.map((img, i) => (
                    <div key={img} className={`${t.gItem}${i === 0 ? ' ' + t.feat : ''}`}>
                      <img src={img} alt={trip.titulo} loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
              ) : <p className={s.ph}>Nenhuma foto ainda.</p>}
            </EditList>
          </div>

          <div className={t.pair}>
            <div className={t.block}>
              <h2><span className={t.dot} />O que está incluso</h2>
              <EditList value={trip.inclusos} onChange={x => upd('inclusos', x)} ph="Um item por linha">
                {trip.inclusos?.length ? (
                  <ul className={t.inclusos}>
                    {trip.inclusos.map(item => (
                      <li key={item}><span className={t.ck}>✓</span><span>{item}</span></li>
                    ))}
                  </ul>
                ) : <p className={s.ph}>Nada cadastrado ainda.</p>}
              </EditList>
            </div>

            <div className={t.block}>
              <h2><span className={t.dot} />Roteiro dia a dia</h2>
              <EditList value={trip.roteiro} onChange={x => upd('roteiro', x)} ph="Um dia por linha. Ex: Dia 1 — Chegada">
                {trip.roteiro?.length ? (
                  <ul className={t.roteiro}>
                    {trip.roteiro.map(linha => {
                      const partes = linha.split('—')
                      return (
                        <li key={linha}>
                          {partes.length > 1
                            ? <><b>{partes[0].trim()}</b> — {partes.slice(1).join('—').trim()}</>
                            : linha}
                        </li>
                      )
                    })}
                  </ul>
                ) : <p className={s.ph}>Nada cadastrado ainda.</p>}
              </EditList>
            </div>
          </div>

          <div className={t.block}>
            <h2><span className={t.dot} />Onde fica</h2>
            <p className={t.loc}>📍 <EditText v={trip.local} set={x => upd('local', x)} ph="Cidade e estado" /></p>
            {trip.local && (
              <iframe
                title={`Mapa de ${trip.local}`}
                className={t.mapFrame}
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(trip.local)}&output=embed`}
              />
            )}
          </div>
        </div>

        <aside className={t.side}>
          <div className={t.cardPrice}>
            <small>A partir de</small>
            <div className={t.val}>R$ <EditText v={trip.preco} set={x => upd('preco', x)} ph="0.000" /></div>
            <div className={t.per}>por pessoa</div>
            <ul className={t.facts}>
              <li><span>Datas</span><b><EditText v={trip.data} set={x => upd('data', x)} ph="A definir" /></b></li>
              <li><span>Vagas</span><b><EditText v={trip.vagas} set={x => upd('vagas', x)} ph="Consultar" /></b></li>
              <li><span>Destino</span><b><EditText v={trip.local} set={x => upd('local', x)} ph="—" /></b></li>
            </ul>

            <div className={s.summaryBox}>
              <small>Resumo no cartão (página inicial)</small>
              <EditText v={trip.descricao} set={x => upd('descricao', x)} ph="Uma frase chamativa sobre a viagem." area />
            </div>

            <span className={s.fakeWa}>Tenho interesse (WhatsApp)</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ─────────────── PAINEL PRINCIPAL ─────────────── */

function AdminPanel({ viagens, salvarTudo, onLogout }) {
  const [draft, setDraft] = useState(viagens)
  const [dirty, setDirty] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)

  // Enquanto não houver alterações pendentes, mantém o rascunho sincronizado
  // com o que veio do servidor.
  useEffect(() => {
    if (!dirty) setDraft(viagens)
  }, [viagens, dirty])

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800)
  }, [])

  function upd(key, val) {
    setDraft(d => d.map((v, i) => (i === editIndex ? { ...v, [key]: val } : v)))
    setDirty(true)
  }

  function remover(i, e) {
    e?.stopPropagation()
    const alvo = draft[i]
    if (!window.confirm(`Excluir a viagem "${alvo?.titulo || ''}"?\n\nLembre de clicar em "Salvar alterações" depois para confirmar.`)) return
    setDraft(d => d.filter((_, j) => j !== i))
    setDirty(true)
    toast('Viagem removida — clique em Salvar alterações para confirmar')
  }

  function nova() {
    setDraft(d => [{ ...NOVA_VIAGEM }, ...d])
    setDirty(true)
    setEditIndex(0)
  }

  async function salvar() {
    setSaving(true)
    try {
      await salvarTudo(draft)
      setDirty(false)
      toast('Alterações salvas e publicadas ✓')
    } catch (err) {
      toast(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const trip = editIndex !== null ? draft[editIndex] : null

  return (
    <div className={s.page}>
      <div className={s.topbar}>
        <div className={s.brand}>
          <span className={s.brandV}>Viajas</span>
          <span className={s.brandC}>Comigo</span>
          <span className={s.tag}>Painel de viagens</span>
        </div>
        <div className={s.topActions}>
          {trip && (
            <button type="button" className={s.viewLink} onClick={() => setEditIndex(null)}>← Voltar aos cards</button>
          )}
          <Link to="/" className={s.viewLink} target="_blank">Ver o site →</Link>
          <button type="button" className={s.saveTop} onClick={salvar} disabled={!dirty || saving}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
            {dirty && !saving && <span className={s.dirtyDot} aria-hidden="true" />}
          </button>
          <button type="button" className={s.viewLink} onClick={onLogout}>Sair</button>
        </div>
      </div>

      {trip ? (
        <Editor trip={trip} upd={upd} />
      ) : (
        <div className={s.cardsWrap}>
          <div className={s.cardsBar}>
            <div>
              <h2>Próximas viagens</h2>
              <p>Clique em uma viagem para editá-la, ou use a lixeira para excluir. As mudanças só vão para o ar quando você clicar em <b>Salvar alterações</b>.</p>
            </div>
            <button type="button" className={s.btnSolid} onClick={nova}>+ Nova viagem</button>
          </div>

          <div className={g.grid}>
            {draft.map((v, i) => (
              <div key={i} className={s.cardWrap}>
                <button
                  type="button"
                  className={s.trash}
                  title="Excluir esta viagem"
                  onClick={e => remover(i, e)}
                >🗑</button>
                <div className={c.card} onClick={() => setEditIndex(i)} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') setEditIndex(i) }}>
                  <div className={c.img}>
                    <div className={c.imgBg} style={{ backgroundImage: `url('${v.imagem}')` }} />
                    <span className={`${c.badge}${v.esgotado ? ' ' + c.esgotado : ''}`}>
                      {v.esgotado ? 'Esgotado' : 'Vagas abertas'}
                    </span>
                  </div>
                  <div className={c.body}>
                    <h3>{v.titulo || '(sem título)'}</h3>
                    <div className={c.date}>{v.data}</div>
                    <p className={c.desc}>{v.descricao}</p>
                    <div className={c.foot}>
                      <div className={c.price}>
                        <small>A partir de</small>
                        <b>R$ {v.preco || '—'}</b>
                        <div className={c.vagas}>{v.vagas}</div>
                      </div>
                      <span className={c.btn}>Editar ✎</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className={s.addCard} onClick={nova} role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') nova() }}>
              <div className={s.addInner}>
                <span className={s.addPlus}>+</span>
                <span>Adicionar nova viagem</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${s.toast}${toastVisible ? ' ' + s.visible : ''}`}>{toastMsg}</div>
    </div>
  )
}
