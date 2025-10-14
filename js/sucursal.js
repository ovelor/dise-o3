// ==== Manejo de navegación lateral ====
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sidebar ul li[data-section]");
  const sections = document.querySelectorAll(".section");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Quitar activo de todos
      menuItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      // Mostrar solo la sección correspondiente
      const target = item.getAttribute("data-section");
      sections.forEach((sec) => {
        sec.classList.remove("active");
        if (sec.id === target) sec.classList.add("active");
      });
    });
  });
});

// ==== Simulación de envío de solicitud ====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("solicitudForm");
  const mensaje = document.getElementById("mensaje");
  const tablaHistorial = document.getElementById("tablaHistorial");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const producto = document.getElementById("producto").value.trim();
    const cantidad = document.getElementById("cantidad").value.trim();

    if (!producto || !cantidad) {
      mensaje.textContent = "⚠️ Completa todos los campos antes de enviar.";
      mensaje.style.color = "red";
      return;
    }

    // Mensaje de confirmación
    mensaje.textContent = "✅ Solicitud enviada correctamente.";
    mensaje.style.color = "green";

    // Agregar al historial visualmente
    const nuevaFila = document.createElement("tr");
    const fecha = new Date().toLocaleDateString("es-ES");

    nuevaFila.innerHTML = `
      <td>${producto}</td>
      <td>${cantidad}</td>
      <td>${fecha}</td>
      <td>Pendiente</td>
    `;

    tablaHistorial?.appendChild(nuevaFila);

    // Limpiar el formulario
    form.reset();

    // Desaparecer mensaje después de unos segundos
    setTimeout(() => {
      mensaje.textContent = "";
    }, 2000);
  });
});
