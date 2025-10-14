document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalUsuario");
  const abrirBtn = document.getElementById("btnNuevoUsuario");
  const cerrarBtn = document.getElementById("cerrarModal");
  const cancelarBtn = document.getElementById("cancelarUsuario");
  const form = modal.querySelector("form");
  const tbody = document.querySelector("table tbody");
  const searchBar = document.querySelector(".search-bar");
  const selectSucursal = document.getElementById("selectSucursal");

  // Cache de usuarios
  let usuariosCache = [];

  // --- Modal ---
  abrirBtn.onclick = () => { modal.style.display = "flex"; };
  cerrarBtn.onclick = cancelarBtn.onclick = () => { modal.style.display = "none"; };
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

  // --- Renderizar tabla ---
  const renderUsuarios = (users) => {
    tbody.innerHTML = "";
    users.forEach(user => {
      tbody.innerHTML += `
        <tr>
          <td>${user.nombre}</td>
          <td>${user.email}</td>
          <td>${user.rol}</td>
          <td>${user.sucursalId}</td>
        </tr>
      `;
    });
  };

  // --- Guardar en localStorage ---
  const guardarLocal = () => {
    localStorage.setItem("usuariosCache", JSON.stringify(usuariosCache));
  };

  // --- Cargar usuarios desde backend ---
  const cargarUsuariosBackend = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://backend-12-4.onrender.com/api/users", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      usuariosCache = data;
      renderUsuarios(usuariosCache);
      guardarLocal();
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar usuarios desde el servidor");
    }
  };

  // --- Cargar usuarios (del localStorage si existe) ---
  const cargarUsuarios = () => {
    const cache = localStorage.getItem("usuariosCache");
    if (cache) {
      usuariosCache = JSON.parse(cache);
      renderUsuarios(usuariosCache);
    } else {
      cargarUsuariosBackend();
    }
  };

  // --- Crear nuevo usuario ---
  form.onsubmit = async (e) => {
    e.preventDefault();
    const nombre = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const rol = form.querySelector('select').value;
    const sucursalId = selectSucursal.value;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://backend-12-4.onrender.com/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, email, password, rol, sucursalId })
      });
      if (!res.ok) throw new Error("Error al crear usuario");
      await res.json();

      usuariosCache.push({ nombre, email, rol, sucursalId });
      renderUsuarios(usuariosCache);
      guardarLocal();

      modal.style.display = "none";
      form.reset();
    } catch (error) {
      console.error(error);
      alert("No se pudo crear el usuario");
    }
  };

  // --- Barra de búsqueda ---
  searchBar.addEventListener("input", () => {
    const query = searchBar.value.toLowerCase();
    const filtrados = usuariosCache.filter(user =>
      user.nombre.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.rol.toLowerCase().includes(query)
    );
    renderUsuarios(filtrados);
  });

  // --- Actualizar cada 10 segundos ---
  setInterval(cargarUsuariosBackend, 3000); // 10000ms = 10s

  // --- Inicializar ---
  cargarUsuarios();
});
