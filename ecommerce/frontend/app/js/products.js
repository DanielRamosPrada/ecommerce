const API_URL = "http://127.0.0.1:8000/products";

// Nombres en inglés para variables y funciones
const tbody = document.getElementById("product-body");
const form = document.getElementById("product-form");

// Mostrar productos al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
  if (tbody) await listProducts();
  if (form) form.addEventListener("submit", saveProduct);
});

// Validación en el frontend antes de enviar el producto
function validateProduct(product) {
  if (
    !product.name.trim() ||
    product.size <= 0 ||
    product.quantity < 0 ||
    product.price <= 0 ||
    !isValidUrl(product.img_url)
  ) {
    showFeedback("Por favor, completa todos los campos correctamente.", "danger");
    return false;
  }
  return true;
}

// Función para mostrar feedback visual con Bootstrap
function showFeedback(message, type = "info") {
  let alertDiv = document.getElementById("form-feedback");
  if (!alertDiv) {
    alertDiv = document.createElement("div");
    alertDiv.id = "form-feedback";
    form.parentNode.insertBefore(alertDiv, form);
  }
  alertDiv.innerHTML = `<div class="alert alert-${type} my-2">${message}</div>`;
  setTimeout(() => {
    alertDiv.innerHTML = "";
  }, 3000);
}

// Validación de URL simple
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Renderizado optimizado de la tabla de productos
async function listProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("No se pudieron obtener los productos");
    const products = await res.json();

    const rows = products.map(prod => `
      <tr>
        <td>${prod.id}</td>
        <td><img src="${prod.img_url}" width="50" alt="Imagen de ${prod.name}" /></td>
        <td>${prod.name}</td>
        <td>${prod.gender}</td>
        <td>${prod.size}</td>
        <td>${prod.quantity}</td>
        <td>$${prod.price.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editProduct('${prod.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${prod.id}')">Eliminar</button>
        </td>
      </tr>
    `).join("");
    tbody.innerHTML = rows;
  } catch (error) {
    showFeedback("Error al cargar productos: " + error.message, "danger");
  }
}

// Guardar (crear o actualizar) producto con validación y feedback
async function saveProduct(e) {
  e.preventDefault();

  // Elimina el campo id del objeto enviado al backend
  const product = {
    name: form.name.value,
    gender: form.gender.value, // <-- agrega esta línea
    size: parseInt(form.size.value),
    quantity: parseInt(form.quantity.value),
    price: parseFloat(form.price.value),
    img_url: form.img_url.value
  };

  if (!validateProduct(product)) return;

  // Solo usa PUT si estás editando, y POST para crear
  const isEditing = form.dataset.editing === "true";
  // Solo agrega el id en la URL si es edición, nunca en el objeto enviado
  const url = isEditing ? `${API_URL}/${form.dataset.editId}` : API_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });

    const data = await res.json();
    showFeedback(data.message || "Producto guardado correctamente.", "success");

    form.reset();
    form.dataset.editing = "false";
    form.dataset.editId = "";
    await listProducts();
  } catch (error) {
    showFeedback("Error al guardar producto: " + error.message, "danger");
  }
}

// Editar producto: carga los datos en el formulario y activa modo edición
window.editProduct = function(id) {
  fetch(API_URL)
    .then(res => res.json())
    .then(products => {
      const prod = products.find(p => p.id === id);
      if (!prod) return;

      // No se usa el campo id en el formulario
      form.name.value = prod.name;
      form.size.value = prod.size;
      form.quantity.value = prod.quantity;
      form.price.value = prod.price;
      form.img_url.value = prod.img_url;
      form.dataset.editing = "true";
      form.dataset.editId = prod.id; // Guardar el id para PUT
      showFeedback("Editando producto ID " + prod.id, "warning");
    });
};

// Eliminar producto con confirmación y feedback visual
window.deleteProduct = async function(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });
    const data = await res.json();
    showFeedback(data.message || "Producto eliminado.", "success");
    await listProducts();
  } catch (error) {
    showFeedback("Error al eliminar producto: " + error.message, "danger");
  }
};

/*
MEJORAS APLICADAS:
1. Todos los nombres de variables y funciones están en inglés para mantener consistencia y buenas prácticas.
2. El renderizado de la tabla es más eficiente usando un array y un solo innerHTML.
3. Se agregó validación básica de los campos antes de enviar el producto.
4. Se implementó feedback visual con Bootstrap alerts en vez de alert().
5. Se agregó una función para validar URLs.
6. El manejo de errores es más robusto y muestra mensajes claros al usuario.
7. Los botones Editar y Eliminar ahora usan funciones globales y feedback visual.
8. El código es más modular y fácil de mantener.
*/

