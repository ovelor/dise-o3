document.addEventListener("DOMContentLoaded", () => {
  // ----- Manejo de menú lateral -----
  const menuItems = document.querySelectorAll(".sidebar li[data-section]");
  const sections = document.querySelectorAll(".section");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(i => i.classList.remove("active"));
      sections.forEach(sec => sec.classList.remove("active"));

      item.classList.add("active");
      const section = document.getElementById(item.getAttribute("data-section"));
      section.classList.add("active");
    });
  });

  // ----- Variables DOM -----
  const tablaSolicitudes = document.getElementById("tablaSolicitudes");
  const cards = document.querySelectorAll(".cards-grid .card p");
  // cards[0] → Total Productos
  // cards[1] → Solicitudes en Proceso
  // cards[2] → Solicitudes Completadas
  // cards[3] → Solicitudes Denegadas (si existe)

  const SUCURSAL = "granada";

  // ----- Función para actualizar tarjetas y tabla -----
  async function cargarSolicitudes() {
    try {
      let solicitudes = [];

      const local = localStorage.getItem("solicitudes_" + SUCURSAL);
      if (local) {
        solicitudes = JSON.parse(local);
      } else {
        const res = await fetch(`https://backend-12-4.onrender.com/api/solicitudes?sucursal=${SUCURSAL}`, {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
          }
        });
        const data = await res.json();
        solicitudes = Array.isArray(data) ? data : [];
        localStorage.setItem("solicitudes_" + SUCURSAL, JSON.stringify(solicitudes));
      }

      // ----- Contadores por estado -----
      const total = solicitudes.length;
      const pendientes = solicitudes.filter(s => s.estado === "Pendiente").length;
      const aprobadas = solicitudes.filter(s => s.estado === "aprobada").length;
      const denegadas = solicitudes.filter(s => s.estado === "Denegada").length;

      // ----- Actualizar tarjetas -----
      if (cards.length >= 4) {
        cards[0].textContent = `${total} artículos`;
        cards[1].textContent = `${pendientes} solicitudes`;
        cards[2].textContent = `${aprobadas} solicitudes`;
        cards[3].textContent = `${denegadas} solicitudes`;
      }

      // ----- Tabla últimas 5 solicitudes -----
      if (tablaSolicitudes) {
        tablaSolicitudes.innerHTML = "";
        solicitudes
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)
          .forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${s.nombreUsuario}</td>
              <td>${new Date(s.fecha).toLocaleDateString("es-ES")}</td>
              <td>${s.estado}</td>
            `;
            tablaSolicitudes.appendChild(tr);
          });
      }

    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
    }
  }

  // ----- Carga inicial y actualización cada 10 seg -----
  cargarSolicitudes();
  setInterval(async () => {
    try {
      const res = await fetch(`https://backend-12-4.onrender.com/api/solicitudes?sucursal=${SUCURSAL}`, {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      });
      const solicitudes = await res.json();
      localStorage.setItem("solicitudes_" + SUCURSAL, JSON.stringify(solicitudes));

      cargarSolicitudes();
    } catch (error) {
      console.error("Error al actualizar solicitudes:", error);
    }
  }, 10000);

  // ----- Fecha por defecto input de solicitud -----
  const fechaInput = document.getElementById("fechaProducto");
  if (fechaInput) {
    const hoy = new Date();
    fechaInput.value = hoy.toISOString().split("T")[0];
  }
});
