import { obtenerLocal, eliminarLocal } from './db.js';

const stores = ['ventas', 'inventario', 'reportes', 'historial', 'solicitudes', 'sucursales'];

export const sincronizarTodos = async () => {
  for (let storeName of stores) {
    const items = await obtenerLocal(storeName);
    for (let item of items) {
      try {
        const res = await fetch(`https://backend-12-4.onrender.com/api/${storeName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: JSON.stringify(item),
        });
        if (res.ok) await eliminarLocal(storeName, item.id);
      } catch (err) {
        console.warn(`No se pudo sincronizar ${storeName}:`, item, err);
      }
    }
  }
};

export const startSync = () => {
  window.addEventListener('online', () => {
    console.log('Conexión recuperada, sincronizando todo...');
    sincronizarTodos();
  });

  setInterval(() => {
    if (navigator.onLine) sincronizarTodos();
  }, 10000); // cada 10 segundos
};
