document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalProducto");
  const btnNuevo = document.getElementById("btnNuevoProducto");
  const cerrar = document.getElementById("cerrarModal");
  const cancelar = document.getElementById("cancelarProducto");
  const tablaBody = document.querySelector("#tabla-inventario tbody");
  const filtroSucursal = document.getElementById("filtroSucursal");
  const filtroEstado = document.getElementById("filtroEstado");
  const formNuevoProducto = document.getElementById("formNuevoProducto");
  const pagContainer = document.createElement("div");
  pagContainer.id = "paginacion";
  document.querySelector(".table-section").appendChild(pagContainer);

  const token = localStorage.getItem("token");
  const itemsPorPagina = 16;
  let paginaActual = 1;
  let productosCache = [];

  // Abrir/cerrar modal
  btnNuevo.addEventListener("click", () => modal.style.display = "flex");
  cerrar.addEventListener("click", () => modal.style.display = "none");
  cancelar.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

  // Función para mostrar productos con paginación
  function mostrarProductos(productos) {
    const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    tablaBody.innerHTML = "";
    if (productosPagina.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">⚠️ No hay productos disponibles</td></tr>`;
      pagContainer.innerHTML = "";
      return;
    }

    productosPagina.forEach(prod => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${prod.nombre}</td>
        <td>${prod.sucursalId}</td>
        <td>${prod.categoria}</td>
        <td>${prod.cantidad}</td>
        <td>$${prod.precio}</td>
        <td>${prod.cantidad > 0 ? "Disponible" : "Agotado"}</td>
      `;
      tablaBody.appendChild(row);
    });

    // Flechas de paginación
    pagContainer.innerHTML = `
      <button id="prevBtn" ${paginaActual === 1 ? "disabled" : ""}>&lt;</button>
      <span>Página ${paginaActual} de ${totalPaginas}</span>
      <button id="nextBtn" ${paginaActual === totalPaginas ? "disabled" : ""}>&gt;</button>
    `;

    document.getElementById("prevBtn").addEventListener("click", () => {
      if (paginaActual > 1) { paginaActual--; mostrarProductos(productos); }
    });
    document.getElementById("nextBtn").addEventListener("click", () => {
      if (paginaActual < totalPaginas) { paginaActual++; mostrarProductos(productos); }
    });
  }

  // Función para cargar productos desde backend y cache/localStorage
  async function cargarProductos() {
    try {
      const sucursal = filtroSucursal.value === "todos" ? "" : filtroSucursal.value;
      const estado = filtroEstado.value;

      let url = `https://backend-12-4.onrender.com/api/productos`;
      if (sucursal) url += `?sucursal=${sucursal}`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      // Filtrar por estado
      productosCache = estado === "todos" ? data : data.filter(p => {
        if (estado === "disponible") return p.cantidad > 0;
        if (estado === "agotado") return p.cantidad === 0;
        return true;
      });

      // Guardar en localStorage
      localStorage.setItem("productosCache", JSON.stringify(productosCache));

      paginaActual = 1;
      mostrarProductos(productosCache);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  // Recargar productos cada 10 segundos
  setInterval(cargarProductos, 3000);

  // Cargar desde cache si existe
  const cache = localStorage.getItem("productosCache");
  if (cache) {
    productosCache = JSON.parse(cache);
    mostrarProductos(productosCache);
  } else {
    cargarProductos();
  }

  // Recargar al cambiar filtros
  filtroSucursal.addEventListener("change", cargarProductos);
  filtroEstado.addEventListener("change", cargarProductos);

  // Agregar nuevo producto
  formNuevoProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre: document.getElementById("inputNombre").value,
      sucursalId: document.getElementById("inputSucursal").value,
      categoria: document.getElementById("inputCategoria").value,
      cantidad: parseInt(document.getElementById("inputCantidad").value),
      precio: parseFloat(document.getElementById("inputPrecio").value),
      estado: document.getElementById("inputEstado").value
    };

    try {
      const res = await fetch("https://backend-12-4.onrender.com/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(nuevoProducto)
      });

      const data = await res.json();
      if (res.ok) {
        modal.style.display = "none";
        cargarProductos(); // refresca tabla y cache
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error al crear producto:", error);
    }
  });
});
