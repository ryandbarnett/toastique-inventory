// lib/db/seed.js
export const seedRows = (nowISO) => [
  // OK (>= par)
  ['Apple Juice', 6, 6, nowISO],
  ['Balance', 6, 7, nowISO],
  ['Defender', 6, 6.5, nowISO],
  ['Radiance', 6, 8, nowISO],
  // BELOW PAR
  ['Cure', 6, 4, nowISO],
  ['Metabolize', 6, 2, nowISO],
  ['Pitaya Lemonade', 6, 1.5, nowISO],
  ['Lemon', 4, 2, nowISO],
  // OUT
  ['Ginger', 4, 0, nowISO],
  ['Lime', 4, 0, nowISO],
  ['Recharge', 6, 0, nowISO],
  ['Summer Seasonal', 6, 0, nowISO],
]

export const seedUserNames = [
  'Rhea',
  'Ryan',
];
