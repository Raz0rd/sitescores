import fs from 'fs'
import path from 'path'

export interface CustomerData {
  transactionId: string
  email: string
  phone: string | null
  valorConvertido: number // em centavos
  gclid: string | null
  ip: string
  pais: string
  cidade: string | null
  createdAt: string
  paidAt: string
  productName: string
  gateway: string
  // UTMs adicionais
  utm_source?: string | null
  utm_campaign?: string | null
  utm_medium?: string | null
  fbclid?: string | null
  ttclid?: string | null
}

class CustomerStorageService {
  private filePath: string
  private customers: Map<string, CustomerData>

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'customers.json')
    this.customers = new Map()
    this.loadCustomers()
  }

  private loadCustomers() {
    try {
      // Criar diretório se não existir
      const dir = path.dirname(this.filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Carregar arquivo se existir
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8')
        const customersArray = JSON.parse(data)
        this.customers = new Map(customersArray.map((c: CustomerData) => [c.transactionId, c]))
        console.log(`✅ [CustomerStorage] ${this.customers.size} clientes carregados`)
      } else {
        console.log(`📝 [CustomerStorage] Arquivo não existe, criando novo...`)
        this.saveToFile()
      }
    } catch (error) {
      console.error('❌ [CustomerStorage] Erro ao carregar clientes:', error)
      this.customers = new Map()
    }
  }

  private saveToFile() {
    try {
      const customersArray = Array.from(this.customers.values())
      fs.writeFileSync(this.filePath, JSON.stringify(customersArray, null, 2), 'utf-8')
      console.log(`💾 [CustomerStorage] ${customersArray.length} clientes salvos`)
    } catch (error) {
      console.error('❌ [CustomerStorage] Erro ao salvar clientes:', error)
    }
  }

  saveCustomer(customer: CustomerData) {
    this.customers.set(customer.transactionId, customer)
    this.saveToFile()
    console.log(`✅ [CustomerStorage] Cliente salvo: ${customer.email} (${customer.transactionId})`)
  }

  getCustomer(transactionId: string): CustomerData | undefined {
    return this.customers.get(transactionId)
  }

  getAllCustomers(): CustomerData[] {
    return Array.from(this.customers.values())
  }

  getCustomersByEmail(email: string): CustomerData[] {
    return Array.from(this.customers.values()).filter(c => c.email === email)
  }

  getCustomersByGclid(gclid: string): CustomerData[] {
    return Array.from(this.customers.values()).filter(c => c.gclid === gclid)
  }

  // Estatísticas
  getTotalRevenue(): number {
    return Array.from(this.customers.values()).reduce((sum, c) => sum + c.valorConvertido, 0)
  }

  getCustomerCount(): number {
    return this.customers.size
  }
}

// Singleton
export const customerStorageService = new CustomerStorageService()
