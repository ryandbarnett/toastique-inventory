// auth/seed.mjs

/**
 * Default staff names to seed into the users table.
 * You can edit this list as staff changes.
 */
export const seedUserNames = [
  'Bill',
  'Ella',
  'Jocelyn',
  'Maya',
  'Megan',
  'Nina',
  'Presley',
  'Rhea',
  'Ryan',
];

/**
 * Programmatic seeding helper (optional).
 * Call seedAuthUsers(db) to insert names into users if missing.
 */
export function seedAuthUsers(db, names = seedUserNames) {
  const insert = db.prepare('INSERT OR IGNORE INTO users (name, pin_hash, role) VALUES (?, NULL, ?)');
  const tx = db.transaction((ns) => {
    for (const n of ns) {
      const role = n === 'Ryan' ? 'admin' : 'staff';
      insert.run(n, role);
    }
    // If users already existed (INSERT OR IGNORE skipped), ensure Ryan is admin.
    db.prepare("UPDATE users SET role = 'admin' WHERE name = 'Ryan'").run();
  });
  tx(names);
}

