// auth/seed.mjs

/**
 * Default staff names to seed into the users table.
 * You can edit this list as staff changes.
 */
export const seedUserNames = [
  'Rhea',
  'Ryan'
]

/**
 * Programmatic seeding helper (optional).
 * Call seedAuthUsers(db) to insert names into users if missing.
 */
export function seedAuthUsers(db, names = seedUserNames) {
  const insert = db.prepare('INSERT OR IGNORE INTO users (name, pin_hash) VALUES (?, NULL)')
  const tx = db.transaction(ns => {
    for (const n of ns) insert.run(n)
  })
  tx(names)
}
