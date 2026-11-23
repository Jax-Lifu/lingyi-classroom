// Web Locks are available on secure origins. Plain HTTP installations use
// an exclusive IndexedDB transaction around the same synchronous storage edit.
export async function withStorageLock<T>(key: string, edit: () => T): Promise<T> {
  if (navigator.locks) return navigator.locks.request(key, edit);
  return new Promise<T>((resolve, reject) => {
    const open = indexedDB.open(key, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("lock");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction("lock", "readwrite");
      let result: T;
      tx.objectStore("lock").get(0).onsuccess = () => {
        try { result = edit(); }
        catch (error) { tx.abort(); reject(error); }
      };
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    };
  });
}
