// scripts/wipeDb.mjs
import Database from 'better-sqlite3';
import fs from 'node:fs';

const DB_PATH = process.env.DB_PATH || '/var/data/db.sqlite';

function wipeByDeleteFile() {
  for (const suffix of ['', '-wal', '-shm']) {
    try { fs.unlinkSync(`${DB_PATH}${suffix}`); } catch {}
  }
  console.log('Deleted DB files:', DB_PATH);
}

function wipeBySql() {
  const db = new Database(DB_PATH);
  try { db.pragma('foreign_keys = OFF'); } catch {}
  db.exec(`
    DELETE FROM juices;
    DELETE FROM users;
    VACUUM;
  `);
  console.log('Deleted all rows from juices and users.');
  db.close();
}

// Pick one:
wipeByDeleteFile(); // safest reset (requires SEED=true on next boot)
// wipeBySql();    // keep file, just empty tables
