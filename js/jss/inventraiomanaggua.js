document.addEventListener("DOMContentLoaded", () => {
  const tablaInventario = document.getElementById("tablaInventario").querySelector("tbody");
  const inputBuscar = document.getElementById("buscarProducto");
  const selectCategoria = document.getElementById("filtroCategoria");

  async function cargarInventario() {
    const sucursalId = "managua"; // cambia según la sucursal
    const filtroNombre = inputBuscar.value.trim().toLowerCase();
    const filtroCategoria = selectCategoria.value.toLowerCase();

    try {
      console.log("🚀 Cargando inventario para sucursal:", sucursalId);
      console.log("🔍 Filtros - Nombre:", filtroNombre, "Categoria:", filtroCategoria);

      // Traer sucursal
      const resSucursal = await fetch(`https://backend-12-4.onrender.com/api/sucursales/${sucursalId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const sucursal = await resSucursal.json();
      console.log("📦 Sucursal obtenida:", sucursal);

      // Traer productos completos
      const resProductos = await fetch(`https://backend-12-4.onrender.com/api/productos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const productos = await resProductos.json();
      console.log("🛒 Productos disponibles:", productos);

      // Unir inventario con productos
      let inventarioCompleto = sucursal.inventario.map(item => {
        const prod = productos.find(p => p.id === item.productoId);
        const combinado = {
          ...item,
          nombre: prod?.nombre || "Desconocido",
          categoria: prod?.categoria || "Desconocido",
          estado: prod?.estado || "Activo",
          precio: prod?.precio || 0,
          fechaActualizacion: prod?.fechaActualizacion || ""
        };
        console.log("🔗 Inventario combinado:", combinado);
        return combinado;
      });

      // Filtrar
      inventarioCompleto = inventarioCompleto.filter(p =>
        (filtroNombre === "" || p.nombre.toLowerCase().includes(filtroNombre)) &&
        (filtroCategoria === "" || p.categoria.toLowerCase() === filtroCategoria)
      );
      console.log("✅ Inventario filtrado:", inventarioCompleto);

      // Renderizar
      tablaInventario.innerHTML = "";
      if (inventarioCompleto.length === 0) {
        tablaInventario.innerHTML = `<tr><td colspan="6" style="text-align:center">No hay productos</td></tr>`;
        return;
      }

      inventarioCompleto.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.nombre}</td>
          <td>${p.categoria}</td>
          <td>${p.cantidad}</td>
          <td>${p.fechaActualizacion}</td>
          <td>$${p.precio}</td>
          <td>${p.estado}</td>
        `;
        tablaInventario.appendChild(fila);
        console.log("📝 Fila agregada a la tabla:", p.nombre);
      });

    } catch (error) {
      console.error("❌ Error al cargar inventario:", error);
      tablaInventario.innerHTML = `<tr><td colspan="6" style="text-align:center">Error al cargar inventario</td></tr>`;
    }
  }

  // Eventos para búsqueda y filtro
  inputBuscar.addEventListener("input", cargarInventario);
  selectCategoria.addEventListener("change", cargarInventario);

  // Carga inicial
  cargarInventario();
});
