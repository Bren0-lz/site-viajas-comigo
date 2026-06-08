import { isAuthed } from './_lib/auth.js'

export default function handler(req, res) {
  return res.status(200).json({ authed: isAuthed(req) })
}
