import request from 'supertest'
import { createApp } from '../server.js'

export async function makeApi({ seed = true } = {}) {
  const app = await createApp({ dbPath: ':memory:', seed })
  return request(app)
}
