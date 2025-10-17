document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // ----- Elementos -----
  const totalSolicitudes = document.getElementById("total-solicitudes");
  const totalInventario = document.getElementById("total-inventario");
  const totalUsuarios = document.getElementById("total-usuarios");

  const tablaSolicitudes = document.getElementById("tabla-solicitudes-recientes");
  const tablaInventario = document.getElementById("tabla-inventario");
  const tablaUsuarios = document.getElementById("tabla-usuarios");

  const menuItems = document.querySelectorAll(".sidebar ul li[data-section]");
  const sections = document.querySelectorAll(".content-section");

  // ----- Menú lateral -----
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const sectionId = item.getAttribute("data-section");
      sections.forEach(sec => sec.classList.toggle("active", sec.id === sectionId));
    });
  });

  // ----- Función para renderizar datos -----
  function mostrarResumen(solicitudes, productos, usuarios) {
    console.log("📊 Datos recibidos en mostrarResumen:");
    console.log("Solicitudes:", solicitudes);
    console.log("Productos:", productos);
    console.log("Usuarios:", usuarios);

    // Validar que sean arrays antes de usar .sort()
    if (!Array.isArray(solicitudes)) solicitudes = [];
    if (!Array.isArray(productos)) productos = [];
    if (!Array.isArray(usuarios)) usuarios = [];

    totalSolicitudes.textContent = solicitudes.length;
    totalInventario.textContent = productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
    totalUsuarios.textContent = usuarios.length;

    // ----- Solicitudes recientes -----
    tablaSolicitudes.innerHTML = "";
    solicitudes
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 3)
      .forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${s.producto || "-"}</td>
          <td>${s.nombreUsuario || "-"}</td>
          <td>${s.fecha ? new Date(s.fecha).toLocaleDateString("es-ES") : "-"}</td>
          <td>${s.estado || "-"}</td>
           
        `;
        tablaSolicitudes.appendChild(tr);
      });

    // ----- Productos recientes -----
    tablaInventario.innerHTML = "";
    productos
      .sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion))
      .slice(0, 3)
      .forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.nombre}</td>
          <td>${p.cantidad}</td>
          <td>$${p.precio}</td>
        `;
        tablaInventario.appendChild(tr);
      });

    // ----- Usuarios recientes -----
    tablaUsuarios.innerHTML = "";
    usuarios
      .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
      .slice(0, 3)
      .forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.nombre || "-"}</td>
          <td>${u.rol || "-"}</td>
          <td>${u.email || "-"}</td>
        `;
        tablaUsuarios.appendChild(tr);
      });
  }

  // ----- Función para actualizar datos desde backend -----
  async function actualizarDatos() {
    try {
      console.log("🔄 Actualizando datos desde backend...");

      const [resSolicitudes, resProductos, resUsuarios] = await Promise.all([
        fetch("https://backend-12-4.onrender.com/api/solicitudes", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("https://backend-12-4.onrender.com/api/productos", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("https://backend-12-4.onrender.com/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const solicitudes = await resSolicitudes.json();
      const productos = await resProductos.json();
      const usuarios = await resUsuarios.json();

      console.log("✅ Datos obtenidos del backend:");
      console.log("Solicitudes:", solicitudes);
      console.log("Productos:", productos);
      console.log("Usuarios:", usuarios);

      // Verificar si usuarios es un array
      if (!Array.isArray(usuarios)) {
        console.warn("⚠️ La respuesta de /api/users no es un array:", usuarios);
      }

      // Guardar en localStorage
      localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
      localStorage.setItem("productos", JSON.stringify(productos));
      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      mostrarResumen(solicitudes, productos, usuarios);
    } catch (error) {
      console.error("❌ Error al actualizar datos:", error);
    }
  }

  // ----- Cargar desde localStorage -----
  const solicitudesLS = JSON.parse(localStorage.getItem("solicitudes") || "[]");
  const productosLS = JSON.parse(localStorage.getItem("productos") || "[]");
  const usuariosLS = JSON.parse(localStorage.getItem("usuarios") || "[]");

  if (solicitudesLS.length || productosLS.length || usuariosLS.length) {
    mostrarResumen(solicitudesLS, productosLS, usuariosLS);
  }

  // ----- Actualización automática cada 10 segundos -----
  actualizarDatos();
  setInterval(actualizarDatos, 3000);
});
