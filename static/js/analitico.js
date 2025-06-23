document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("upload-table-body");
  let chartInstance = null;
  window.arquivoSelecionado = null;

  // Função para abrir popup de seleção de colunas
  function abrirPopupDeSelecaoDeColunas(colunas) {
    const checkboxContainer = document.getElementById('checkbox-campos');
    checkboxContainer.innerHTML = '';

    colunas.forEach(campo => {
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

    document.getElementById('popup-selecao-campos').style.display = 'flex';
  }

  // Função para fechar o popup do gráfico
  window.fecharPopupGrafico = function () {
    document.getElementById('popup-grafico').style.display = 'none';
    if (chartInstance) chartInstance.destroy();
  };

  // Busca lista de arquivos CSV e popula tabela
  fetch('/api/arquivos_csv')
    .then(res => res.json())
    .then(dados => {
      dados.forEach(item => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${item.nome}</td>
          <td>${item.setor}</td>
          <td>${item.data}</td>
          <td>${item.tipo}</td>
        `;

        linha.addEventListener('click', () => {
          window.arquivoSelecionado = item.nome;
          abrirPopupDeSelecaoDeColunas(item.colunas);
        });

        tabela.appendChild(linha);
      });
    });

  // Botão OK do popup de colunas
  document.getElementById('btn-confirmar-colunas').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#checkbox-campos input[type="checkbox"]:checked');
    const colunasSelecionadas = Array.from(checkboxes).map(cb => cb.value);

    if (colunasSelecionadas.length === 0) {
      alert('Selecione ao menos uma coluna');
      return;
    }

    document.getElementById('popup-selecao-campos').style.display = 'none';

    if (!window.arquivoSelecionado) {
      alert('Selecione um arquivo primeiro');
      return;
    }

    fetch('/api/dados_grafico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_arquivo: window.arquivoSelecionado,
        colunas: colunasSelecionadas
      })
    })
      .then(res => res.json())
      .then(dados => {
        console.log('Dados recebidos para o gráfico:', dados);
        try {
          const canvasPopup = document.getElementById('canvas-grafico-popup');
          if (chartInstance) chartInstance.destroy();

          chartInstance = new Chart(canvasPopup, {
            type: 'bar',
            data: {
              labels: dados.labels,
              datasets: dados.datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: 'rgba(0,153,255,0.6)',
                borderColor: 'rgba(0,153,255,1)',
                borderWidth: 1
              }))
            },
            options: {
              responsive: true,
              scales: {
                y: { beginAtZero: true }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const datasetLabel = context.dataset.label || '';
                      const dataPoint = context.raw;
                      const index = context.dataIndex;

                      // Exemplo: mostrando o valor + nome
                      const nome = dados.labels[index];
                      return `${datasetLabel}: ${dataPoint} - ${nome}`;
                    }
                  }
                }
              }
            }
          });

          document.getElementById('popup-grafico').style.display = 'flex';

        } catch (e) {
          console.error('Erro ao construir o gráfico:', e);
          alert('Erro ao gerar gráfico');
        }
      })
      .catch(err => {
        console.error('Erro na requisição ou na resposta:', err);
        alert('Erro ao gerar gráfico');
      });
  });
});
