// tests/juices.sort.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('GET /api/v1/juices sorting', () => {
  const rank = { 'OUT': 0, 'BELOW PAR': 1, 'OK': 2 }
  let api
  
  beforeEach(async () => {
    api = await makeApi({ seed: true })
  })

  it('seed provides at least one juice', async () => {
    const res = await api.get('/api/v1/juices').expect(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('sort=name&dir=asc returns names ascending', async () => {
    const res = await api.get('/api/v1/juices?sort=name&dir=asc').expect(200)
    const names = res.body.map(j => j.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  it('sort=name&dir=desc returns names descending', async () => {
    const res = await api.get('/api/v1/juices?sort=name&dir=desc').expect(200)
    const names = res.body.map(j => j.name)
    const sorted = [...names].sort((a, b) => b.localeCompare(a))
    expect(names).toEqual(sorted)
  })

  it('sort=status&dir=asc ranks OUT < BELOW PAR < OK', async () => {
    const res = await api.get('/api/v1/juices?sort=status&dir=asc').expect(200)
    const ranks = res.body.map(j => rank[j.status])
    const sorted = [...ranks].sort((a, b) => a - b)
    expect(ranks).toEqual(sorted)
  })

  it('sort=status&dir=desc ranks OK < BELOW PAR < OUT', async () => {
    const res = await api.get('/api/v1/juices?sort=status&dir=desc').expect(200)
    const ranks = res.body.map(j => rank[j.status])
    const sorted = [...ranks].sort((a, b) => b - a)
    expect(ranks).toEqual(sorted)
  })
})
