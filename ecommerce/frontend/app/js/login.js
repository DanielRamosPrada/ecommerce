document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Credenciales incorrectas.");
        return;
      }

      // Suponiendo que la respuesta es { user: { email, rol } }
      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.rol === "ADMIN") {
        window.location.href = "/admin/panel.html"; // Cambia por la ruta real de tu panel admin
      } else {
        window.location.href = "/user/dashboard.html";
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  });
});