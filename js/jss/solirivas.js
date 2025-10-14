document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("solicitudProductoForm");
  const mensaje = document.getElementById("mensajeProducto");

  const SUCURSAL = "rivas"; // Tu sucursal origen

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener valores
    const producto = document.getElementById("producto")?.value.trim();
    const cantidad = Number(document.getElementById("cantidad")?.value);
    const sucursalOrigen = document.getElementById("nombreSucursal")?.value.trim();
    const sucursalDestino = document.getElementById("destinoSolicitud")?.value;
    const nombreUsuario = document.getElementById("nombreUsuario")?.value.trim();
    const fecha = new Date().toISOString().split("T")[0];

    // --- Debug: ver qué valores se están tomando ---
    console.log({
      producto,
      cantidad,
      sucursalOrigen,
      sucursalDestino,
      nombreUsuario,
      fecha
    });

    // Validar campos
    if (!producto || !cantidad || !sucursalOrigen || !sucursalDestino || !nombreUsuario) {
      mensaje.textContent = "Todos los campos son obligatorios.";
      mensaje.style.color = "red";
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      mensaje.textContent = "Debes iniciar sesión para enviar la solicitud.";
      mensaje.style.color = "red";
      return;
    }

    try {
      const res = await fetch("https://backend-12-4.onrender.com/api/solicitudes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          producto,
          cantidad,
          sucursalOrigen,
          sucursalDestino,
          nombreUsuario,
          fecha
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al enviar solicitud");

      mensaje.textContent = `✅ Solicitud enviada correctamente. ID: ${data.id}`;
      mensaje.style.color = "green";

      // Limpiar formulario
      form.reset();
    } catch (error) {
      mensaje.textContent = `❌ ${error.message}`;
      mensaje.style.color = "red";
    }
  });

  // Cancelar botón
  const btnCancel = form.querySelector(".btn-cancel");
  btnCancel.addEventListener("click", () => form.reset());

  
});
