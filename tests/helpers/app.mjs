// tests/helpers/app.mjs
import request from 'supertest'
import { createApp } from '../../server.js'

// Build a fresh app (seeded in-memory DB by default)
export function buildApp({ seed = true, authSecurity } = {}) {
  return createApp({ dbPath: ':memory:', seed, authSecurity })
}

// Create a supertest *agent* against a fresh seeded app
export function createTestAgent({ seed = true, authSecurity } = {}) {
  const app = buildApp({ seed, authSecurity })
  return request.agent(app)
}

// URL builders
export const api = {
  v1(path = '') { return `/api/v1${path}` },
  juices: {
    list(q = '') { return `/api/v1/juices${q}` },
    liters(id)   { return `/api/v1/juices/${id}/liters` },
  },
  health() { return '/api/v1/health' },
  auth: {
    begin: () => '/api/auth/begin',
    setPin: () => '/api/auth/set-pin',
    me: () => '/api/auth/me',
  },
}
