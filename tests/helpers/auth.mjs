// tests/helpers/auth.mjs
import { api } from './app.mjs'

// Login with either userId or user name. Creates PIN if needed.
export async function loginAs(agent, userNameOrId = 1, pin = '1234') {
  // 1) list users so we can support name or id
  const usersRes = await agent.get('/api/auth/users').expect(200)
  const users = usersRes.body || []
  if (!users.length) throw new Error('No users available to log in')

  let user = users.find(u =>
    u.name === String(userNameOrId) || String(u.id) === String(userNameOrId)
  ) || users[0]

  // 2) begin auth
  const begin = await agent.post(api.auth.begin()).send({ userId: user.id }).expect(200)
  const { needsPinSetup } = begin.body || {}

  // 3) set pin on first login, otherwise do login
  if (needsPinSetup) {
    await agent.post(api.auth.setPin()).send({ userId: user.id, pin, confirm: pin }).expect(200)
  } else {
    await agent.post('/api/auth/login').send({ userId: user.id, pin }).expect(200)
  }

  // 4) sanity check
  const me = await agent.get(api.auth.me()).expect(200)
  if (!(me.body?.authenticated && me.body?.user?.id)) {
    throw new Error('Login failed: /me did not return a user')
  }
  return agent
}

export async function logout(agent) {
  // some impls use 204; accept 200|204
  const res = await agent.post('/api/auth/logout')
  if (![200, 204].includes(res.status)) {
    throw new Error(`Logout failed: status ${res.status}`)
  }
  return agent
}

// Handy one-liner
export async function makeAuthedAgent(createTestAgent, userNameOrId = 1, pin = '1234') {
  const agent = createTestAgent({ seed: true })
  await loginAs(agent, userNameOrId, pin)
  return agent
}
