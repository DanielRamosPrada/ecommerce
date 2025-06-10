document.addEventListener("DOMContentLoaded", function() {
  fetch("http://127.0.0.1:8000/users")
    .then(res => res.json())
    .then(users => {
      const tbody = document.getElementById("users-body");
      tbody.innerHTML = "";
      users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.id}</td>
          <td>${user.full_name || ""}</td>
          <td>${user.gender || ""}</td>
          <td>${user.email}</td>
          <td>${user.rol}</td>
          <td>
            <!-- Aquí puedes poner botones de editar/eliminar si quieres -->
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      const tbody = document.getElementById("users-body");
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">No se pudieron cargar los usuarios.</td></tr>`;
      console.error(err);
    });
});