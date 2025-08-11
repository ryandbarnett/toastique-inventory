// scripts/initDb.js
import { getDb } from '../utils/db.js'

const db = await getDb()
console.log('Inventory DB initialized.')
await db.close()