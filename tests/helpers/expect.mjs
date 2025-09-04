// tests/helpers/expect.mjs
export function expectJSON(res) {
  expect(res.headers['content-type']).toMatch(/application\/json/i)
}

export function expectNotFound(res, msg = 'Not Found') {
  expect(res.status).toBe(404)
  expect(res.body).toMatchObject({ error: msg })
}
