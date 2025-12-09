# 📊 Configurar Aba de Tracking no Google Sheets

## 1. Criar nova aba na planilha

1. **Abra sua planilha:** https://docs.google.com/spreadsheets/d/SEU_ID_AQUI
2. **Clique no "+"** no rodapé para criar nova aba
3. **Renomeie para:** `Tracking_Inicial`

## 2. Adicionar cabeçalhos

Na linha 1 da aba `Tracking_Inicial`, adicione:

```
A1: Timestamp
B1: GCLID
C1: GBRAID
D1: WBRAID
E1: FBCLID
F1: UTM Source
G1: UTM Campaign
H1: UTM Medium
I1: IP
J1: User Agent
K1: Landing Page
L1: Full URL
```

## 3. Atualizar o Apps Script

1. **Vá em:** `Extensões` → `Apps Script`
2. **Substitua o código atual por:**

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Determinar qual aba usar baseado no projeto
    var sheetName = data.projeto || 'RecarGames'; // Nome padrão
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    // Se a aba não existir, usar a primeira aba
    if (!sheet) {
      sheet = spreadsheet.getSheets()[0];
    }
    
    // Se for Tracking_Inicial, formato diferente
    if (sheetName === 'Tracking_Inicial') {
      sheet.appendRow([
        data.timestamp,
        data.gclid || '',
        data.gbraid || '',
        data.wbraid || '',
        data.fbclid || '',
        data.utm_source || '',
        data.utm_campaign || '',
        data.utm_medium || '',
        data.ip,
        data.user_agent,
        data.landing_page,
        data.full_url
      ]);
    } else {
      // Formato para clientes pagantes (RecarGames, etc)
      sheet.appendRow([
        data.transactionId,
        data.email,
        data.phone || '',
        data.valorConvertido ? (data.valorConvertido / 100).toFixed(2) : '',
        data.gclid || '',
        data.ip,
        data.pais,
        data.cidade || '',
        data.createdAt,
        data.paidAt,
        data.productName,
        data.gateway,
        data.utm_source || '',
        data.utm_campaign || '',
        data.utm_medium || '',
        data.fbclid || '',
        data.nomeCliente || ''
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Dados salvos com sucesso na aba: ' + sheetName
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Salve** (Ctrl+S)
5. **Reimplante:**
   - Clique em "Implantar" → "Gerenciar implantações"
   - Clique no ícone de lápis (editar)
   - Mude a "Versão" para "Nova versão"
   - Clique em "Implantar"

---

## ✅ Pronto!

Agora o sistema vai:
1. **Capturar gclid/gbraid** assim que o usuário acessar o site
2. **Salvar na aba `Tracking_Inicial`** do Google Sheets
3. **Salvar clientes pagantes** na aba `RecarGames` (ou nome do projeto)

## 📊 Dados capturados no primeiro acesso:

- Timestamp
- GCLID (Google Ads)
- GBRAID (Google Ads iOS)
- WBRAID (Google Ads iOS)
- FBCLID (Facebook)
- UTM Source, Campaign, Medium
- IP do usuário
- User Agent (navegador)
- Landing Page (primeira página acessada)
- URL completa

**Isso permite rastrear TODOS os acessos, não apenas os que pagam!** 🎯
