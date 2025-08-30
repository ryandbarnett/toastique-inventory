// tests/juices.sort.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('GET /api/juices sorting', () => {
  let api
  beforeEach(async () => {
    api = await makeApi({ seed: true })
  })

  it('sort=name&dir=asc returns names ascending', async () => {
    const res = await api.get('/api/juices?sort=name&dir=asc').expect(200)
    const names = res.body.map(j => j.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  it('sort=name&dir=desc returns names descending', async () => {
    const res = await api.get('/api/juices?sort=name&dir=desc').expect(200)
    const names = res.body.map(j => j.name)
    const sorted = [...names].sort((a, b) => b.localeCompare(a))
    expect(names).toEqual(sorted)
  })

  it('sort=status&dir=asc ranks OUT < BELOW PAR < OK', async () => {
    const res = await api.get('/api/juices?sort=status&dir=asc').expect(200)
    const rank = { 'OUT': 0, 'BELOW PAR': 1, 'OK': 2 }
    const ranks = res.body.map(j => rank[j.status])
    const sorted = [...ranks].sort((a, b) => a - b)
    expect(ranks).toEqual(sorted)
  })
})
