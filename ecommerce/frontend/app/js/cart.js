// Obtener el carrito
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Guardar el carrito
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Agregar producto al carrito
function addToCart(product) {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log("Usuario actual:", user);
  if (!user) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    window.location.href = "/login.html";
    return;
  }
  if (user.rol === "ADMIN") {
    console.log("Entró como admin");
    alert("Los administradores no pueden agregar productos al carrito.");
    return;
  }
  let cart = getCart();
  cart.push(product);
  setCart(cart);
  updateCartBadge();
  alert("Producto agregado al carrito.");
}

// Eliminar producto del carrito (por índice)
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  updateCartBadge();
}

// Limpiar carrito
function clearCart() {
  setCart([]);
  updateCartBadge();
}

// Actualizar globito del carrito
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const cart = getCart();
  if (badge) {
    if (cart.length > 0) {
      badge.textContent = cart.length;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }
}

// Mostrar productos en el modal del carrito
function renderCartModal() {
  const cartList = document.getElementById('cart-list');
  const cart = getCart();
  cartList.innerHTML = '';
  if (cart.length === 0) {
    cartList.innerHTML = '<li class="list-group-item text-center">El carrito está vacío.</li>';
  } else {
    let total = 0;
    cart.forEach((product, idx) => {
      total += Number(product.price);
      cartList.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${product.name} <span class="fw-bold">$${product.price}</span></span>
          <button class="btn btn-sm btn-outline-danger remove-from-cart-btn" data-index="${idx}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </li>
      `;
    });
    // Mostrar total
    cartList.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center fw-bold">
        <span>Total</span>
        <span>$${total}</span>
      </li>
    `;
    // Agrega eventos a los botones de eliminar
    cartList.querySelectorAll('.remove-from-cart-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        removeFromCart(Number(this.getAttribute('data-index')));
        renderCartModal();
      });
    });
  }
  updateCartBadge();
}

// Verifica si el usuario está logueado (puedes moverla aquí si quieres)
function isUserLoggedIn() {
  return !!localStorage.getItem('user');
}

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
  updateCartBadge();

  // Mostrar productos del carrito al abrir el modal
  const cartModal = document.getElementById('cartModal');
  if (cartModal) {
    cartModal.addEventListener('show.bs.modal', renderCartModal);
  }

  // Listener para el botón de pagar
  const payBtn = document.getElementById('pay-btn');
  if (payBtn) {
    payBtn.addEventListener('click', createOrder);
  }
});

window.addToCart = addToCart;

function createOrder() {
  const user = JSON.parse(localStorage.getItem('user'));
  const cart = getCart();
  if (!user || cart.length === 0) {
    alert("No hay productos en el carrito.");
    return;
  }
  const total = cart.reduce((sum, p) => sum + Number(p.price), 0);
  const order = {
    user_email: user.email,
    items: cart,
    total: total,
    date: new Date().toISOString(),
    status: "Pendiente"
  };

  fetch("http://127.0.0.1:8000/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo guardar la orden");
      return res.json();
    })
    .then(data => {
      setCart([]);
      updateCartBadge();
      renderCartModal();
      alert("¡Orden generada con éxito!");
    })
    .catch(err => {
      alert("Error al guardar la orden.");
      console.error(err);
    });
}