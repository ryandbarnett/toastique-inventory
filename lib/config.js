// lib/config.js
export const QT_TO_L = 0.946352946

// 1× recipe yields (quarts). Adjust if your card changes.
export const YIELD_QT = {
  Balance: 4,
  Recharge: 5,
  Metabolize: 5,
  Radiance: 6,
  Cure: 4,
  Defender: 5,
  // 'Pitaya Lemonade': ?, // provide volumeLiters explicitly for now
}

export const ONE_DAY_MS = 24 * 60 * 60 * 1000
export const iso = (d) => new Date(d).toISOString()
