# @toastique/auth (local package)

Drop-in PIN auth for Express with a pluggable user repo and session API.

## Public API
- `mountAuth(app, { userRepo, session, paths? })`
- `requireAuth(session)`

## Host responsibilities
Implement `userRepo` against your DB:

```js
{
  findById(id),            // -> { id, name, pin_hash? } | null
  findByName(name)?,       // optional
  listUsers(),             // -> [{ id, name }]
  setPinHash(id, hash)     // -> void
}
