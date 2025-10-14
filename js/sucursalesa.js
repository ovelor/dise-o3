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

  const SUCURSAL = "carazo";
  const STORAGE_KEY = "solicitudes_" + SUCURSAL;

  // ----- Función para renderizar solicitudes -----
  function renderizarSolicitudes(solicitudes) {
    const total = solicitudes.length;
    const pendientes = solicitudes.filter(s => s.estado === "Pendiente").length;
    const aprobadas = solicitudes.filter(s => s.estado === "aprobada").length;
    const denegadas = solicitudes.filter(s => s.estado === "Denegada").length;

    // Actualizar tarjetas
    if (cards.length >= 4) {
      cards[0].textContent = `${total} artículos`;
      cards[1].textContent = `${pendientes} solicitudes`;
      cards[2].textContent = `${aprobadas} solicitudes`;
      cards[3].textContent = `${denegadas} solicitudes`;
    }

    // Actualizar tabla
    if (tablaSolicitudes) {
      tablaSolicitudes.innerHTML = "";
      solicitudes
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5)
        .forEach(s => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${s.nombreUsuario || "-"}</td>
            <td>${new Date(s.fecha).toLocaleDateString("es-ES")}</td>
            <td>${s.estado}</td>
          `;
          tablaSolicitudes.appendChild(tr);
        });
    }
  }

  // ----- Cargar solicitudes desde backend -----
  async function cargarSolicitudes(forceUpdate = false) {
    try {
      let solicitudes = [];
      const local = localStorage.getItem(STORAGE_KEY);

      if (local && !forceUpdate) {
        solicitudes = JSON.parse(local);
        console.log("📦 Cargando solicitudes desde localStorage:", solicitudes.length);
      }

      console.log("🌐 Consultando backend...");
      const res = await fetch(`https://backend-12-4.onrender.com/api/solicitudes?sucursal=${SUCURSAL}`, {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      });

      if (!res.ok) throw new Error("Error al obtener solicitudes del backend");

      const data = await res.json();
      if (Array.isArray(data)) {
        solicitudes = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log("✅ LocalStorage sincronizado con backend:", data.length);
      } else {
        console.warn("⚠️ Respuesta inesperada del backend:", data);
      }

      renderizarSolicitudes(solicitudes);
    } catch (error) {
      console.error("❌ Error al cargar solicitudes:", error);
    }
  }

  // ----- Carga inicial y actualización automática -----
  cargarSolicitudes(true);
  setInterval(() => cargarSolicitudes(true), 2000);

  // ----- Fecha por defecto input de solicitud -----
  const fechaInput = document.getElementById("fechaProducto");
  if (fechaInput) {
    const hoy = new Date();
    fechaInput.value = hoy.toISOString().split("T")[0];
  }
});
