// static/cadastro.js

document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("input");
  const nome = document.getElementById("user-nome").textContent;
  const permissao = document.getElementById("user-permissao").textContent;
  const funcao = document.getElementById("user-funcao").textContent;

  // Avançar para o próximo input ao pressionar Enter
  inputs.forEach((input, index) => {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        // Verifica se é o campo de email e se está válido
        if (
          input.placeholder === "Digite o Email" &&
          !validarEmail(input.value.trim())
        ) {
          event.preventDefault();
          alert("Por favor, insira um email válido. Exemplo: nome@empresa.com");
          input.focus();
          return;
        }

        event.preventDefault();
        const nextInput = inputs[index + 1];
        if (nextInput) nextInput.focus();
      }
    });
  });

  // Função para validar email
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email);
  }

  // Função para validar matrícula
  function validarMatricula(matricula) {
    const matriculaInt = parseInt(matricula, 10);
    return !isNaN(matriculaInt) && matriculaInt > 0; // Verifica se é um número válido e positivo
  }

  // Configuração de dropdowns
  function configurarDropdown(inputSelector, opcoes) {
    const input = document.querySelector(inputSelector);
    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");
    dropdown.style.display = "none";
    dropdown.style.position = "absolute";
    dropdown.style.background = "white";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.zIndex = "1000";
    dropdown.style.width = input.offsetWidth + "px";

    opcoes.forEach((opcao) => {
      const item = document.createElement("div");
      item.textContent = opcao;
      item.style.padding = "8px";
      item.style.cursor = "pointer";
      item.addEventListener("click", () => {
        input.value = opcao;
        dropdown.style.display = "none";
      });
      dropdown.appendChild(item);
    });

    input.parentNode.appendChild(dropdown);
    input.addEventListener("focus", () => (dropdown.style.display = "block"));
    input.addEventListener("blur", () => {
      setTimeout(() => (dropdown.style.display = "none"), 200);
    });
  }

  configurarDropdown("input[placeholder='Digite a função']", [
    "Administração",
    "Atendente",
    "Financeiro",
  ]);
  configurarDropdown("input[placeholder='Digite o tipo de conta']", [
    "Gerente",
    "Usuário",
  ]);

  // Validação de senhas
  const senhaInput = document.querySelector("input[placeholder='Digite a senha']");
  const confirmarSenhaInput = document.querySelector("input[placeholder='Confirme a senha']");

  confirmarSenhaInput.addEventListener("input", function () {
    confirmarSenhaInput.style.borderColor =
      senhaInput.value === confirmarSenhaInput.value ? "green" : "red";
  });

  // Força da senha
  senhaInput.addEventListener("input", function () {
    let forcaSenha = document.getElementById("forca-senha");
    if (!forcaSenha) {
      forcaSenha = document.createElement("div");
      forcaSenha.id = "forca-senha";
      senhaInput.parentNode.appendChild(forcaSenha);
    }

    const senha = senhaInput.value;
    let nivel = "Fraca";

    if (senha.length >= 8 && /[A-Z]/.test(senha) && /\d/.test(senha)) {
      nivel = "Média";
    }
    if (senha.length >= 12 && /[@$!%*?&]/.test(senha)) {
      nivel = "Forte";
    }

    forcaSenha.textContent = "Força da senha: " + nivel;
    forcaSenha.style.color =
      nivel === "Forte" ? "green" : nivel === "Média" ? "orange" : "red";
  });

  // Botão salvar + validação de email e matrícula
  const salvarBtn = document.querySelector(".salvar");
  const emailInput = document.querySelector("input[placeholder='Digite o Email']");
  const matriculaInput = document.querySelector("input[placeholder='Digite a matrícula']");

  salvarBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Coleta todos os valores do formulário
    const nome = document.querySelector("input[placeholder='Digite o nome completo']").value;
    const matricula = matriculaInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const confirm_password = confirmarSenhaInput.value;

    // Coleta permissao e funcao
    const permissao = document.querySelector("input[placeholder='Digite o tipo de conta']").value;
    const funcao = document.querySelector("input[placeholder='Digite a função']").value;

    // Valida o email
    if (!validarEmail(email)) {
      alert("Por favor, insira um email válido.");
      emailInput.focus();
      return;
    }

    // Valida a matrícula
    if (!validarMatricula(matricula)) {
      alert("Por favor, insira uma matrícula válida.");
      matriculaInput.focus();
      return;
    }

    // Verifica se permissao e funcao não são vazios
    if (!permissao || !funcao) {
      alert("Por favor, preencha todos os campos de tipo de conta e função.");
      return;
    }

    // Se passou em todas as validações, envia os dados via fetch()
    salvarBtn.textContent = "Salvando...";
    salvarBtn.style.opacity = "0.7";

    const formData = {
      nome: nome,
      matricula: matricula,
      email: email,
      senha: senha,
      confirm_password: confirm_password,
      permissao: permissao,  // Assegura que a permissão está sendo enviada
      funcao: funcao         // Assegura que a função está sendo enviada
    };

    // Envia os dados via fetch() com Content-Type como application/json
    fetch("/registrar", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json' // Define que os dados são JSON
      },
      body: JSON.stringify(formData)  // Converte os dados para JSON
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Resposta do servidor:", data);  // Log da resposta para ver o que está sendo retornado
      if (data.mensagem === "Usuário registrado com sucesso!") {
        alert(data.mensagem);
        window.location.href = "/cadastro"; // Redireciona após o cadastro
      } else {
        alert("Erro ao registrar usuário.");
      }
    })
    .catch((error) => {
      console.error("Erro no fetch:", error);
      alert("Ocorreu um erro ao tentar registrar o usuário.");
      salvarBtn.textContent = "Salvar";
      salvarBtn.style.opacity = "1";
    });
  });

  // Função para validar email com domínio
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email);
  }

  // Função para validar a matrícula
  function validarMatricula(matricula) {
    const matriculaInt = parseInt(matricula, 10);
    return !isNaN(matriculaInt) && matriculaInt > 0;  // Verifica se é um número válido e positivo
  }

  // Dados do Usuário logado (informações passadas do backend)
  const userData = {
    nome: nome,
    permissao: permissao,
    funcao: funcao
  };

  document.getElementById("user-nome").textContent = userData.nome;
  document.getElementById("user-permissao").textContent = userData.tipo;
  document.getElementById("user-funcao").textContent = userData.funcao;
});
