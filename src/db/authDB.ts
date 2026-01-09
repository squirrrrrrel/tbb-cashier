const DB_NAME = "pos-auth-db";
const STORE_NAME = "auth";
const VERSION = 1;
const LOCAL_KEY = "pos-auth-session";

function setCookie(name: string, value: string, days = 7) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  } catch (err) {
    // ignore
  }
}

function getCookie(name: string) {
  try {
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
  } catch (err) {
    return null;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAuth(data: any) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(data, "session");
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch (err) {
    // ignore localStorage errors (e.g., private mode)
  }
  try {
    if (data?.token) setCookie('pos_token', data.token);
  } catch (err) {
    // ignore
  }
}

export async function getAuth() {
  // Fast synchronous fallback from localStorage (helps on hard refresh / offline)
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    // ignore and fallback to IndexedDB
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get("session");

    return await new Promise<any>((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    // fallback to cookie token when IndexedDB fails
    try {
      const token = getCookie('pos_token');
      if (token) return { token, user: null };
    } catch (e) {
      // ignore
    }
    return null;
  }
}

export async function clearAuth() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch (err) {
    // ignore
  }
  try {
    document.cookie = `pos_token=; expires=${new Date(0).toUTCString()}; path=/`;
  } catch (err) {
    // ignore
  }
}
