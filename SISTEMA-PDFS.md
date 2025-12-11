# 📄 Sistema de Comprovação de Entrega (PDFs)

## 🎯 Objetivo

Sistema interno para gerar e armazenar comprovantes de entrega em PDF, com hash SHA-256 para verificação de autenticidade.

## 📊 Novas Colunas no Google Sheets

Foram adicionadas 4 colunas importantes:

1. **Data Entrega** (Coluna AD)
   - Data/hora em que o item foi entregue ao cliente
   - Gerada automaticamente no momento do salvamento

2. **Quantidade Entregue** (Coluna AE)
   - Quantidade de diamantes, robux, vbucks, etc.
   - Exemplo: "1.060", "2.180", "5.600"

3. **Delivery Hash** (Coluna AF)
   - Hash SHA-256 para comprovação
   - Gerado com: `SHA256(transaction_id + email + data_entrega + quantidade)`
   - Exemplo: `a3f5b2c1d4e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7`

4. **PDF Status** (Coluna AG)
   - Status do PDF: `PENDENTE`, `GERADO` ou `FALHOU`
   - Atualizado automaticamente pelo sistema

## 🔐 Delivery Hash

O hash é gerado da seguinte forma:

```typescript
const hashInput = `${transactionId}${email}${dataEntrega}${quantidade}`;
const deliveryHash = crypto.createHash('sha256').update(hashInput).digest('hex');
```

**Exemplo:**
- Transaction ID: `TXN_123456`
- Email: `cliente@email.com`
- Data Entrega: `2025-01-15T10:30:00.000Z`
- Quantidade: `1.060`
- **Hash:** `SHA256("TXN_123456cliente@email.com2025-01-15T10:30:00.000Z1.060")`

## 📁 Estrutura de Pastas

Os PDFs são salvos na seguinte estrutura:

```
/pdfs/
  └── pedidos/
      └── 2025/
          ├── 01/
          │   ├── transaction_TXN_001.html
          │   ├── transaction_TXN_002.html
          │   └── transaction_TXN_003.html
          ├── 02/
          │   └── transaction_TXN_004.html
          └── 03/
              └── transaction_TXN_005.html
```

## 🚀 Como Gerar PDFs

### 1. Gerar PDF Individual

```bash
curl -X POST http://localhost:3000/api/generate-pdfs \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "sheetName": "lojarecargaff-org",
    "transactionId": "TXN_123456"
  }'
```

### 2. Gerar PDFs por Intervalo de Datas

```bash
curl -X POST http://localhost:3000/api/generate-pdfs \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "range",
    "sheetName": "lojarecargaff-org",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }'
```

### 3. Gerar PDFs em Lote

```bash
curl -X POST http://localhost:3000/api/generate-pdfs \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "all",
    "sheetName": "lojarecargaff-org",
    "limit": 100
  }'
```

## 📋 Resposta da API

```json
{
  "success": true,
  "message": "50 PDFs gerados com sucesso",
  "results": [
    {
      "transactionId": "TXN_001",
      "pdfPath": "/var/www/app/pdfs/pedidos/2025/01/transaction_TXN_001.html",
      "status": "GERADO"
    }
  ],
  "stats": {
    "total": 50,
    "success": 50,
    "failed": 0
  }
}
```

## 🔄 Fluxo Completo

1. **Cliente faz compra** → Dados salvos no Google Sheets
2. **Sistema gera hash** → `SHA256(transaction_id + email + data_entrega + quantidade)`
3. **PDF Status** → Marcado como `PENDENTE`
4. **Chamada da API** → `/api/generate-pdfs`
5. **Sistema gera PDF** → Salvo em `/pdfs/pedidos/YYYY/MM/`
6. **Status atualizado** → `GERADO` ou `FALHOU`

## 📄 Conteúdo do PDF

O PDF contém:

- ✅ Informações do Pedido (Transaction ID, Projeto, Produto, Valor)
- ✅ Informações do Cliente (Nome, CPF, Email, Telefone)
- ✅ Informações da Entrega (Data/Hora, Quantidade, Gateway, Status)
- ✅ Hash SHA-256 de Verificação
- ✅ Carimbo "ENTREGA COMPROVADA"

## 🛡️ Segurança

- PDFs são **apenas para uso interno**
- Não são enviados automaticamente ao cliente
- Hash SHA-256 garante autenticidade
- Estrutura organizada por ano/mês facilita auditoria

## 📝 Notas Importantes

- Os PDFs são gerados em formato HTML (pode ser convertido para PDF depois)
- A pasta `/pdfs/` está no `.gitignore` (não vai para o repositório)
- O sistema cria automaticamente as pastas necessárias
- Cada transação tem um PDF único identificado pelo Transaction ID

## 🔧 Manutenção

Para limpar PDFs antigos:

```bash
# Remover PDFs de 2024
rm -rf /var/www/app/pdfs/pedidos/2024/

# Remover PDFs de janeiro/2025
rm -rf /var/www/app/pdfs/pedidos/2025/01/
```

## 📊 Monitoramento

Verificar status dos PDFs no Google Sheets:

- Coluna AG mostra: `PENDENTE`, `GERADO` ou `FALHOU`
- Filtrar por status para identificar problemas
- Reprocessar PDFs com status `FALHOU` se necessário
