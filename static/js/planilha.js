// Função para carregar a planilha com campos selecionados
function carregarPlanilhaComCamposSelecionados(dadosCsv) {
  const container = document.getElementById("planilha");

  if (!dadosCsv || dadosCsv.length === 0) {
    return;
  }

  // Limpar conteúdo da planilha antes de exibir
  container.innerHTML = '';

  // Criar a tabela
  const table = document.createElement('table');
  table.classList.add('excel-table');

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  // Adicionar cabeçalhos
  Object.keys(dadosCsv[0]).forEach(campo => {
    const th = document.createElement('th');
    th.innerText = campo;
    trHead.appendChild(th);
  });

  thead.appendChild(trHead);
  table.appendChild(thead);

  // Adicionar dados no corpo da tabela
  const tbody = document.createElement('tbody');
  dadosCsv.forEach(linha => {
    const tr = document.createElement('tr');
    Object.values(linha).forEach(valor => {
      const td = document.createElement('td');
      td.textContent = valor;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
