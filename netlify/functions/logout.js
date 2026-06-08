import { clearCookie } from '../lib/auth.js'

export async function handler() {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie() },
    body: JSON.stringify({ ok: true }),
  }
}
