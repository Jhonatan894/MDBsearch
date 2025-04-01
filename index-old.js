document.addEventListener("DOMContentLoaded", function () {
  const uploadInput = document.getElementById("upload"); // Input de upload de arquivo
  const cpfPopup = document.getElementById("cpf-popup"); // Pop-up de CPF
  const cpfSubmit = document.getElementById("cpf-submit"); // Botão de enviar CPF
  const cpfExit = document.getElementById("cpf-exit"); // Botão de sair do pop-up
  const sidePanel = document.getElementById("side-panel"); // Container onde os tópicos serão exibidos
  let csvData = []; // Armazenará os dados do CSV

  // Função para enviar o arquivo para o backend Flask
  function sendFileToBackend(file) {
    console.log("Arquivo selecionado:", file); // Verifica se o arquivo está certo

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://127.0.0.1:5000/upload", { // Certifique-se de que é POST
        method: "POST",  
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do servidor:", data); // Verificar resposta do backend
        if (data.message === "Arquivo recebido com sucesso") {
            alert("Arquivo carregado com sucesso!");
            cpfPopup.style.display = "block"; // Exibe o pop-up de CPF
        } else {
            alert("Erro no upload do arquivo.");
        }
    })
    .catch(error => console.error("Erro ao enviar arquivo:", error));
  }

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

  // Função para buscar os dados do CPF
  function fetchDataForCPF(cpf) {
    console.log("Buscando dados para o CPF:", cpf); // Verifica qual CPF está sendo pesquisado

    fetch("http://127.0.0.1:5000/buscar_cpf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: cpf })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Dados recebidos do servidor:", data); // Verifica a resposta do servidor
      if (data.error) {
        alert("CPF não encontrado.");
      } else {
        displayPersonData(data); // Exibe os dados da pessoa
      }
    })
    .catch(error => console.error("Erro ao buscar CPF:", error));
  }

  // Função para exibir os dados da pessoa
  function displayPersonData(data) {
    // Limpa a tela para exibir os novos dados
    sidePanel.innerHTML = '';

    const personInfo = document.createElement("div");
    personInfo.classList.add("person-info");

    // Cria um conteúdo com as informações da pessoa
    personInfo.innerHTML = `
      <h3>Informações do CPF: ${data.CPF}</h3>
      <p><strong>Nome:</strong> ${data.Nome}</p>
      <p><strong>CPF:</strong> ${data.CPF}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefone:</strong> ${data.telefone}</p>
    `;
    
    // Adiciona o conteúdo ao container
    sidePanel.appendChild(personInfo); 
    sidePanel.classList.add('visible');

    // Exibe o painel lateral
    document.querySelector('.side-panel').classList.add('visible');
    document.querySelector('.data-container').style.display = 'flex'; // Torna visível a seção de dados
  }

  // Função para fechar o pop-up de CPF
  cpfExit.addEventListener("click", function () {
    cpfPopup.style.display = "none"; // Fecha o pop-up
  });
});
