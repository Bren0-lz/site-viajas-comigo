import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import s from './AdminPage.module.css'
import t from '../TripDetail/TripDetailPage.module.css'
import { statusMeta, vagasLabel } from '../../utils/viagemMeta.js'
import { slug } from '../../utils/slug.js'
import ImageUpload from '../../components/ImageUpload/ImageUpload.jsx'

const NOVA_VIAGEM = {
  titulo: 'Nova viagem',
  data: '',
  descricao: '',
  preco: '',
  vagas: '',
  imagem: '',
  local: '',
  detalhes: '',
  inclusos: [],
  roteiro: [],
  galeria: [],
  esgotado: false,
  destaque: false,
  capaPosX: 50,
  capaPosY: 50,
  capaZoom: 1,
}

/* Marca de identidade do painel (mesmo lockup do site público). */
function Brand({ as: As = 'div', className, ...rest }) {
  return (
    <As className={className} {...rest}>
      <img src="/logo-emblem.webp" alt="" className={s.brandEmblem} width="220" height="194" decoding="async" />
      <span className={s.brandWord}>
        <span className={s.brandName}>Viajas<span className="gradText">comigo</span></span>
        <span className={s.brandTag}>Painel administrativo</span>
      </span>
    </As>
  )
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
        <Brand className={s.loginBrand} />
        <p className={s.loginSub}>Digite a senha para acessar o painel.</p>

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

function Editor({ trip, upd, onError }) {
  const st = statusMeta(trip)
  return (
    <div className="pageFade">
      <div className={t.heroWrap}>
        <button
          type="button"
          className={`${t.status} ${s.badgeBtn}`}
          style={{ background: st.bg, color: st.color }}
          onClick={() => upd('esgotado', !trip.esgotado)}
          title="Alternar entre Vagas abertas e Esgotado"
        >
          <span className={t.dot} style={{ background: st.dot }} />
          {trip.esgotado ? 'Esgotado' : 'Vagas abertas'} ✎
        </button>
        <section
          className={t.hero}
          style={{
            backgroundImage: trip.imagem ? `url('${trip.imagem}')` : undefined,
            backgroundPosition: `${trip.capaPosX ?? 50}% ${trip.capaPosY ?? 50}%`,
            backgroundSize: `${100 * (trip.capaZoom || 1)}%`,
          }}
        >
          <div className={t.heroScrim} />

          <div className={s.heroEditWrap}>
            <div className={s.heroEditRow}>
              Foto de capa:&nbsp;
              <ImageUpload
                label={trip.imagem ? 'Trocar foto de capa' : 'Enviar foto de capa'}
                onUploaded={url => upd('imagem', url)}
                onError={onError}
              />
            </div>
          </div>

          <div className={t.heroContent}>
            <h1><EditText v={trip.titulo} set={x => upd('titulo', x)} ph="Título da viagem" /></h1>
            <div className={t.meta}>
              <span><EditText v={trip.data} set={x => upd('data', x)} ph="Datas" /></span>
              <span><EditText v={trip.local} set={x => upd('local', x)} ph="Local" /></span>
            </div>
          </div>
        </section>
      </div>

      {trip.imagem && (
        <div className={s.capaBar}>
          <span className={s.capaBarTitle}>Ajustar capa</span>
          <div className={s.capaCtrls}>
            <label className={s.capaCtrl}>
              <span>Horizontal</span>
              <input type="range" min="0" max="100" value={trip.capaPosX ?? 50}
                onChange={e => upd('capaPosX', Number(e.target.value))} />
            </label>
            <label className={s.capaCtrl}>
              <span>Vertical</span>
              <input type="range" min="0" max="100" value={trip.capaPosY ?? 50}
                onChange={e => upd('capaPosY', Number(e.target.value))} />
            </label>
            <label className={s.capaCtrl}>
              <span>Zoom</span>
              <input type="range" min="1" max="2" step="0.05" value={trip.capaZoom || 1}
                onChange={e => upd('capaZoom', Number(e.target.value))} />
            </label>
            <button
              type="button"
              className={s.capaReset}
              onClick={() => { upd('capaPosX', 50); upd('capaPosY', 50); upd('capaZoom', 1) }}
              title="Voltar ao enquadramento padrão"
            >Resetar</button>
          </div>
        </div>
      )}

      <div className={t.layout}>
        <div className={t.main}>
          <div className={t.block}>
            <h2>Sobre a viagem</h2>
            <p className={t.lead}>
              <EditText v={trip.detalhes} set={x => upd('detalhes', x)} ph="Descrição completa da viagem…" area />
            </p>
          </div>

          <div className={t.block}>
            <h2>O que está incluído</h2>
            <EditList value={trip.inclusos} onChange={x => upd('inclusos', x)} ph="Um item por linha">
              {trip.inclusos?.length ? (
                <ul className={s.edList}>
                  {trip.inclusos.map(item => (
                    <li key={item}><span className={s.edCk}>✓</span><span>{item}</span></li>
                  ))}
                </ul>
              ) : <p className={s.ph}>Nada cadastrado ainda.</p>}
            </EditList>
          </div>

          <div className={t.block}>
            <h2>Programação dia a dia</h2>
            <EditList value={trip.roteiro} onChange={x => upd('roteiro', x)} ph="Um dia por linha. Ex: Dia 1 — Chegada">
              {trip.roteiro?.length ? (
                <ul className={s.edList}>
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

          <div className={t.block}>
            <h2>Fotos da viagem</h2>
            <div className={s.galeriaUpload}>
              <ImageUpload
                multiple
                label="Adicionar fotos"
                onUploaded={url => upd('galeria', [...(trip.galeria || []), url])}
                onError={onError}
              />
            </div>
            {trip.galeria?.length ? (
              <div className={t.galeria}>
                {trip.galeria.map((img, i) => (
                  <div key={img} className={`${t.gItem} ${s.gItemEdit}`}>
                    <img src={img} alt={trip.titulo} loading="lazy" decoding="async" />
                    <button
                      type="button"
                      className={s.gRemove}
                      title="Remover esta foto"
                      onClick={() => upd('galeria', trip.galeria.filter((_, j) => j !== i))}
                    >×</button>
                  </div>
                ))}
              </div>
            ) : <p className={s.ph}>Nenhuma foto ainda.</p>}
          </div>

          <div className={t.block}>
            <h2>Onde fica</h2>
            <p className={t.loc}><i className="ph ph-map-pin" /><EditText v={trip.local} set={x => upd('local', x)} ph="Cidade e estado" /></p>
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
            <span className={t.priceLbl}>a partir de</span>
            <div className={t.priceVal}>R$ <EditText v={trip.preco} set={x => upd('preco', x)} ph="0.000" /></div>
            <div className={t.priceNote}>por pessoa · parcelamos em até 12x</div>
            <div className={t.divider} />
            <ul className={t.facts}>
              <li><span><i className="ph ph-calendar-blank" />Datas</span><b><EditText v={trip.data} set={x => upd('data', x)} ph="A definir" /></b></li>
              <li><span><i className="ph ph-map-pin" />Local</span><b><EditText v={trip.local} set={x => upd('local', x)} ph="—" /></b></li>
              <li><span><i className="ph ph-users-three" />Vagas</span><b><EditText v={trip.vagas} set={x => upd('vagas', x)} ph="Consultar" /></b></li>
            </ul>

            <div className={s.summaryBox}>
              <small>Resumo no cartão (página inicial)</small>
              <EditText v={trip.descricao} set={x => upd('descricao', x)} ph="Uma frase chamativa sobre a viagem." area />
            </div>

            {trip.esgotado ? (
              <span className={`${s.fakeWa} ${s.fakeSoldout}`}>Esgotado</span>
            ) : (
              <span className={`${s.fakeWa} ${s.fakeReserve}`}>Reservar minha vaga</span>
            )}
            <span className={s.fakeWa}><i className="ph ph-whatsapp-logo" />Tirar dúvidas no WhatsApp</span>
            <div className={s.fakeReassure}><i className="ph ph-shield-check" />Reserva sem compromisso</div>
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
    setDraft(d => [...d, { ...NOVA_VIAGEM }])
    setDirty(true)
    setEditIndex(draft.length)
  }

  // Marca UMA viagem como destaque (e desmarca as demais), sem mexer na ordem.
  function definirDestaque(i, e) {
    e?.stopPropagation()
    setDraft(d => d.map((v, j) => ({ ...v, destaque: j === i })))
    setDirty(true)
    toast('Viagem definida como destaque — clique em Salvar alterações para confirmar')
  }

  // Troca a viagem de posição na agenda (a ordem aqui é a ordem na home).
  function mover(i, dir, e) {
    e?.stopPropagation()
    const j = i + dir
    if (j < 0 || j >= draft.length) return
    setDraft(d => {
      const arr = [...d]
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
    setDirty(true)
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
  const abertas = draft.filter(v => !v.esgotado).length
  const esgotadas = draft.filter(v => v.esgotado).length
  // Espelha a regra da home: viagem marcada como destaque ou, na falta, a primeira.
  const destaqueIdx = (() => {
    const i = draft.findIndex(v => v.destaque)
    return i >= 0 ? i : (draft.length ? 0 : -1)
  })()

  return (
    <div className={s.page}>
      <div className={s.topbar}>
        <Brand as={Link} to="/" className={s.brand} aria-label="Viajas Comigo — ir ao site" />
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
        <Editor trip={trip} upd={upd} onError={toast} />
      ) : (
        <div className={s.cardsWrap}>
          <div className={s.stats}>
            <div className={s.stat}><span className={s.statIcon}><i className="ph ph-airplane-tilt" /></span><div><b>{draft.length}</b><small>viagens cadastradas</small></div></div>
            <div className={s.stat}><span className={`${s.statIcon} ${s.statOk}`}><i className="ph ph-ticket" /></span><div><b>{abertas}</b><small>com vagas abertas</small></div></div>
            <div className={s.stat}><span className={`${s.statIcon} ${s.statNo}`}><i className="ph ph-fire" /></span><div><b>{esgotadas}</b><small>esgotadas</small></div></div>
          </div>

          <div className={s.cardsBar}>
            <div>
              <h2>Próximas viagens</h2>
              <p>Clique em uma viagem para <b>editá-la</b>, ou na lixeira para excluir. Use a <b>estrela ★</b> para escolher qual viagem aparece em <b>destaque</b> na página inicial. As mudanças só vão para o ar quando você clicar em <b>Salvar alterações</b>.</p>
            </div>
            <button type="button" className={s.btnSolid} onClick={nova}><i className="ph ph-plus" />Nova viagem</button>
          </div>

          <div className={s.cardsGrid}>
            {draft.map((v, i) => (
              <div key={slug(v.titulo) || i} className={`${s.cardWrap}${i === destaqueIdx ? ' ' + s.cardWrapFeatured : ''}`}>
                <div className={s.orderCtrls}>
                  <button
                    type="button"
                    className={s.orderBtn}
                    title="Mover para cima (aparece antes na home)"
                    disabled={i === 0}
                    onClick={e => mover(i, -1, e)}
                  ><i className="ph ph-arrow-up" /></button>
                  <button
                    type="button"
                    className={s.orderBtn}
                    title="Mover para baixo (aparece depois na home)"
                    disabled={i === draft.length - 1}
                    onClick={e => mover(i, 1, e)}
                  ><i className="ph ph-arrow-down" /></button>
                </div>
                <button
                  type="button"
                  className={s.trash}
                  title="Excluir esta viagem"
                  onClick={e => remover(i, e)}
                ><i className="ph ph-trash" /></button>
                {i === destaqueIdx ? (
                  <span className={s.destaqueTag}><i className="ph ph-star-fill" />Destaque na home</span>
                ) : (
                  <button
                    type="button"
                    className={s.destaqueBtn}
                    title="Mostrar esta viagem em destaque na página inicial"
                    onClick={e => definirDestaque(i, e)}
                  ><i className="ph ph-star" />Tornar destaque</button>
                )}
                <div className={s.adCard} onClick={() => setEditIndex(i)} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') setEditIndex(i) }}>
                  <div className={s.adMedia}>
                    <div className={s.adBg} style={{
                      backgroundImage: v.imagem ? `url('${v.imagem}')` : undefined,
                      backgroundPosition: `${v.capaPosX ?? 50}% ${v.capaPosY ?? 50}%`,
                      transform: `scale(${v.capaZoom || 1})`,
                    }} />
                    <span className={`${s.adBadge}${v.esgotado ? ' ' + s.adBadgeNo : ''}`}>
                      {v.esgotado ? 'Esgotado' : 'Vagas abertas'}
                    </span>
                  </div>
                  <div className={s.adBody}>
                    <h3>{v.titulo || '(sem título)'}</h3>
                    <div className={s.adDate}>{v.data}</div>
                    <p className={s.adDesc}>{v.descricao}</p>
                    <div className={s.adFoot}>
                      <div className={s.adPrice}>
                        <small>A partir de</small>
                        <b>R$ {v.preco || '—'}</b>
                        <div className={s.adVagas}>{vagasLabel(v)}</div>
                      </div>
                      <span className={s.adEdit}>Editar ✎</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${s.toast}${toastVisible ? ' ' + s.visible : ''}`}>{toastMsg}</div>
    </div>
  )
}
