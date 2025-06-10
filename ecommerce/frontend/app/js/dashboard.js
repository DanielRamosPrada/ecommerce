document.addEventListener("DOMContentLoaded", function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = "/login.html";
    return;
  }
  if (user.rol === "ADMIN") {
    window.location.href = "/admin/panel.html";
    return;
  }
  const logoutBtn = document.getElementById('logout-btn-dropdown');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login.html";
    });
  }
  document.getElementById('user-name').textContent = user.full_name || 'No name';
  document.getElementById('user-email').textContent = user.email || '';

  // Obtener órdenes del backend y contar las del usuario
  fetch("http://127.0.0.1:8000/orders")
    .then(res => res.json())
    .then(orders => {
      const userOrders = orders.filter(order =>
        (order.user_email || order.userEmail) === user.email
      );
      document.getElementById('order-count').textContent = userOrders.length;
    })
    .catch(() => {
      document.getElementById('order-count').textContent = 0;
    });
});