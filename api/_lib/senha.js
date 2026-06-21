import { safeEqual, verifyPassword } from './auth.js'
import { getPasswordHash } from './store.js'

// Verifica se a senha informada confere com a senha vigente do painel.
//
// Ordem de prioridade:
//  1. Se houver um hash salvo no banco (senha trocada pelo painel), compara com ele.
//  2. Caso contrário, cai para a ADMIN_PASSWORD do ambiente (semente inicial).
//
// Assim o painel nunca fica "trancado": antes da primeira troca vale o env; depois,
// vale a senha do banco. Se o Redis estiver fora do ar, getPasswordHash() devolve
// null e voltamos ao env (falha aberto para não bloquear o acesso).
export async function senhaConfere(senha) {
  const hash = await getPasswordHash()
  if (hash) return verifyPassword(senha, hash)

  const env = process.env.ADMIN_PASSWORD
  if (!env) return false
  return safeEqual(senha, env)
}
