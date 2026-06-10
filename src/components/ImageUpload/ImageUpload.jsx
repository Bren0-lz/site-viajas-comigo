import { useRef, useState } from 'react'
import { uploadImagem } from '../../utils/uploadImagem.js'
import s from './ImageUpload.module.css'

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
        {enviando ? 'Enviando…' : (label || '📷 Enviar foto do computador')}
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
