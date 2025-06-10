window.addEventListener("DOMContentLoaded", async () => {
  const totalProducts = document.getElementById("total-products");
  const totalUsers = document.getElementById("total-users");
  const totalOrders = document.getElementById("total-orders");

  try {
    const [productsRes, usersRes, ordersRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/products"),
      fetch("http://127.0.0.1:8000/users"),
      fetch("http://127.0.0.1:8000/orders")
    ]);

    const products = await productsRes.json();
    const users = await usersRes.json();
    const orders = await ordersRes.json();

    if (totalProducts) totalProducts.textContent = products.length;
    if (totalUsers) totalUsers.textContent = users.length;
    if (totalOrders) totalOrders.textContent = orders.length;
  } catch (error) {
    console.error("Error cargando datos del panel:", error);
  }
});

// Cerrar sesión desde el dropdown
document.addEventListener("DOMContentLoaded", function() {
  const logoutBtn = document.getElementById('logout-btn-dropdown');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login.html";
    });
  }
});

document.addEventListener("DOMContentLoaded", function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.rol !== "ADMIN") {
    window.location.href = "/login.html";
    return;
  }
});
