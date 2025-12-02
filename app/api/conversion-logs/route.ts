import { NextRequest, NextResponse } from 'next/server'
import { getAllLogs, getLogsByTransaction, getLogsByUserId } from '@/lib/conversion-logger'

/**
 * API para visualizar logs de conversão
 * GET /api/conversion-logs
 * 
 * Query params:
 * - transactionId: filtrar por transaction ID
 * - userId: filtrar por user ID
 * - limit: número de logs (padrão: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const transactionId = searchParams.get('transactionId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let logs
    
    if (transactionId) {
      logs = getLogsByTransaction(transactionId)
    } else if (userId) {
      logs = getLogsByUserId(userId)
    } else {
      logs = getAllLogs(limit)
    }
    
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs
    })
  } catch (error) {
    console.error('[CONVERSION-LOGS] Erro:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar logs'
    }, { status: 500 })
  }
}
