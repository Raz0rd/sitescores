import { NextRequest, NextResponse } from 'next/server';
import { savePDFLocally, OrderData } from '@/lib/pdf-generator';
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

/**
 * POST /api/generate-pdfs
 * 
 * Gerar PDFs de comprovação em lote
 * 
 * Body:
 * {
 *   "mode": "all" | "range" | "single",
 *   "sheetName": "nome-da-aba",
 *   "transactionId": "xxx" (para mode=single),
 *   "startDate": "2025-01-01" (para mode=range),
 *   "endDate": "2025-01-31" (para mode=range),
 *   "limit": 50 (para mode=all, opcional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, sheetName, transactionId, startDate, endDate, limit = 50 } = body;

    if (!sheetName) {
      return NextResponse.json({
        success: false,
        error: 'sheetName é obrigatório'
      }, { status: 400 });
    }

    console.log(`📄 [GENERATE-PDFS] Modo: ${mode}, Aba: ${sheetName}`);

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    // Buscar dados da planilha
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:AG`, // A até AG (33 colunas)
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum dado encontrado na planilha'
      }, { status: 404 });
    }

    console.log(`📊 [GENERATE-PDFS] Total de linhas: ${rows.length}`);

    // Filtrar linhas baseado no modo
    let filteredRows = rows;

    if (mode === 'single' && transactionId) {
      // Filtrar por transaction ID (coluna B, índice 1)
      filteredRows = rows.filter(row => row[1] === transactionId);
      console.log(`🔍 [GENERATE-PDFS] Filtrando por ID: ${transactionId}`);
    } else if (mode === 'range' && startDate && endDate) {
      // Filtrar por intervalo de datas (coluna M - Data Pagamento, índice 12)
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredRows = rows.filter(row => {
        const dataPagamento = new Date(row[12]);
        return dataPagamento >= start && dataPagamento <= end;
      });
      
      console.log(`📅 [GENERATE-PDFS] Filtrando de ${startDate} até ${endDate}`);
    } else if (mode === 'all') {
      // Limitar quantidade
      filteredRows = rows.slice(0, limit);
      console.log(`📦 [GENERATE-PDFS] Processando ${limit} registros`);
    }

    if (filteredRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum registro encontrado com os filtros aplicados'
      }, { status: 404 });
    }

    console.log(`✅ [GENERATE-PDFS] ${filteredRows.length} registros para processar`);

    // Gerar PDFs
    const results = [];
    const errors = [];

    for (const row of filteredRows) {
      try {
        // Mapear colunas
        const orderData: OrderData = {
          transactionId: row[1] || '',
          email: row[2] || '',
          phone: row[3] || '',
          valor: parseFloat(row[4]) || 0,
          produto: row[13] || '',
          quantidadeEntregue: row[30] || '', // Coluna AE (índice 30)
          dataEntrega: row[29] || new Date().toISOString(), // Coluna AD (índice 29)
          nomeCliente: row[27] || '',
          cpf: row[28] || '',
          gateway: row[14] || '',
          projeto: row[0] || '',
        };

        // Gerar PDF
        const pdfPath = await savePDFLocally(orderData);
        
        // Atualizar status na planilha (coluna AG - PDF Status, índice 32)
        const rowIndex = rows.indexOf(row) + 2; // +2 porque começa em A2
        
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!AG${rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [['GERADO']],
          },
        });

        results.push({
          transactionId: orderData.transactionId,
          pdfPath,
          status: 'GERADO'
        });

        console.log(`✅ [PDF] Gerado: ${orderData.transactionId}`);

      } catch (error: any) {
        console.error(`❌ [PDF] Erro ao gerar PDF para ${row[1]}:`, error);
        errors.push({
          transactionId: row[1],
          error: error.message
        });

        // Atualizar status como FALHOU
        const rowIndex = rows.indexOf(row) + 2;
        
        try {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!AG${rowIndex}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [['FALHOU']],
            },
          });
        } catch (updateError) {
          console.error(`❌ [PDF] Erro ao atualizar status:`, updateError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} PDFs gerados com sucesso`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        total: filteredRows.length,
        success: results.length,
        failed: errors.length
      }
    });

  } catch (error: any) {
    console.error('❌ [GENERATE-PDFS] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
