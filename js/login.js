document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('https://backend-12-4.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Respuesta no es JSON:", text);
      alert('Error: el servidor no devolvió datos válidos');
      return;
    }

    console.log("Respuesta backend:", data); // 🔍 depuración

    if (!res.ok) {
      alert(data.error || 'Error al iniciar sesión');
      return;
    }

    // Guardar token si existe
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    // Revisar rol y sucursal
    if (data.rol === 'admin' || (data.sucursalId && data.sucursalId.toLowerCase().includes('casa matriz'))) {
      // Admin o Casa Matriz
      window.location.href = 'admin/admin.html';
    } else if (data.rol === 'user' && data.sucursalId) {
      // Usuario normal → redirige a su sucursal
      const sucursalHTML = data.sucursalId.trim().toLowerCase().replace(/\s+/g, '-');
      window.location.href = `sucursales/${sucursalHTML}.html`;
    } else if (!data.rol || !data.sucursalId) {
      // Falta información importante
      alert('No se pudo determinar tu rol o sucursal. Verifica tus datos.');
    } else {
      // Rol desconocido
      alert('Rol desconocido. Contacta al administrador.');
    }

  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    alert('No se pudo conectar con el servidor. Intenta más tarde.');
  }
});
