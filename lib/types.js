// lib/types.js

/**
 * Core typedefs shared across the inventory app.
 * These are discovered automatically by most editors/IDEs.
 * You can also explicitly reference them with:
 *
 *   /// <reference path="./types.js" />
 */

/**
 * @typedef {Object} Batch
 * @property {number} id
 * @property {number} juiceId
 * @property {string} madeAt        ISO timestamp when the batch was made
 * @property {string} expiresAt     ISO timestamp when the batch expires
 * @property {number} volumeLiters  Total liters in the batch when created
 * @property {number} remainingLiters Current liters remaining
 * @property {string|null} disposedAt ISO timestamp when disposed, or null if not
 * @property {string|null} note      Optional free-text note
 */

/**
 * @typedef {Object} Juice
 * @property {number} id
 * @property {string} name
 * @property {number} parLiters      Minimum par stock threshold
 * @property {number} displayOrder   Position for ordered lists
 */

/**
 * @typedef {Object} CountRecord
 * @property {number} juiceId
 * @property {number} countLiters
 * @property {string} countedAt   ISO timestamp when the count was entered
 * @property {string} countDate   YYYY-MM-DD date part of countedAt
 * @property {string|null} note   Optional free-text note
 */
