document.addEventListener("DOMContentLoaded", () => {
  const tablaHistorial = document.getElementById("tablaHistorial").querySelector("tbody");
  const inputProducto = document.getElementById("buscarProductoHist") || null;
  const inputUsuario = document.getElementById("buscarUsuarioHist") || null;
  const inputFecha = document.getElementById("buscarFechaHist") || null;
  const selectEstado = document.getElementById("filtroEstadoHist") || null;

  async function cargarHistorial() {
    try {
      console.log("🚀 Cargando historial de solicitudes...");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Debes iniciar sesión para ver el historial");

      // Traer todas las solicitudes
      const res = await fetch(`https://backend-12-4.onrender.com/api/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const solicitudes = await res.json();
      console.log("📦 Solicitudes obtenidas:", solicitudes);

      // Filtrar según inputs
      const filtrado = solicitudes.filter(s => {
        const productoFilter = inputProducto?.value.toLowerCase() || "";
        const usuarioFilter = inputUsuario?.value.toLowerCase() || "";
        const fechaFilter = inputFecha?.value || "";
        const estadoFilter = selectEstado?.value.toLowerCase() || "";

        const coincideProducto = productoFilter === "" || s.producto.toLowerCase().includes(productoFilter);
        const coincideUsuario = usuarioFilter === "" || s.nombreUsuario.toLowerCase().includes(usuarioFilter);
        const coincideFecha = fechaFilter === "" || s.fecha === fechaFilter;
        const coincideEstado = estadoFilter === "" || estadoFilter === "todas" || s.estado.toLowerCase() === estadoFilter;

        return coincideProducto && coincideUsuario && coincideFecha && coincideEstado;
      });

      console.log("✅ Solicitudes filtradas:", filtrado);

      // Renderizar tabla
      tablaHistorial.innerHTML = "";
      if (filtrado.length === 0) {
        tablaHistorial.innerHTML = `<tr><td colspan="5" style="text-align:center">No hay solicitudes</td></tr>`;
        return;
      }

      filtrado.forEach(s => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${s.producto}</td>
          <td>${s.cantidad}</td>
          <td>${s.fecha}</td>
          <td>${s.estado}</td>
          <td>${s.nombreUsuario}</td>
        `;
        tablaHistorial.appendChild(fila);
      });

    } catch (error) {
      console.error("❌ Error al cargar historial:", error);
      tablaHistorial.innerHTML = `<tr><td colspan="5" style="text-align:center">Error al cargar historial</td></tr>`;
    }
  }

  // Eventos para filtros
  if (inputProducto) inputProducto.addEventListener("input", cargarHistorial);
  if (inputUsuario) inputUsuario.addEventListener("input", cargarHistorial);
  if (inputFecha) inputFecha.addEventListener("change", cargarHistorial);
  if (selectEstado) selectEstado.addEventListener("change", cargarHistorial);

  // Carga inicial
  cargarHistorial();
});
