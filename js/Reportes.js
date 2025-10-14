const tabla = document.getElementById('tablaSolicitudes');
const filtroSucursal = document.getElementById('filtroSucursal');
const filtroEstado = document.getElementById('filtroEstado');

let solicitudesCache = []; // Solicitudes en memoria
const CACHE_KEY = 'solicitudesCache';

// Renderizar tabla
function renderizarTabla(solicitudes) {
  tabla.innerHTML = '';

  if (solicitudes.length === 0) {
    tabla.innerHTML = '<tr><td colspan="8">No hay solicitudes</td></tr>';
    return;
  }

  solicitudes.forEach(solicitud => {
    tabla.innerHTML += `
      <tr>
        <td>${solicitud.id}</td>
        <td>${solicitud.sucursalOrigen}</td>
        <td>${solicitud.producto}</td>
        <td>${solicitud.cantidad}</td>
        <td>${solicitud.nombreUsuario}</td>
        <td>${solicitud.fecha}</td>
        <td>${solicitud.estado}</td>
        <td>
          <button class="btn-aceptar" data-id="${solicitud.id}" ${solicitud.estado !== 'Pendiente' ? 'disabled' : ''}>Aceptar</button>
          <button class="btn-denegar" data-id="${solicitud.id}" ${solicitud.estado !== 'Pendiente' ? 'disabled' : ''}>Denegar</button>
        </td>
      </tr>
    `;
  });
}

// Filtrar solicitudes en memoria
function filtrarSolicitudes() {
  const sucursal = filtroSucursal.value;
  const estado = filtroEstado.value;

  let filtradas = [...solicitudesCache];

  if (sucursal !== 'todas')
    filtradas = filtradas.filter(s => s.sucursalOrigen.toLowerCase() === sucursal.toLowerCase());
  if (estado !== 'todas')
    filtradas = filtradas.filter(s => s.estado.toLowerCase() === estado.toLowerCase());

  renderizarTabla(filtradas);
}

// Cargar solicitudes desde backend
async function cargarSolicitudesBackend() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('https://backend-12-4.onrender.com/api/solicitudes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Error backend:', text);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error('Error al conectar con backend:', error);
    return [];
  }
}

// Inicializar tabla al cargar la página
async function inicializarTabla() {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    solicitudesCache = JSON.parse(cache);
    filtrarSolicitudes();
  }

  // Siempre traer versión actual del backend para mantener sincronía
  const backendData = await cargarSolicitudesBackend();
  solicitudesCache = backendData;
  localStorage.setItem(CACHE_KEY, JSON.stringify(backendData));
  filtrarSolicitudes();
}

// Sincronizar cache cada 10s (actualiza todo, no solo los nuevos)
async function sincronizarSolicitudes() {
  const nuevas = await cargarSolicitudesBackend();

  // Comparamos si hay diferencias con el localStorage
  const cacheActual = JSON.stringify(solicitudesCache);
  const nuevasJson = JSON.stringify(nuevas);

  if (cacheActual !== nuevasJson) {
    console.log("🔄 Cambios detectados, actualizando cache local...");
    solicitudesCache = nuevas;
    localStorage.setItem(CACHE_KEY, JSON.stringify(nuevas));
    filtrarSolicitudes();
  } else {
    console.log("✅ Cache sincronizado, sin cambios.");
  }
}

// Manejar cambios de filtros
filtroSucursal.addEventListener('change', filtrarSolicitudes);
filtroEstado.addEventListener('change', filtrarSolicitudes);

// Manejar botones Aceptar/Denegar
tabla.addEventListener('click', async (e) => {
  if (e.target.tagName !== 'BUTTON') return;

  const id = e.target.dataset.id;
  const nuevoEstado = e.target.classList.contains('btn-aceptar') ? 'aprobada' : 'Denegada';
  const token = localStorage.getItem('token');

  const res = await fetch(`https://backend-12-4.onrender.com/api/solicitudes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ estado: nuevoEstado })
  });

  if (res.ok) {
    const solicitud = solicitudesCache.find(s => s.id === id);
    if (solicitud) solicitud.estado = nuevoEstado;
    localStorage.setItem(CACHE_KEY, JSON.stringify(solicitudesCache));
    filtrarSolicitudes();
  } else {
    const text = await res.text();
    console.error('Error actualizar:', text);
    alert('No se pudo actualizar la solicitud');
  }
});

// Inicializar y sincronizar
document.addEventListener('DOMContentLoaded', () => {
  inicializarTabla();
  setInterval(sincronizarSolicitudes, 3000);
});
