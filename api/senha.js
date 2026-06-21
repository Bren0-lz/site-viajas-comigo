import { isAuthed, hashPassword } from './_lib/auth.js'
import { setPasswordHash } from './_lib/store.js'
import { senhaConfere } from './_lib/senha.js'

// Tamanho mínimo da nova senha.
const MIN_SENHA = 6

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ erro: 'Método não permitido' })
    }

    // Só com sessão de admin válida (mesmo padrão da gravação de viagens).
    if (!isAuthed(req.headers.cookie)) {
      return res.status(401).json({ erro: 'Não autorizado' })
    }

    // O body já vem parseado pela Vercel quando é JSON; aceita string por garantia.
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { body = {} }
    }
    const senhaAtual = (body && body.senhaAtual) || ''
    const novaSenha = (body && body.novaSenha) || ''

    if (!(await senhaConfere(senhaAtual))) {
      return res.status(401).json({ erro: 'Senha atual incorreta' })
    }
    if (typeof novaSenha !== 'string' || novaSenha.length < MIN_SENHA) {
      return res.status(400).json({ erro: `A nova senha precisa ter pelo menos ${MIN_SENHA} caracteres.` })
    }

    await setPasswordHash(hashPassword(novaSenha))
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ erro: err.message || 'Erro interno' })
  }
}
