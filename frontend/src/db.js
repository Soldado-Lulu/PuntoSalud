const DB_NAME = 'farmaconsulta-offline';
const STORE = 'catalog';
function dbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function readCatalog() {
  const db = await dbOpen();
  try { return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get('snapshot');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  }); } finally { db.close(); }
}
export async function saveCatalog(data) {
  const db = await dbOpen();
  try { await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(data, 'snapshot');
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }); } finally { db.close(); }
}
