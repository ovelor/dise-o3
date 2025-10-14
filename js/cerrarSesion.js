function cerrarSesion() {
  fetch("https://backend-12-4.onrender.com/api/auth/logout", {
    method: "POST", // Tu endpoint usa POST
    headers: {
      "Content-Type": "application/json",
      // Si guardas token JWT en localStorage
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log(data.message); // "Sesión cerrada"
      // Limpiar datos locales
      localStorage.removeItem("token");
      // Redirigir a login
      window.location.href = "/login.html";
    })
    .catch(err => console.error("Error cerrando sesión:", err));
}
