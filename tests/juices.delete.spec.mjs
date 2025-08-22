// tests/juices.delete.spec.mjs
import { describe, it, beforeEach, expect } from 'vitest'
import { makeApi } from './helpers.mjs'

describe('DELETE /api/juices/:id', () => {
  let api
  beforeEach(async () => { api = await makeApi() })

  it('removes a record', async () => {
    const { body: list } = await api.get('/api/juices').expect(200)
    const target = list[0]

    await api.delete(`/api/juices/${target.id}`).expect(200)

    const { body: afterList } = await api.get('/api/juices').expect(200)
    const still = afterList.find(j => j.id === target.id)
    expect(still).toBeUndefined()
  })
})
