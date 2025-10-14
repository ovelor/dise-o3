const tablaVentas = document.querySelector(".historial-ventas tbody");
const CACHE_KEY = "ventasCache";

let ventasCache = [];

// Renderizar tabla
function renderizarVentas(ventas) {
  tablaVentas.innerHTML = "";

  if (!ventas.length) {
    tablaVentas.innerHTML = '<tr><td colspan="6">No hay ventas</td></tr>';
    return;
  }

  ventas.forEach(v => {
    tablaVentas.innerHTML += `
      <tr>
        <td>${v.id}</td>
        <td>${v.producto}</td>
        <td>${v.cantidad}</td>
        <td>${v.cliente}</td>
        <td>${v.fecha}</td>
        <td>${v.metodoPago}</td>
      </tr>
    `;
  });
}

// Cargar ventas desde backend
async function cargarVentasBackend() {
  try {
    const token = localStorage.getItem('token');
    
    const res = await fetch(`https://backend-12-4.onrender.com/api/ventas`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) throw new Error(`Error al cargar ventas: ${await res.text()}`);
   
    const ventas = await res.json();
    return ventas;
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    return [];
  }
}

// Sincronizar ventas con backend
async function sincronizarVentas() {
  const nuevas = await cargarVentasBackend();
  let huboCambio = false;

  nuevas.forEach(v => {
    if (!ventasCache.find(item => item.id === v.id)) {
      ventasCache.push(v);
      huboCambio = true;
    }
  });

  if (huboCambio) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(ventasCache));
    renderizarVentas(ventasCache);
  }
}

// Inicializar tabla con cache o backend
async function inicializarVentas() {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    ventasCache = JSON.parse(cache);
    renderizarVentas(ventasCache);
  } else {
    ventasCache = await cargarVentasBackend();
    localStorage.setItem(CACHE_KEY, JSON.stringify(ventasCache));
    renderizarVentas(ventasCache);
  }
}

// Registrar venta nueva
async function registrarVenta(ventaData) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://backend-12-4.onrender.com/api/ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(ventaData),
    });

    if (!res.ok) throw new Error(await res.text());

    const nuevaVenta = await res.json();

    // Actualizar cache inmediatamente
    ventasCache.push(nuevaVenta.data);
    localStorage.setItem(CACHE_KEY, JSON.stringify(ventasCache));
    renderizarVentas(ventasCache);

    // Sincronizar también con backend
    await sincronizarVentas();
  } catch (error) {
    console.error("Error al registrar venta:", error);
    alert("No se pudo registrar la venta");
  }
}

// Manejo botones de carrito
document.addEventListener("DOMContentLoaded", () => {
  inicializarVentas();

  // Sincronizar cada 3 segundos
  setInterval(sincronizarVentas, 3000);

  // Finalizar venta
  document.querySelectorAll(".btn-finalizar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const cliente = document.getElementById("cliente-nombre").value;
      const metodoPago = document.getElementById("metodo-pago").value;

      // Recorrer carrito
      const rows = document.querySelectorAll("#carrito-body tr");
      for (const row of rows) {
        const producto = row.querySelector(".producto")?.textContent || row.cells[0].textContent;
        const cantidad = Number(row.querySelector(".cantidad")?.textContent || row.cells[2].textContent);

        const ventaData = {
          producto,
          cantidad,
          cliente,
          metodoPago,
          sucursalId: "rivas", // Cambiar si tienes login dinámico
        };

        await registrarVenta(ventaData);
      }

      // Vaciar carrito tras finalizar
      document.getElementById("carrito-body").innerHTML = "";
      document.getElementById("total").textContent = "$0";
    });
  });
});
