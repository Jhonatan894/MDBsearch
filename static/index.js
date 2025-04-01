document.addEventListener("DOMContentLoaded", function () {
  const uploadInput = document.getElementById("upload"); // Input de upload de arquivo
  const cpfPopup = document.getElementById("cpf-popup"); // Pop-up de CPF
  const cpfSubmit = document.getElementById("cpf-submit"); // Botão de enviar CPF
  const cpfExit = document.getElementById("cpf-exit"); // Botão de sair do pop-up
  const topicsContainer = document.getElementById("topics-container"); // Container onde os tópicos serão exibido
  const logoutButton = document.querySelector('.logout-btn');
  const searchPopup = document.getElementById("search-popup");// Pop-up de SEARCH
  const searchButton = document.getElementById("Search");// Search para pesquisar informações
  const searchSubmit = document.getElementById("search-submit"); // ✅ CORRETO
  const searchExit = document.getElementById("search-exit");// Botão de sair do pop-up search
  const searchInput = document.getElementById("search-input");//ONDE DIGITA PESQUISA
  let csvData = []; // Armazenará os dados do CSV





  // Função para enviar o arquivo para o backend Flask
  function sendFileToBackend(file) {
    console.log("Arquivo selecionado:", file); // Verifica se o arquivo está certo

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
      credentials: "include",  // Envia os cookies da sessão
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Resposta do servidor:", data); // Verificar resposta do backend
        if (data.mensagem === "Arquivo recebido") {
          alert("Arquivo carregado com sucesso!");
          cpfPopup.style.display = "block"; // Exibe o pop-up de CPF
        } else {
          alert("Erro no upload do arquivo.");
        }
      })
      .catch((error) => console.error("Erro ao enviar arquivo:", error));
  }




//DESLOGANDO
  logoutButton.addEventListener("click", function () {
    // Envia a requisição POST para a rota de logout
    fetch("/logout", {
      method: "POST",
    })
    .then(response => {
      if (response.ok) {
        window.location.href = "/login";
      } else {
        alert("Erro ao fazer logout.");
      }
    })
    .catch(error => {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao fazer logout.");
    });
  });

  

  // Evento disparado quando um arquivo é selecionado no input de upload
  uploadInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      sendFileToBackend(this.files[0]); // Envia o arquivo ao backend
    }
  });






  // Evento para quando o botão de enviar CPF for clicado
  cpfSubmit.addEventListener("click", function () {
    const cpfInput = document.getElementById("cpf-input").value;

    if (cpfInput) {
      cpfPopup.style.display = "none"; // Fecha o pop-up de CPF
      fetchDataForCPF(cpfInput); // Envia o CPF para buscar os dados
    } else {
      alert("Por favor, insira um CPF válido.");
    }
  });

  // Fechar o pop-up de CPF
  cpfExit.addEventListener("click", function () {
    cpfPopup.style.display = "none";
  });







  // Função para buscar os dados do CPF
  function fetchDataForCPF(cpf) {
    console.log("Buscando dados para o CPF:", cpf); // Verifica qual CPF está sendo pesquisado

    fetch("http://127.0.0.1:5000/buscar_cpf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: cpf }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Dados recebidos do servidor:", data); // Verifica a resposta do servidor

        if (data.error) {
          alert("CPF não encontrado.");
        } else if (data.multiple) {
          if (Array.isArray(data.options) && data.options.length > 0) {
            console.log("Multiplos CPF encontrados, exibindo pop-up...");
            showCpfSelectionPopup(data.options);
        } else {
          console.error("Erro: 'options' está vazio ou indefinido.", data);
        }
      } else {
        console.log("Registro único encontrado, exibindo dados...");
        displayPersonData(data);
      }
      })
      .catch((error) => console.error("Erro ao buscar CPF:", error));
  }





  // FUNÇÃO QUANDO TEM MAIS DE 1 CPF IGUAL
  function showCpfSelectionPopup(options) {
    let oldPopup = document.querySelector(".cpf-selection-popup");
    if (oldPopup) oldPopup.remove();

    let popup = document.createElement("div");
    popup.classList.add("cpf-selection-popup");

    let title = document.createElement("h3");
    title.innerHTML = "CPF DUPLICADO<br>Selecione um CPF:";
    popup.appendChild(title);

    options.forEach((person) => {
      let button = document.createElement("button");
      button.textContent = `Nome: ${person.Nome} | Email: ${person.email}`;
      button.addEventListener("click", () => {
        popup.remove();
        displayPersonData(person);
      });
      popup.appendChild(button);
    });

    let closeButton = document.createElement("button");
    closeButton.textContent = "Fechar";
    closeButton.classList.add("close-btn");
    closeButton.addEventListener("click", () => popup.remove());
    popup.appendChild(closeButton);

    document.body.appendChild(popup);
  }





  // Função para exibir os dados da pessoa
  function displayPersonData(data) {
    topicsContainer.innerHTML = "";

    const personInfo = document.createElement("div");
    personInfo.classList.add("person-info");

    personInfo.innerHTML = `
      <h3>Informações do CPF ${data.CPF}</h3>
      <p><strong>Nome:</strong> ${data.Nome}</p>
      <p><strong>CPF:</strong> ${data.CPF}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefone:</strong> ${data.telefone}</p>
    `;

    topicsContainer.appendChild(personInfo);

    document.querySelector(".side-panel").classList.add("visible");
    document.querySelector(".topics-container").style.display = "flex";
  }

  






  //PESQUISA
  //abre o pop-up
  searchButton.addEventListener("click", () => {
    searchPopup.style.display = "block";
});

// Fechar pop-up 
searchExit.addEventListener("click", () => {
    searchPopup.style.display = "none";
});

// pesquisar dados ao clicar em "Enviar"
searchSubmit.addEventListener("click", function () {
  
  const query = searchInput.value.trim(); // Pega o CPF digitado

    if (!query) {
        alert("Digite um CPF para pesquisar.");
        return;
    }

    fetch(`http://127.0.0.1:5000/search?query=${query}`, {
        method: "GET",
        credentials: "include",
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("Resposta do servidor:", data); // 🔍 LOG PARA DEBUG

        if (data.error) {
            alert(data.error);
            return;
        }

        if (data.multiple) {
            if (!data.options || !Array.isArray(data.options)) {  
                console.error("Erro: 'options' não definido ou não é um array", data);
                return;
            }
            console.log("Múltiplos CPFs encontrados, exibindo pop-up...");
            showCpfSelectionPopup(data.options);
        } else {
            console.log("Registro único encontrado, exibindo dados...");
            displayPersonData(data); // Não usa `data[0]`, pois já é um objeto
        }

        searchPopup.style.display = "none"; // Fecha o pop-up após a busca
    })
    .catch((error) => console.error("Erro ao buscar CPF:", error));
});


});
