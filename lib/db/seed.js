// lib/db/seed.js

/**
 * Seed data for the juices table.
 * All start at 0 liters and are marked as updated by Ryan.
 *
 * @param {string} nowISO - ISO timestamp for lastUpdated
 * @param {number|null} ryanId - user ID for Ryan (must exist in users table)
 */
export const seedRows = (nowISO, ryanId = null) => [
  ['Apple Juice',     6, 0, nowISO, ryanId],
  ['Balance',         6, 0, nowISO, ryanId],
  ['Defender',        6, 0, nowISO, ryanId],
  ['Radiance',        6, 0, nowISO, ryanId],
  ['Cure',            6, 0, nowISO, ryanId],
  ['Metabolize',      6, 0, nowISO, ryanId],
  ['Pitaya Lemonade', 6, 0, nowISO, ryanId],
  ['Lemon',           4, 0, nowISO, ryanId],
  ['Ginger',          4, 0, nowISO, ryanId],
  ['Lime',            4, 0, nowISO, ryanId],
  ['Recharge',        6, 0, nowISO, ryanId],
  ['Summer Seasonal', 6, 0, nowISO, ryanId],
];
