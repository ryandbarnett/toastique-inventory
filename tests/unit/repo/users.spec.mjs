import { describe, it, expect, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { makeUserRepo } from '../../../lib/repo/users.mjs'

describe('makeUserRepo', () => {
  let db, users

  beforeAll(() => {
    db = new Database(':memory:')
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, pin_hash TEXT)')
    db.exec("INSERT INTO users (id, name) VALUES (1, 'Alice')")
    users = makeUserRepo(db)
  })

  it('findById returns a user', () => {
    const u = users.findById(1)
    expect(u).toMatchObject({ id: 1, name: 'Alice' })
  })

  it('listUsers returns array of users', () => {
    const list = users.listUsers()
    expect(list.length).toBe(1)
    expect(list[0].name).toBe('Alice')
  })
})
