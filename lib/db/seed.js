// lib/db/seed.js

/**
 * Seed data for the juices table.
 * All start at 0 liters and are marked as updated by Ryan.
 *
 * @param {string} nowISO - ISO timestamp for lastUpdated
 * @param {number|null} ryanId - user ID for Ryan (must exist in users table)
 */
export const seedRows = (nowISO, ryanId = null) => [ 
  ['Apple Juice', 5, 0, nowISO, ryanId], 
  ['Balance', 5, 0, nowISO, ryanId], 
  ['Defender', 5, 0, nowISO, ryanId], 
  ['Radiance', 3, 0, nowISO, ryanId], 
  ['Cure', 3, 0, nowISO, ryanId], 
  ['Metabolize', 2, 0, nowISO, ryanId], 
  ['Pitaya Lemonade', 6, 0, nowISO, ryanId], 
  ['Lemon', .5, 0, nowISO, ryanId], 
  ['Ginger', .5, 0, nowISO, ryanId], 
  ['Lime', .5, 0, nowISO, ryanId], 
  ['Recharge', 3, 0, nowISO, ryanId], 
  ['Summer Seasonal', 5, 0, nowISO, ryanId],
];