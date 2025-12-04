import { NextRequest, NextResponse } from "next/server"
import { customerStorageService } from "@/lib/customer-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const gclid = searchParams.get('gclid')
    const transactionId = searchParams.get('transactionId')

    // Buscar por transactionId específico
    if (transactionId) {
      const customer = customerStorageService.getCustomer(transactionId)
      if (!customer) {
        return NextResponse.json({
          success: false,
          error: 'Cliente não encontrado'
        }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        customer
      })
    }

    // Buscar por email
    if (email) {
      const customers = customerStorageService.getCustomersByEmail(email)
      return NextResponse.json({
        success: true,
        customers,
        count: customers.length
      })
    }

    // Buscar por gclid
    if (gclid) {
      const customers = customerStorageService.getCustomersByGclid(gclid)
      return NextResponse.json({
        success: true,
        customers,
        count: customers.length
      })
    }

    // Retornar todos os clientes com estatísticas
    const allCustomers = customerStorageService.getAllCustomers()
    const totalRevenue = customerStorageService.getTotalRevenue()
    const customerCount = customerStorageService.getCustomerCount()

    return NextResponse.json({
      success: true,
      customers: allCustomers,
      statistics: {
        totalCustomers: customerCount,
        totalRevenue: totalRevenue,
        totalRevenueFormatted: `R$ ${(totalRevenue / 100).toFixed(2)}`,
        averageTicket: customerCount > 0 ? totalRevenue / customerCount : 0,
        averageTicketFormatted: customerCount > 0 ? `R$ ${(totalRevenue / customerCount / 100).toFixed(2)}` : 'R$ 0,00'
      }
    })

  } catch (error) {
    console.error("[CUSTOMERS] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao buscar clientes",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Endpoint para exportar dados (CSV)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'export-csv') {
      const customers = customerStorageService.getAllCustomers()
      
      // Criar CSV
      const headers = [
        'Transaction ID',
        'Email',
        'Telefone',
        'Valor (R$)',
        'GCLID',
        'IP',
        'País',
        'Cidade',
        'Data Criação',
        'Data Pagamento',
        'Produto',
        'Gateway',
        'UTM Source',
        'UTM Campaign',
        'UTM Medium',
        'FBCLID',
        'TTCLID'
      ]

      const rows = customers.map(c => [
        c.transactionId,
        c.email,
        c.phone || '',
        (c.valorConvertido / 100).toFixed(2),
        c.gclid || '',
        c.ip,
        c.pais,
        c.cidade || '',
        c.createdAt,
        c.paidAt,
        c.productName,
        c.gateway,
        c.utm_source || '',
        c.utm_campaign || '',
        c.utm_medium || '',
        c.fbclid || '',
        c.ttclid || ''
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Ação não reconhecida'
    }, { status: 400 })

  } catch (error) {
    console.error("[CUSTOMERS] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao processar requisição",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
