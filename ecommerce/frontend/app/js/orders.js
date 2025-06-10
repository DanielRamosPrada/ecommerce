document.addEventListener("DOMContentLoaded", function() {
  fetch("http://127.0.0.1:8000/orders")
    .then(res => res.json())
    .then(orders => {
      const tbody = document.querySelector("#orders-table tbody");
      tbody.innerHTML = "";
      orders.forEach(order => {
        const items = Array.isArray(order.items)
          ? order.items
          : JSON.parse(order.items); // Por si items viene como string
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${order.id || ""}</td>
          <td>${order.user_email || order.userEmail || ""}</td>
          <td>${order.date ? new Date(order.date).toLocaleString() : ""}</td>
          <td>$${order.total}</td>
          <td>${order.status}</td>
          <td>
            <ul>
              ${items.map(item => `<li>${item.name} ($${item.price})</li>`).join("")}
            </ul>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      alert("No se pudieron cargar las órdenes.");
      console.error(err);
    });
});