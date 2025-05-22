document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const uploadTableBody = document.getElementById("upload-table-body");
  const nome = document.getElementById("user-nome").textContent;
  const permissao = document.getElementById("user-permissao").textContent;
  const funcao = document.getElementById("user-funcao").textContent;
  const uploadInput = document.getElementById("upload");
  const popupOverlay = document.getElementById("popupOverlay");
  const confirmSetorBtn = document.getElementById("confirmSetorBtn");
  const cancelSetorBtn = document.getElementById("cancelSetorBtn");
  const setorSelect = document.getElementById("setorSelect");
  const tipoSelect = document.getElementById("tipoSelect");

  // Exibir dados do usuário (reforço)
  const userData = {
    nome: nome,
    permissao: permissao,
    funcao: funcao
  };

  document.getElementById("user-nome").textContent = userData.nome;
  document.getElementById("user-permissao").textContent = userData.permissao;
  document.getElementById("user-funcao").textContent = userData.funcao;

  // Adiciona uma nova linha na tabela
  function addUploadRow(planilha, setor, data, tipo) {
    // Verifica se a linha já foi adicionada (para evitar duplicação)
    const rows = uploadTableBody.querySelectorAll("tr");
    for (let row of rows) {
      if (row.cells[0].textContent === planilha && row.cells[1].textContent === setor) {
        return;  // Se já existir, não adiciona
      }
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${planilha}</td>
      <td>${setor}</td>
      <td>${data}</td>
      <td>${tipo}</td>
    `;
    uploadTableBody.appendChild(row);
  }

  // Mostrar o popup ao selecionar um CSV
  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      popupOverlay.classList.add("active");
    } else {
      alert("Por favor, selecione um arquivo CSV.");
      uploadInput.value = "";
    }
  });

  // Confirmar setor e tipo e enviar
  confirmSetorBtn.addEventListener("click", function () {
    const file = uploadInput.files[0];
    const setor = setorSelect.value;
    const tipo = tipoSelect.value;

    if (!file || !setor || !tipo) {
      alert("Preencha todos os campos!");
      return;
    }

    // Feedback de carregamento
    const originalText = confirmSetorBtn.textContent;
    confirmSetorBtn.disabled = true;
    confirmSetorBtn.textContent = "Enviando...";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("setor", setor);
    formData.append("tipo", tipo);

    fetch("/upload", {
      method: "POST",
      body: formData,
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro no servidor");
        return response.json();
      })
      .then((data) => {
        console.log(data);  // Verifique o que está sendo retornado do backend
        if (data.error) throw new Error(data.error);

        alert(data.mensagem || "Upload realizado com sucesso!");

        // Chama a função para carregar a planilha na tela com os dados do CSV
        const dadosCsv = data.dados_csv;

        // Adiciona cada linha do CSV na tabela
        dadosCsv.forEach((item) => {
          // Exemplo de como você pode processar os dados do CSV
          addUploadRow(file.name, setor, new Date().toLocaleDateString("pt-BR"), tipo);
        });

        closePopup();
      })
      .catch((error) => {
        alert(error.message || "Erro ao enviar arquivo.");
        console.error("Erro no upload:", error);
      })
      .finally(() => {
        confirmSetorBtn.disabled = false;
        confirmSetorBtn.textContent = originalText;
      });
  });

  // Função para fechar popup
  function closePopup() {
    popupOverlay.classList.remove("active");
    setorSelect.value = "";
    tipoSelect.value = "";
    uploadInput.value = "";
  }

  // Botão cancelar
  cancelSetorBtn.addEventListener("click", closePopup);

  // Fechar ao clicar fora da caixa
  popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
      closePopup();
    }
  });
});
