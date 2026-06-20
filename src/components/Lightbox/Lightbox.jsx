import { useEffect, useRef, useState } from 'react'
import s from './Lightbox.module.css'

export default function Lightbox({ images, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex)
  const [dragX, setDragX] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [w, setW] = useState(() => window.innerWidth)

  const touchStart = useRef(null)
  const dirRef = useRef(0) // 0 = parado, 1 = próxima, -1 = anterior (animação em curso)

  const n = images.length
  const prevIdx = (idx - 1 + n) % n
  const nextIdx = (idx + 1) % n

  useEffect(() => {
    let ticking = false
    // rAF: um único recálculo de largura por frame ao rotacionar/abrir teclado no celular
    function onResize() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        setW(window.innerWidth)
        ticking = false
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Inicia a transição de deslize numa direção (1 próxima, -1 anterior, 0 volta ao lugar)
  function settle(dir) {
    if (dirRef.current !== 0) return // já tem uma animação em andamento
    if (dir !== 0 && n < 2) dir = 0 // sem outra foto, só volta
    dirRef.current = dir
    setAnimate(true)
    setDragX(dir === 0 ? 0 : -dir * w)
  }

  function prev() { settle(-1) }
  function next() { settle(1) }

  function onTrackTransitionEnd() {
    const dir = dirRef.current
    if (dir !== 0) {
      setIdx(i => (i + dir + n) % n)
      setAnimate(false)
      setDragX(0) // recentra: a nova foto já está no slot central, sem salto visível
    }
    dirRef.current = 0
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, w, onClose])

  function onTouchStart(e) {
    if (dirRef.current !== 0) return
    const t = e.changedTouches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, locked: null }
    setAnimate(false)
  }

  function onTouchMove(e) {
    if (!touchStart.current || dirRef.current !== 0) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    // decide uma única vez se o gesto é horizontal (arraste) ou vertical (deixa rolar)
    if (touchStart.current.locked === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      touchStart.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (touchStart.current.locked !== 'x') return
    setDragX(dx)
  }

  function onTouchEnd(e) {
    if (!touchStart.current) return
    const locked = touchStart.current.locked
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    touchStart.current = null
    if (locked !== 'x') { setDragX(0); return }
    // passou do limiar → troca de foto deslizando; senão, volta ao lugar
    if (Math.abs(dx) > 50) {
      settle(dx < 0 ? 1 : -1)
    } else {
      settle(0)
    }
  }

  const slides = [prevIdx, idx, nextIdx]
  const trackStyle = {
    transform: `translate3d(${-w + dragX}px, 0, 0)`,
  }

  return (
    <div
      className={s.overlay}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={s.viewport}>
        <div
          className={`${s.track} ${animate ? s.animate : ''}`}
          style={trackStyle}
          onTransitionEnd={onTrackTransitionEnd}
        >
          {slides.map((imgI, slot) => (
            <div className={s.slide} key={slot} style={{ width: w }}>
              <img
                className={s.img}
                src={images[imgI]}
                alt={`Foto ${imgI + 1}`}
                draggable={false}
                onClick={e => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      </div>

      <button className={s.close} onClick={onClose}>✕</button>
      {n > 1 && (
        <>
          <button className={s.prev} onClick={e => { e.stopPropagation(); prev() }}>‹</button>
          <button className={s.next} onClick={e => { e.stopPropagation(); next() }}>›</button>
          <span className={s.counter}>{idx + 1} / {n}</span>
        </>
      )}
    </div>
  )
}
