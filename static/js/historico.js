// static/historico.js




const tableBody = document.getElementById("upload-table-body");
const popup = document.getElementById("popup-confirm");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");

let rowToRemove = null;
let arquivos = [];

// Renderiza os dados na tabela
function renderTable() {
  tableBody.innerHTML = "";

  arquivos.forEach((arquivo, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${arquivo.nomeArquivo}</td>
    <td>${arquivo.setor}</td>
    <td>${arquivo.data}</td>
    <td>${arquivo.tipo}</td>
    <td>${arquivo.usuario}</td>
    <td><button class="remove-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button></td>
  `;

    // Adiciona o evento diretamente ao botão
    const btn = row.querySelector(".remove-btn");
    btn.addEventListener("click", () => {
      rowToRemove = index;
      popup.style.display = "block";
    });

    tableBody.appendChild(row);
  });
}



//função carregar arquivos
function carregarArquivos() {
  fetch('/arquivos')
    .then(response => response.json())
    .then(data => {
      arquivos = data;
      renderTable();
    })
    .catch(error => console.error('Erro ao carregar arquivos:', error));
}




// Confirmar remoção
confirmYes.addEventListener("click", () => {
  if (rowToRemove !== null) {
    const nomeArquivo = arquivos[rowToRemove].nomeArquivo;

    fetch(`/deletar/${nomeArquivo}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(result => {
        console.log(result.message);
        arquivos.splice(rowToRemove, 1);
        renderTable();
        popup.style.display = "none";
      })
      .catch(error => console.error('Erro ao deletar:', error));
  }
});

// Cancelar remoção
confirmNo.addEventListener("click", () => {
  popup.style.display = "none";
});

carregarArquivos();
// Simulação de dados vindos do backend esse pode apagar e apenas para verificar como que ira ficar//
const userData = {
  nome: "João Silva",
  tipo: "Gerente",
  funcao: "Análise de Dados",
};

// Preenchendo no DOM
document.getElementById("user-name").textContent = userData.nome;
document.getElementById("user-role").textContent = userData.tipo;
document.getElementById("user-function").textContent = userData.funcao;
