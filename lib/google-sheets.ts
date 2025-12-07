import { google } from 'googleapis';
import path from 'path';

const SPREADSHEET_ID = '19noK4HT3COT-r-dJU3ZE6WRZvZMmffdRo0DzJDr0cwI';

// Autenticar com Service Account
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'chavesheets.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  return await auth.getClient();
}

// Criar ou obter aba
async function getOrCreateSheet(sheetName: string) {
  const authClient = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient as any });
  
  try {
    // Tentar obter informações da planilha
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    // Verificar se a aba existe
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );
    
    if (sheet) {
      console.log(`✅ [GOOGLE SHEETS] Aba "${sheetName}" já existe`);
      return sheet.properties?.sheetId;
    }
    
    // Criar nova aba
    console.log(`🆕 [GOOGLE SHEETS] Criando aba "${sheetName}"`);
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });
    
    const newSheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;
    
    // Adicionar cabeçalho
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Projeto', 'Transaction ID', 'Email', 'Telefone', 'Valor (R$)',
          'GCLID', 'GBraid', 'WBraid', 'IP', 'País', 'Cidade',
          'Data Criação', 'Data Pagamento', 'Produto', 'Gateway',
          'UTM Source', 'UTM Campaign', 'UTM Medium', 'UTM Content', 'UTM Term',
          'FBCLID', 'Keyword', 'Device', 'Network',
          'GAD Source', 'GAD Campaign ID', 'Cupons', 'Nome Cliente', 'CPF'
        ]],
      },
    });
    
    console.log(`✅ [GOOGLE SHEETS] Cabeçalho adicionado na aba "${sheetName}"`);
    return newSheetId;
    
  } catch (error) {
    console.error('❌ [GOOGLE SHEETS] Erro ao criar/obter aba:', error);
    throw error;
  }
}

// Salvar dados na planilha
export async function saveToGoogleSheets(data: {
  projeto: string;
  transactionId: string;
  email: string;
  phone: string;
  valorConvertido: number;
  gclid: string;
  gbraid: string;
  wbraid: string;
  ip: string;
  pais: string;
  cidade: string;
  createdAt: string;
  paidAt: string;
  productName: string;
  gateway: string;
  utm_source: string;
  utm_campaign: string;
  utm_medium: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  keyword: string;
  device: string;
  network: string;
  gad_source: string;
  gad_campaignid: string;
  cupons: string;
  nomeCliente: string;
  cpf: string;
}) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });
    
    // Nome da aba (limpar caracteres inválidos)
    const sheetName = data.projeto.replace(/[:\/?*\[\]]/g, '_');
    
    // Criar ou obter aba
    await getOrCreateSheet(sheetName);
    
    // Montar array de dados NA ORDEM EXATA
    const values = [[
      sheetName,                // 1. Projeto
      data.transactionId,       // 2. Transaction ID
      data.email,               // 3. Email
      data.phone,               // 4. Telefone
      data.valorConvertido,     // 5. Valor (R$)
      data.gclid,               // 6. GCLID
      data.gbraid,              // 7. GBraid
      data.wbraid,              // 8. WBraid
      data.ip,                  // 9. IP
      data.pais,                // 10. País
      data.cidade,              // 11. Cidade
      data.createdAt,           // 12. Data Criação
      data.paidAt,              // 13. Data Pagamento
      data.productName,         // 14. Produto
      data.gateway,             // 15. Gateway
      data.utm_source,          // 16. UTM Source
      data.utm_campaign,        // 17. UTM Campaign
      data.utm_medium,          // 18. UTM Medium
      data.utm_content,         // 19. UTM Content
      data.utm_term,            // 20. UTM Term
      data.fbclid,              // 21. FBCLID
      data.keyword,             // 22. Keyword
      data.device,              // 23. Device
      data.network,             // 24. Network
      data.gad_source,          // 25. GAD Source
      data.gad_campaignid,      // 26. GAD Campaign ID
      data.cupons,              // 27. Cupons
      data.nomeCliente,         // 28. Nome Cliente
      data.cpf,                 // 29. CPF
    ]];
    
    console.log(`📊 [GOOGLE SHEETS] Salvando dados na aba "${sheetName}"`);
    console.log(`   - Email: ${data.email}`);
    console.log(`   - Valor: R$ ${data.valorConvertido}`);
    
    // Adicionar linha
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
    
    console.log(`✅ [GOOGLE SHEETS] Dados salvos com sucesso!`);
    console.log(`   - Linhas adicionadas: ${response.data.updates?.updatedRows}`);
    
    return {
      success: true,
      sheet: sheetName,
      rows: response.data.updates?.updatedRows || 0,
    };
    
  } catch (error) {
    console.error('❌ [GOOGLE SHEETS] Erro ao salvar no Google Sheets:', error);
    throw error;
  }
}

// Criar ou obter aba para Google Ads
async function getOrCreateGoogleAdsSheet() {
  const authClient = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient as any });
  const sheetName = 'Google Ads Conversões';
  
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );
    
    if (sheet) {
      console.log(`✅ [GOOGLE ADS SHEET] Aba "${sheetName}" já existe`);
      return sheet.properties?.sheetId;
    }
    
    // Criar nova aba
    console.log(`🆕 [GOOGLE ADS SHEET] Criando aba "${sheetName}"`);
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });
    
    const newSheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;
    
    // Adicionar cabeçalho no formato Google Ads
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'event_time',
          'gclid',
          'email',
          'phone_number',
          'gbraid',
          'wbraid',
          'conversion_value',
          'currency_code',
          'order_id',
          'user_agent',
          'ip_address',
          'session_attributes'
        ]],
      },
    });
    
    console.log(`✅ [GOOGLE ADS SHEET] Cabeçalho adicionado na aba "${sheetName}"`);
    return newSheetId;
    
  } catch (error) {
    console.error('❌ [GOOGLE ADS SHEET] Erro ao criar/obter aba:', error);
    throw error;
  }
}

// Salvar dados no formato Google Ads (SEM hash - você fará manualmente)
export async function saveToGoogleAdsSheet(data: {
  eventTime: string;
  gclid: string;
  email: string;
  phoneNumber: string;
  gbraid: string;
  wbraid: string;
  conversionValue: number;
  currencyCode: string;
  orderId: string;
  userAgent: string;
  ipAddress: string;
  sessionAttributes: string;
}) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });
    const sheetName = 'Google Ads Conversões';
    
    // Criar ou obter aba
    await getOrCreateGoogleAdsSheet();
    
    // Montar array de dados NA ORDEM EXATA
    const values = [[
      data.eventTime,           // 1. event_time (formato: 2024-12-07 14:30:00 America/Sao_Paulo)
      data.gclid,               // 2. gclid
      data.email,               // 3. email (normalizado: minúsculas, sem espaços - você fará hash depois)
      data.phoneNumber,         // 4. phone_number (formato E.164: +5511999999999 - você fará hash depois)
      data.gbraid,              // 5. gbraid
      data.wbraid,              // 6. wbraid
      data.conversionValue,     // 7. conversion_value
      data.currencyCode,        // 8. currency_code (BRL)
      data.orderId,             // 9. order_id
      data.userAgent,           // 10. user_agent
      data.ipAddress,           // 11. ip_address
      data.sessionAttributes    // 12. session_attributes (gad_source, etc)
    ]];
    
    console.log(`📊 [GOOGLE ADS SHEET] Salvando conversão`);
    console.log(`   - Order ID: ${data.orderId}`);
    console.log(`   - Email: ${data.email}`);
    console.log(`   - Valor: ${data.currencyCode} ${data.conversionValue}`);
    console.log(`   - GCLID: ${data.gclid || 'N/A'}`);
    console.log(`   - IP: ${data.ipAddress}`);
    console.log(`   - User Agent: ${data.userAgent.substring(0, 50)}...`);
    
    // Adicionar linha
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
    
    console.log(`✅ [GOOGLE ADS SHEET] Conversão salva com sucesso!`);
    console.log(`   - Linhas adicionadas: ${response.data.updates?.updatedRows}`);
    
    return {
      success: true,
      sheet: sheetName,
      rows: response.data.updates?.updatedRows || 0,
    };
    
  } catch (error) {
    console.error('❌ [GOOGLE ADS SHEET] Erro ao salvar conversão:', error);
    throw error;
  }
}
