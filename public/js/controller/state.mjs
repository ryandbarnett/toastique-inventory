// public/js/controller/state.mjs
/**
 * Central UI state for the table/sort/auth bits.
 */
export function createState() {
  let cache = [];
  let sortMode = 'name';   // 'name' | 'status'
  let sortDir  = 'asc';    // 'asc' | 'desc'
  let currentUser = null;  // { id, name, role } | null

  const isAdmin = () => currentUser?.role === 'admin';
  const getSort = () => ({ sortMode, sortDir });
  const setSort = (mode, dir) => { sortMode = mode; sortDir = dir; };
  const getUser = () => currentUser;
  const setUser = (u) => { currentUser = u; };
  const getCache = () => cache;
  const setCache = (rows) => { cache = rows || []; };

  return { getSort, setSort, isAdmin, getUser, setUser, getCache, setCache };
}
