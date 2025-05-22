document.addEventListener('DOMContentLoaded', function () {
  // ==========================
  // DADOS SIMULADOS E INICIAIS
  // ==========================
  const userData = {
    nome: "{{ user_data.nome }}",
    tipo: "{{ user_data.permissao }}",
    funcao: "{{ user_data.funcao }}",
  };

  // Variável global para armazenar os campos selecionados
  let camposSelecionadosGlobal = [];

  // ==========================
  // EXIBIÇÃO DE DADOS DO USUÁRIO
  // ==========================
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = userData.nome;
  }

  const userRoleElement = document.getElementById("user-role");
  if (userRoleElement) {
    userRoleElement.textContent = userData.tipo;
  }

  const userFunctionElement = document.getElementById("user-function");
  if (userFunctionElement) {
    userFunctionElement.textContent = userData.funcao;
  }

  // ==========================
  // EVENTOS DAS LINHAS DE PLANILHAS
  // ==========================
  const linhas = document.querySelectorAll('#upload-table-body tr');
  const tipoDocSpan = document.getElementById('tipo-doc');

  // Evento para quando o usuário clica na linha da planilha
  linhas.forEach(linha => {
    linha.addEventListener('click', () => {
      const nomeArquivo = linha.querySelector('td').textContent;
      const tipo = linha.dataset.tipo;
      const docTipo = tipo === 'Pessoa fisica' ? 'CPF' : 'CNPJ';

      tipoDocSpan.textContent = docTipo;
      document.getElementById('tipo-doc-dinamico').textContent = docTipo;

      // Buscar as colunas do CSV real
      fetch(`/dados-planilha/${nomeArquivo}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
            return;
          }

          // Receber as colunas do CSV
          const colunasCSV = data.colunas;

          // Gerar checkboxes apenas para as colunas disponíveis no CSV
          const checkboxContainer = document.getElementById('checkbox-campos');
          checkboxContainer.innerHTML = '';  // Limpar container de checkboxes

          colunasCSV.forEach(campo => {
            const label = document.createElement('label');
            label.classList.add('checkbox-item');

            const span = document.createElement('span');
            span.textContent = campo;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = campo;

            label.appendChild(span);
            label.appendChild(checkbox);
            checkboxContainer.appendChild(label);
          });

          window.dadosCsvAtualCompleto = data.dados || [];

          // Exibir o popup de seleção de colunas
          document.getElementById('popup-selecao-campos').style.display = 'flex';

          // Armazenar os dados do CSV atual para quando o usuário confirmar a seleção de campos
          window.dadosPlanilhaAtual = data.colunas;
        })
        .catch(error => {
          console.error('Erro ao carregar dados do CSV:', error);
        });
    });
  });

  // ==========================
  // FUNÇÕES DE NAVEGAÇÃO ENTRE POPUPS
  // ==========================
  function selecionarTipo(tipo) {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('tipo-doc').innerText = tipo === 'fisica' ? 'CPF' : 'CNPJ';
    document.getElementById('popup-documento').style.display = 'block';
  }

  // Avança para a seleção de campos
  function mostrarSelecaoCampos() {
    document.getElementById('popup-documento').style.display = 'none';
    document.getElementById('popup-selecao-campos').style.display = 'flex';
  }

  // Confirma os campos escolhidos e carrega a planilha
  window.confirmarCamposSelecionados = function() {
    // Verifica se há campos selecionados
    camposSelecionadosGlobal = Array.from(document.querySelectorAll('#popup-selecao-campos input[type="checkbox"]:checked')).map(cb => cb.value);

    if (camposSelecionadosGlobal.length === 0) {
      alert("Você precisa selecionar ao menos uma coluna para prosseguir.");
      return;
    }

    document.getElementById('popup-selecao-campos').style.display = 'none';

    document.getElementById("lista-planilhas").style.display = "none";
    document.getElementById("planilha-container").style.display = "block";

    // Exibir a planilha com as colunas selecionadas
    carregarPlanilhaComCamposSelecionados(window.dadosCsvAtualCompleto);
  }

  // Função para abrir o popup de seleção de colunas
  window.abrirPopupColunas = function() {
    document.getElementById("popup-selecao-campos").style.display = "flex";
  };

  // Cria a planilha com os campos selecionados
  function carregarPlanilhaComCamposSelecionados(dadosCsv) {
    const container = document.getElementById("planilha");

    if (camposSelecionadosGlobal.length === 0) {
      return;
    }

    // Limpar conteúdo da planilha antes de exibir
    container.innerHTML = '';

    // Criar a tabela
    const table = document.createElement('table');
    table.classList.add('excel-table');

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    // Cabeçalho
    camposSelecionadosGlobal.forEach(campo => {
      const th = document.createElement('th');
      th.innerHTML = `${campo} <button class="remover-coluna-btn" onclick="removerColuna('${campo}')">❌</button>`;
      trHead.appendChild(th);
    });

    thead.appendChild(trHead);
    table.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement('tbody');
    dadosCsv.forEach(linha => {
      const tr = document.createElement('tr');
      camposSelecionadosGlobal.forEach(campo => {
        const td = document.createElement('td');
        td.textContent = linha[campo] || '';  // A linha pode não ter todos os campos
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Adiciona uma nova coluna ao selecionar do popup
  function adicionarColuna(campo) {
    if (!camposSelecionadosGlobal.includes(campo)) {
      camposSelecionadosGlobal.push(campo);
      carregarPlanilhaComCamposSelecionados(window.dadosCsvAtualCompleto); // Recarregar a planilha
    }
  }

  // Remove uma coluna da planilha
  window.removerColuna = function(campo) {
    camposSelecionadosGlobal = camposSelecionadosGlobal.filter(c => c !== campo);
    carregarPlanilhaComCamposSelecionados(window.dadosCsvAtualCompleto); // Recarregar a planilha
  }

  // Simula salvamento das alterações
  function salvarAlteracoes() {
    alert("Alterações salvas com sucesso! (simulação)");
  }

  // ==========================
  // ADICIONAR E REMOVER COLUNAS
  // ==========================
  const addColumnButton = document.querySelector('#planilha-container #adicionar-coluna-btn');
  if (addColumnButton) {
    addColumnButton.addEventListener('click', function () {
      // Chama a função para abrir o popup de seleção de colunas
      abrirPopupColunas();
    });
  }
});
