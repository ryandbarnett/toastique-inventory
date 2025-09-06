// public/js/api/juices.mjs
import { get, putJson } from './http.mjs';

const BASE = '/api/v1/juices';

export function fetchJuices({ sort = 'name', dir = 'asc', signal, timeoutMs } = {}) {
  return get(BASE, { query: { sort, dir }, signal, timeoutMs });
}

export function updateLiters(id, liters, { signal, timeoutMs } = {}) {
  return putJson(`${BASE}/${Number(id)}/liters`, { liters }, { signal, timeoutMs });
}

export function updatePar(id, parLiters, { signal, timeoutMs } = {}) {
  return putJson(`${BASE}/${Number(id)}/par`, { parLiters }, { signal, timeoutMs });
}
