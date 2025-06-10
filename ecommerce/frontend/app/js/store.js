const API_URL = "http://127.0.0.1:8000/products";

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 12;

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();

  // Filtro por género y búsqueda por nombre
  document.getElementById("filter-form").addEventListener("submit", function (e) {
    e.preventDefault();
    currentPage = 1;
    applyFilters();
  });
});

function fetchProducts() {
  fetch(API_URL)
    .then(response => response.json())
    .then(products => {
      allProducts = products;
      filteredProducts = products;
      renderProducts(filteredProducts, currentPage);
      renderPagination(filteredProducts.length, currentPage);
    })
    .catch(error => {
      document.getElementById("products").innerHTML = `
        <div class="col">
          <div class="alert alert-danger">No se pudieron cargar los productos.</div>
        </div>
      `;
    });
}

function applyFilters() {
  const gender = document.getElementById("filter-gender").value;
  const search = document.getElementById("search-product").value.trim().toLowerCase();

  filteredProducts = allProducts;

  if (gender !== "all") {
    filteredProducts = filteredProducts.filter(product => (product.gender || "").toLowerCase() === gender.toLowerCase());
  }

  if (search) {
    filteredProducts = filteredProducts.filter(product => product.name.toLowerCase().includes(search));
  }

  renderProducts(filteredProducts, currentPage);
  renderPagination(filteredProducts.length, currentPage);
}

// Función para verificar si el usuario está logueado
function isUserLoggedIn() {
  // Cambia esto según cómo guardes el login (token, usuario, etc.)
  return !!localStorage.getItem('user');
}

// Renderizar productos (ejemplo)
function renderProducts(products, page = 1) {
  const productsSection = document.getElementById("products");
  productsSection.innerHTML = "";

  if (!products.length) {
    productsSection.innerHTML = `
      <div class="col">
        <div class="alert alert-info">No hay productos disponibles.</div>
      </div>
    `;
    renderPagination(0, 1);
    return;
  }

  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const productsToShow = products.slice(start, end);

  productsToShow.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card h-100">
        <img src="${product.img_url || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-muted mb-1">Talla: ${product.size} | ${product.gender ? `Género: ${product.gender}` : ''}</p>
          <p class="card-text text-muted mb-1">Stock: ${product.quantity}</p>
          <p class="card-text fw-bold text-primary mb-2">$${product.price}</p>
          <button class="btn btn-primary btn-sm mt-auto add-to-cart-btn">Agregar al carrito</button>
        </div>
      </div>
    `;
    // Evento para agregar al carrito
    col.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product));
    productsSection.appendChild(col);
  });
}

// Mostrar productos del carrito en el modal
document.addEventListener("DOMContentLoaded", function() {
  const cartModal = document.getElementById('cartModal');
  const cartList = document.getElementById('cart-list');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', createOrder);
  }
});

function renderProducts(products, page) {
  const productsSection = document.getElementById("products");
  productsSection.innerHTML = "";

  if (!products.length) {
    productsSection.innerHTML = `
      <div class="col">
        <div class="alert alert-info">No hay productos disponibles.</div>
      </div>
    `;
    renderPagination(0, 1);
    return;
  }

  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const productsToShow = products.slice(start, end);

  productsToShow.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card h-100">
        <img src="${product.img_url || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-muted mb-1">Talla: ${product.size} | ${product.gender ? `Género: ${product.gender}` : ''}</p>
          <p class="card-text text-muted mb-1">Stock: ${product.quantity}</p>
          <p class="card-text fw-bold text-primary mb-2">$${product.price}</p>
          <button class="btn btn-primary btn-sm mt-auto add-to-cart-btn">Agregar al carrito</button>
        </div>
      </div>
    `;
    // Evento para agregar al carrito
    col.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product));
    productsSection.appendChild(col);
  });
}

function renderPagination(totalProducts, page) {
  let paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) {
    paginationContainer = document.createElement("nav");
    paginationContainer.id = "pagination";
    paginationContainer.className = "d-flex justify-content-center mt-4";
    document.querySelector(".main-store .container").appendChild(paginationContainer);
  }
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  let paginationList = `<ul class="pagination">`;

  // Previous button
  paginationList += `
    <li class="page-item${page === 1 ? " disabled" : ""}">
      <a class="page-link" href="#" data-page="${page - 1}">&laquo;</a>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationList += `
      <li class="page-item${i === page ? " active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // Next button
  paginationList += `
    <li class="page-item${page === totalPages ? " disabled" : ""}">
      <a class="page-link" href="#" data-page="${page + 1}">&raquo;</a>
    </li>
  `;

  paginationList += `</ul>`;
  paginationContainer.innerHTML = paginationList;

  // Event listeners for pagination
  paginationContainer.querySelectorAll(".page-link").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const selectedPage = Number(this.getAttribute("data-page"));
      if (selectedPage >= 1 && selectedPage <= totalPages && selectedPage !== page) {
        currentPage = selectedPage;
        renderProducts(filteredProducts, currentPage);
        renderPagination(filteredProducts.length, currentPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function() {
  // Mostrar/ocultar opciones del dropdown según login
  const loggedIn = !!localStorage.getItem('user');
  const dropdownLoggedIn = document.getElementById('dropdown-logged-in');
  const dropdownLoggedOut = document.getElementById('dropdown-logged-out');

  if (dropdownLoggedIn && dropdownLoggedOut) {
    if (loggedIn) {
      dropdownLoggedIn.style.display = "block";
      dropdownLoggedOut.style.display = "none";
    } else {
      dropdownLoggedIn.style.display = "none";
      dropdownLoggedOut.style.display = "block";
    }
  }

  // Lógica para cerrar sesión
  const logoutBtn = document.getElementById('logout-btn-dropdown');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login.html";
    });
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const backBtn = document.getElementById('back-to-panel');
  if (user && backBtn) {
    backBtn.classList.remove('d-none');
    if (user.rol === "ADMIN") {
      backBtn.textContent = "Volver al Panel";
      backBtn.href = "/admin/panel.html";
    } else {
      backBtn.textContent = "Volver al Dashboard";
      backBtn.href = "/user/dashboard.html";
    }
  }
});