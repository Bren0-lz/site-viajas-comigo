import { useEffect, useRef, useState } from 'react'
import s from './Lightbox.module.css'

export default function Lightbox({ images, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex)
  const touchStart = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  function prev() { setIdx(i => (i - 1 + images.length) % images.length) }
  function next() { setIdx(i => (i + 1) % images.length) }

  function onTouchStart(e) {
    const t = e.changedTouches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  function onTouchEnd(e) {
    if (!touchStart.current || images.length < 2) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    // só conta como swipe se for predominantemente horizontal
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev()
    }
  }

  return (
    <div
      className={s.overlay}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img
        className={s.img}
        src={images[idx]}
        alt={`Foto ${idx + 1}`}
        onClick={e => e.stopPropagation()}
      />
      <button className={s.close} onClick={onClose}>✕</button>
      {images.length > 1 && (
        <>
          <button className={s.prev} onClick={e => { e.stopPropagation(); prev() }}>‹</button>
          <button className={s.next} onClick={e => { e.stopPropagation(); next() }}>›</button>
          <span className={s.counter}>{idx + 1} / {images.length}</span>
        </>
      )}
    </div>
  )
}
