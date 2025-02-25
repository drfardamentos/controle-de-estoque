const apiUrl = "https://sheetdb.io/api/v1/cf70b05w3x57x";

// Lista de tecidos que precisam ter no mínimo 10 unidades
const tecidosComMinimo10 = ["1", "11", "14", "16"];

// Função para verificar tecidos com mínimo de 10 unidades
function verificarMinimo10(quantidade, tecido) {
  if (quantidade < 10) {
    return `<li style="background-color: #fff; margin: 10px 0; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">⚠️ <strong>Tecido "${tecido}"</strong>: ${quantidade} unidades (mínimo: 10)</li>`;
  }
  return '';
}

// Função para verificar tecidos com mínimo de 3 unidades
function verificarMinimo3(quantidade, tecido) {
  if (quantidade === 0) {
    return `<li style="background-color: #fff; margin: 10px 0; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">⚠️ <strong>Tecido "${tecido}"</strong>: acabou (${quantidade} unidades)</li>`;
  } else if (quantidade < 3) {
    return `<li style="background-color: #fff; margin: 10px 0; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">⚠️ <strong>Tecido "${tecido}"</strong>: quase acabando (${quantidade} unidades)</li>`;
  }
  return '';
}

async function verificarEstoque() {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status} - ${response.statusText}`);
    }

    const dados = await response.json();

    let emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
          <h1 style="color: #007BFF;">Relatório de Estoque - Itens com Quantidade Baixa</h1>
          <p>Prezado(a),</p>
          <p>Segue abaixo o relatório de tecidos com estoque baixo:</p>
          <ul style="list-style-type: none; padding: 0;">`;

    // Percorrer cada item e verificar a quantidade
    dados.forEach(item => {
      const quantidade = parseInt(item.QUANTIDADE, 10); // Converter para número
      const tecido = item.TECIDO.trim(); // Remover espaços extras do nome do tecido

      // Verificar se a conversão deu certo
      if (isNaN(quantidade)) {
        console.error(`Quantidade inválida para o tecido "${tecido}"`);
        return; // Ignorar este item se a quantidade não for válida
      }

      // Adicionar informações personalizadas no corpo do e-mail
      if (tecidosComMinimo10.includes(item.ID)) {
        emailBody += verificarMinimo10(quantidade, tecido);
      } else {
        emailBody += verificarMinimo3(quantidade, tecido);
      }
    });

    emailBody += `
          </ul>
          <div style="margin-top: 20px; font-size: 0.9em; color: #777;">
            <p>Atenciosamente,<br />Cleilson, Controle de Estoque</p>
            <p><small>Este é um e-mail automático. Por favor, não responda.</small></p>
          </div>
        </body>
      </html>`;

    // Enviar o e-mail com os dados gerados
    const emailResponse = await fetch('https://sendemails-lqua.onrender.com/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'cleiussonalves1011@gmail.com',
        subject: 'Relatório de Estoque - Itens com Baixa Quantidade',
        html: emailBody,  // Usar HTML para o corpo do e-mail
      })
    });

    // Verificar se a resposta é válida e pode ser convertida para JSON
    if (!emailResponse.ok) {
      throw new Error(`Erro ao enviar o e-mail: ${emailResponse.status} - ${emailResponse.statusText}`);
    }

    const emailData = await emailResponse.json();
    console.log("E-mail enviado com sucesso:", emailData);

  } catch (error) {
    console.error("Erro:", error);
  }
}

verificarEstoque();
