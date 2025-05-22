// Função para alternar a visibilidade da senha
function togglePassword() {
  let passwordField = document.getElementById("password"); // Seleciona o campo de senha
  let toggleText = document.querySelector(".toggle-password"); // Seleciona o botão de alternância

  // Alterna entre senha visível e oculta
  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleText.textContent = "Ocultar senha";
  } else {
    passwordField.type = "password";
    toggleText.textContent = "Mostrar senha";
  }
}

// Função para validar o login
function validateLogin() {
  let email = document.getElementById("email").value.trim(); // Obtém o e-mail removendo espaços extras
  let password = document.getElementById("password").value.trim(); // Obtém a senha removendo espaços extras
  let emailError = document.getElementById("emailError"); // Elemento da mensagem de erro do e-mail
  let passwordError = document.getElementById("passwordError"); // Elemento da mensagem de erro da senha
  let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expressão regular para validar e-mail

  // Resetando mensagens de erro antes da validação
  emailError.style.display = "none";
  passwordError.style.display = "none";

  let isValid = true; // Variável para saber se o formulário é válido

  // Validação do e-mail
  if (!email.match(emailPattern)) {
    emailError.style.display = "block"; // Mostra a mensagem de erro
    isValid = false;
  }

  // Validação da senha (mínimo de 3 caracteres)
  if (password.length < 3) {
    passwordError.style.display = "block"; // Mostra a mensagem de erro
    isValid = false;
  }

  // Se a validação do e-mail e da senha for bem-sucedida, envia os dados para o back-end
  if (isValid) {
    // Envia os dados para o back-end
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Exibe a resposta completa do servidor
      if (data.mensagem === 'Login realizado!') {
        alert("Login realizado com sucesso!");
        window.location.href = '/'; // Redireciona para a página de dashboard
      } else {
        passwordError.textContent = data.mensagem; // Exibe a mensagem de erro do servidor
        passwordError.style.display = "block";
      }
    })
    .catch(error => {
      console.error('Erro ao realizar login:', error);
      passwordError.textContent = "Ocorreu um erro ao tentar fazer login.";
      passwordError.style.display = "block";
    });
  }
}
