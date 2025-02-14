if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
          .then(registration => {
              console.log('Service Worker registrado com sucesso:', registration);
          })
          .catch(error => {
              console.log('Falha ao registrar o Service Worker:', error);
          });
  });
}
const dataPedidoo = new Date().toLocaleDateString('pt-BR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const data = document.getElementById('data');
data.innerHTML = dataPedidoo


const apiUrl = "https://sheetdb.io/api/v1/cf70b05w3x57x"; // Substitua SEU_API_ID pelo ID da API do SheetDB
        const itemData = {}; // Objeto para armazenar os dados de cada item
      
        // Função para carregar os dados do SheetDB e preencher o select
        async function loadSheetDBData() {
          try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            const select = document.getElementById("tecidoSelect");
            
            data.forEach(item => {
              // Cria a opção para o select
              const option = document.createElement("option");
              option.value = item.ID; // Usa o ID como valor da opção
              option.textContent = item.TECIDO;
              select.appendChild(option);
              
              // Armazena a quantidade inicial no objeto itemData
              itemData[item.ID] = { TECIDO: item.TECIDO, QUANTIDADE: Number(item.QUANTIDADE) };
            });
          } catch (error) {
            console.error("Erro ao carregar dados do SheetDB:", error);
          }
        }
      
        // Função para atualizar a quantidade ao selecionar uma opção
        function updateQuantity() {
          const select = document.getElementById("tecidoSelect");
          const selectedId = select.value;
          const quantityInput = document.getElementById("quantityInput");

          if (selectedId && itemData[selectedId]) {
            quantityInput.value = itemData[selectedId].QUANTIDADE;
          } else {
            quantityInput.value = "";
          }
        }

const loader = document.getElementById('loader')
const result = document.getElementById('result')
// Função para ajustar a quantidade com base na entrada ou saída
function adjustQuantity() {
  const selectedId = document.getElementById("tecidoSelect").value;
  const adjustmentInput = document.getElementById("adjustmentInput").value;
  const quantityInput = document.getElementById("quantityInput");
  const isEntrada = document.getElementById("entrada").checked;
  const isSaida = document.getElementById("saida").checked;
  

  if (!selectedId || !adjustmentInput || (!isEntrada && !isSaida)) {
      alert("Por favor, selecione o tecido, a quantidade e o tipo de ajuste.");
      return;
  }

  loader.style.display = 'block'

  // Calcula nova quantidade
  let newQuantity = itemData[selectedId].QUANTIDADE;
  if (isEntrada) {
      newQuantity += Number(adjustmentInput);
  } else if (isSaida) {
      newQuantity -= Number(adjustmentInput);
      if (newQuantity < 0) {
          alert("A quantidade não pode ser negativa.");
          return;
      }
  }

  // Atualiza no itemData e na interface
  itemData[selectedId].QUANTIDADE = newQuantity;
  quantityInput.value = newQuantity;

  // Atualiza a quantidade no SheetDB e em seguida envia os dados
  updateQuantityInSheetDB(selectedId, newQuantity)
      .then(() => submitData()); // Chama submitData após a atualização
}

// Função para enviar a nova quantidade ao SheetDB
async function updateQuantityInSheetDB(id, newQuantity) {
  try {
      await fetch(`${apiUrl}/ID/${id}`, { // Inclui o ID na URL para especificar a linha
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ QUANTIDADE: newQuantity }) // Garante que a coluna esteja correta
      });
      alert("Quantidade atualizada com sucesso!");
  } catch (error) {
      console.error("Erro ao atualizar a quantidade no SheetDB:", error);
  }
}

        
const sheetDBUrl = 'https://sheetdb.io/api/v1/cf70b05w3x57x?sheet=Dados'; 

function submitData() {

  const tecido = document.getElementById('tecidoSelect').selectedOptions[0].text; // Obtenha o nome do tecido
  let quantidade = parseInt(document.getElementById('adjustmentInput').value);
  const dataPedido = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  

  // Verifica se a saída foi selecionada
  const isSaida = document.getElementById("saida").checked;
  

  if (isSaida) {
      quantidade = -Math.abs(quantidade); // Torna a quantidade negativa
  }

  if ( !tecido || isNaN(quantidade)) {
      alert('Por favor, preencha todos os campos.');
      return;
  }

  // Criar o objeto com os dados a serem enviados
  const entry = {
      DATA: dataPedido,
      TECIDO: tecido,
      QUANTIDADE: quantidade
  };

  // Enviar os dados para o SheetDB
  fetch(sheetDBUrl, {
      method: 'POST', // Usar POST para enviar dados
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry) // Enviar como um objeto JSON
  })
  .then(response => {
      if (response.ok) {
          
        loader.style.display = 'none'
        result.style.display = 'block'

        setInterval(()=>{
          result.style.display = 'none'
        }, 2000)

          
          // Limpar os campos
          document.getElementById('data').value = '';
          document.getElementById('tecidoSelect').value = '';
          document.getElementById('adjustmentInput').value = '';
      } else {
          alert('Erro ao enviar os dados. Código de status: ' + response.status);
      }
  })
  .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao enviar os dados.');
  });
}
  
  
    
    

    // Carrega os dados ao carregar a página
    document.addEventListener("DOMContentLoaded", loadSheetDBData);