// utils/auth.js — shared localStorage-backed auth helpers.
//
// There's no session/token system yet (see login.php / register.php notes),
// so once the API confirms a login or signup, we keep the returned customer
// record client-side under this key. Every page that needs to know who's
// logged in reads/writes through these three functions so there's one
// source of truth.
//
// Place this file at src/utils/auth.js (sibling to src/data/products.js) so
// the `../utils/auth` import from src/components/*.jsx resolves correctly.

const STORAGE_KEY = "technosoft_user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // localStorage unavailable (e.g. private browsing) — login still works
    // for the current page load, it just won't persist across reloads.
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
