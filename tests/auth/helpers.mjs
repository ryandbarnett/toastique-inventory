// tests/auth/helpers.mjs
// Supertest-based auth helpers for API tests.
//
// Usage:
//   import { makeApi } from '../helpers.mjs'
//   import { loginAs } from './auth/helpers.mjs'
//   const api = await makeApi({ seed: true })
//   await loginAs(api, 'Ryan') // or omit name to pick first user
//
// Assumes makeApi returns a supertest *agent* so cookies persist.

export async function loginAs(api, userNameOrId = null, pin = '1234') {
  // 1) list users
  const usersRes = await api.get('/api/auth/users').expect(200);
  const users = usersRes.body || [];
  if (!users.length) throw new Error('No users available to log in');

  let user = users[0];
  if (userNameOrId != null) {
    const found = users.find(
      u => u.name === userNameOrId || String(u.id) === String(userNameOrId)
    );
    if (!found) throw new Error(`User not found: ${userNameOrId}`);
    user = found;
  }

  // 2) begin
  const begin = await api.post('/api/auth/begin').send({ userId: user.id }).expect(200);
  const { needsPinSetup } = begin.body || {};

  // 3) set pin first time, else login
  if (needsPinSetup) {
    await api.post('/api/auth/set-pin')
      .send({ userId: user.id, pin, confirm: pin })
      .expect(200);
  } else {
    await api.post('/api/auth/login')
      .send({ userId: user.id, pin })
      .expect(200);
  }

  // 4) sanity-check session
  const me = await api.get('/api/auth/me').expect(200);
  if (!(me.body && me.body.id)) throw new Error('Login failed: /me did not return a user');

  return api; // same agent, now authenticated
}

export async function logout(api) {
  await api.post('/api/auth/logout').expect(204).catch(() => {}); // some impls return 200
}

// Handy one-liner for specs
export async function makeAuthedApi(makeApi, userNameOrId = null, pin = '1234') {
  const api = await makeApi({ seed: true });
  await loginAs(api, userNameOrId, pin);
  return api;
}
