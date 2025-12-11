import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Interface para dados do pedido
 */
export interface OrderData {
  transactionId: string;
  email: string;
  phone: string;
  valor: number;
  produto: string;
  quantidadeEntregue: string;
  dataEntrega: string;
  nomeCliente: string;
  cpf: string;
  gateway: string;
  projeto: string;
}

/**
 * Gerar hash de entrega
 * SHA256(transaction_id + email + data_entrega + quantidade)
 */
export function generateDeliveryHash(
  transactionId: string,
  email: string,
  dataEntrega: string,
  quantidade: string
): string {
  const hashInput = `${transactionId}${email}${dataEntrega}${quantidade}`;
  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Gerar HTML do PDF de comprovação
 */
function generatePDFHTML(data: OrderData, deliveryHash: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprovante de Entrega - ${data.transactionId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .info-item {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .info-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 14px;
      color: #333;
      font-weight: 600;
    }
    
    .hash-box {
      background: #f8f9fa;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
      word-break: break-all;
    }
    
    .hash-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    .hash-value {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #667eea;
      line-height: 1.6;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    
    .stamp {
      display: inline-block;
      border: 3px solid #28a745;
      color: #28a745;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 COMPROVANTE DE ENTREGA</h1>
      <p>Documento Interno de Comprovação</p>
    </div>
    
    <div class="content">
      <!-- Informações do Pedido -->
      <div class="section">
        <div class="section-title">📋 Informações do Pedido</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Transaction ID</div>
            <div class="info-value">${data.transactionId}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Projeto</div>
            <div class="info-value">${data.projeto}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Produto</div>
            <div class="info-value">${data.produto}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Valor</div>
            <div class="info-value">R$ ${data.valor.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <!-- Informações do Cliente -->
      <div class="section">
        <div class="section-title">👤 Informações do Cliente</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nome</div>
            <div class="info-value">${data.nomeCliente}</div>
          </div>
          <div class="info-item">
            <div class="info-label">CPF</div>
            <div class="info-value">${data.cpf}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${data.email}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefone</div>
            <div class="info-value">${data.phone}</div>
          </div>
        </div>
      </div>
      
      <!-- Informações da Entrega -->
      <div class="section">
        <div class="section-title">🚀 Informações da Entrega</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Data/Hora da Entrega</div>
            <div class="info-value">${new Date(data.dataEntrega).toLocaleString('pt-BR')}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Quantidade Entregue</div>
            <div class="info-value">${data.quantidadeEntregue}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Gateway</div>
            <div class="info-value">${data.gateway}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value" style="color: #28a745;">✅ ENTREGUE</div>
          </div>
        </div>
        
        <!-- Hash de Verificação -->
        <div class="hash-box">
          <div class="hash-label">🔐 HASH DE VERIFICAÇÃO (SHA-256)</div>
          <div class="hash-value">${deliveryHash}</div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <div class="stamp">ENTREGA COMPROVADA</div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Documento gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</strong></p>
      <p>Este é um documento interno para comprovação de entrega.</p>
      <p>Hash de Verificação: ${deliveryHash.substring(0, 16)}...</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Salvar PDF localmente
 * Estrutura: /pdfs/pedidos/YYYY/MM/transaction_XXXX.html
 */
export async function savePDFLocally(data: OrderData): Promise<string> {
  try {
    // Gerar hash de entrega
    const deliveryHash = generateDeliveryHash(
      data.transactionId,
      data.email,
      data.dataEntrega,
      data.quantidadeEntregue
    );
    
    // Gerar HTML
    const htmlContent = generatePDFHTML(data, deliveryHash);
    
    // Criar estrutura de pastas: /pdfs/pedidos/2025/01/
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const pdfDir = path.join(process.cwd(), 'pdfs', 'pedidos', String(year), month);
    
    // Criar diretórios se não existirem
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
      console.log(`📁 [PDF] Diretório criado: ${pdfDir}`);
    }
    
    // Nome do arquivo
    const fileName = `transaction_${data.transactionId}.html`;
    const filePath = path.join(pdfDir, fileName);
    
    // Salvar arquivo
    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    
    console.log(`✅ [PDF] Comprovante salvo: ${filePath}`);
    console.log(`🔐 [PDF] Hash: ${deliveryHash.substring(0, 16)}...`);
    
    return filePath;
    
  } catch (error) {
    console.error('❌ [PDF] Erro ao salvar comprovante:', error);
    throw error;
  }
}

/**
 * Verificar se PDF existe
 */
export function checkPDFExists(transactionId: string, year: number, month: number): boolean {
  const monthStr = String(month).padStart(2, '0');
  const pdfPath = path.join(
    process.cwd(),
    'pdfs',
    'pedidos',
    String(year),
    monthStr,
    `transaction_${transactionId}.html`
  );
  
  return fs.existsSync(pdfPath);
}
