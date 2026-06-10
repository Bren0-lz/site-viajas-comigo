import { useRef, useState } from 'react'
import { uploadImagem } from '../../utils/uploadImagem.js'
import s from './ImageUpload.module.css'

// Ícone de câmera (SVG) — substitui o emoji 📷 por um traço fino e moderno.
function CameraIcon() {
  return (
    <svg
      className={s.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a1.5 1.5 0 0 0 1.27-.7l.66-1.1A1.5 1.5 0 0 1 9.9 3.5h4.2a1.5 1.5 0 0 1 1.27.7l.66 1.1a1.5 1.5 0 0 0 1.27.7h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  )
}

// Spinner exibido enquanto o upload acontece.
function Spinner() {
  return <span className={s.spinner} aria-hidden="true" />
}

// Botão de "enviar foto do computador". Esconde o <input type="file"> e mostra
// um botão amigável. Em sucesso, chama onUploaded(url) para cada arquivo; em
// erro, chama onError(mensagem).
export default function ImageUpload({ onUploaded, onError, multiple = false, label }) {
  const inputRef = useRef(null)
  const [enviando, setEnviando] = useState(false)

  async function aoEscolher(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setEnviando(true)
    try {
      // Envia uma de cada vez para não estourar conexões e poder ir
      // adicionando as fotos conforme chegam.
      for (const file of files) {
        const url = await uploadImagem(file)
        onUploaded?.(url)
      }
    } catch (err) {
      onError?.(err.message || 'Não foi possível enviar a imagem.')
    } finally {
      setEnviando(false)
      // Limpa para permitir reenviar o mesmo arquivo se precisar.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <button
        type="button"
        className={s.btn}
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
      >
        {enviando ? <Spinner /> : <CameraIcon />}
        <span>{enviando ? 'Enviando…' : (label || 'Enviar foto do computador')}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className={s.hidden}
        onChange={aoEscolher}
      />
    </>
  )
}
