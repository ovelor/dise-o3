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

    const data = await res.json(); // parsea directo

    if (!res.ok) {
      alert(data.error || 'Error al iniciar sesión');
      return;
    }

    // Guardar token y rol/sucursal
    localStorage.setItem('token', data.token || '');
    localStorage.setItem('rol', data.rol || '');
    localStorage.setItem('sucursalSeleccionada', data.sucursalId || '');

    // Redirigir según rol/sucursal
    if (data.rol === 'admin' || (data.sucursalId && data.sucursalId.toLowerCase().includes('casa matriz'))) {
      window.location.href = './admin/admin.html';
    } else if (data.rol === 'user' && data.sucursalId) {
      const sucursalHTML = data.sucursalId.trim().toLowerCase().replace(/\s+/g, '-');
      window.location.href = `./sucursales/${sucursalHTML}.html`;
    } else {
      alert('No se pudo determinar tu rol o sucursal. Verifica tus datos.');
    }

  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    alert('No se pudo conectar con el servidor. Intenta más tarde.');
  }
});
