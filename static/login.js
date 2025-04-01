document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.querySelector(".login-button");

  // Função de validação de login
  function validateLogin() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validar o email
    if (!validateEmail(email)) {
      document.getElementById("emailError").style.display = "block";
      return;
    } else {
      document.getElementById("emailError").style.display = "none";
    }

    // Validar a senha
    if (password.length < 4) {
      document.getElementById("passwordError").style.display = "block";
      return;
    } else {
      document.getElementById("passwordError").style.display = "none";
    }

    // Se as validações passarem, enviar os dados para a API de login
    const data = {
      email: email,
      password: password,
    };

    // Enviar para o backend
    fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          // Se o login for bem-sucedido, redirecionar
          window.location.href = "/";
        } else {
          // Caso contrário, exibir erro
          response.json().then((data) => alert(data.mensagem));
        }
      })
      .catch((error) => {
        console.error("Erro no login:", error);
        alert("Ocorreu um erro no login.");
      });
  }

  // Função para validar o email (básico)
  function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  // Adiciona o evento de clique no botão de login
  loginButton.addEventListener("click", validateLogin);
});
