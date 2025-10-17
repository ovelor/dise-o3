import { openDB } from 'idb';

export const initDB = async () => {
  return openDB('poapeaDB', 1, {
    upgrade(db) {
      const stores = ['ventas', 'inventario', 'usuario', 'reportes', 'historial', 'solicitudes', , 'sucursales'];
      stores.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
        }
      });
    },
  });
};

export const guardarLocal = async (storeName, data) => {
  const db = await initDB();
  await db.put(storeName, data);
};

export const obtenerLocal = async (storeName) => {
  const db = await initDB();
  return db.getAll(storeName);
};

export const eliminarLocal = async (storeName, key) => {
  const db = await initDB();
  await db.delete(storeName, key);
};
