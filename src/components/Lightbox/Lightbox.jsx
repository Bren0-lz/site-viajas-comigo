import { useEffect, useState } from 'react'
import s from './Lightbox.module.css'

export default function Lightbox({ images, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex)

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

  return (
    <div className={s.overlay} onClick={onClose}>
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
