document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-register");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const userData = {
      full_name: name,
      email,
      password
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Error al crear el usuario.");
        return;
      }

      alert("Usuario creado exitosamente. Ahora puedes iniciar sesión.");
      window.location.href = "login.html";
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  });
});

