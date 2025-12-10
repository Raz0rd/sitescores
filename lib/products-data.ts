// Dados centralizados de todos os produtos com slugs únicos para SEO

export interface Product {
  id: string
  slug: string // URL amigável
  name: string
  category: 'freefire' | 'robux' | 'vbucks' | 'recarga' | 'brainroots'
  price: number
  originalPrice?: number
  image: string
  description: string
  bonus?: string
  popular?: boolean
  special?: boolean
  metadata?: {
    amount?: string | number
    keywords?: string[]
    seoTitle?: string
    seoDescription?: string
  }
}

export const productsData: Product[] = [
  // ============= FREE FIRE =============
  // Pacotes da loja (IDs que batem com o carrinho)
  {
    id: 'ff-diamonds-1.060',
    slug: 'freefire-1060-diamantes',
    name: '1.060 Diamantes Free Fire',
    category: 'freefire',
    price: 24.98,
    image: '/images/point.webp',
    description: 'Recarga de 1.060 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '1.060',
      keywords: ['free fire', 'diamantes', '1060 diamantes', 'recarga ff'],
      seoTitle: '1.060 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 1.060 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-diamonds-2.180',
    slug: 'freefire-2180-diamantes',
    name: '2.180 Diamantes Free Fire',
    category: 'freefire',
    price: 35.19,
    popular: true,
    image: '/images/point.webp',
    description: 'Recarga de 2.180 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '2.180',
      keywords: ['free fire', 'diamantes', '2180 diamantes', 'recarga ff'],
      seoTitle: '2.180 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 2.180 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-diamonds-5.600',
    slug: 'freefire-5600-diamantes',
    name: '5.600 Diamantes Free Fire',
    category: 'freefire',
    price: 54.20,
    image: '/images/point.webp',
    description: 'Recarga de 5.600 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '5.600',
      keywords: ['free fire', 'diamantes', '5600 diamantes', 'recarga ff'],
      seoTitle: '5.600 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 5.600 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  // Pacotes antigos (manter para compatibilidade)
  {
    id: 'ff-diamonds-100',
    slug: 'freefire-100-diamantes',
    name: '100 Diamantes Free Fire',
    category: 'freefire',
    price: 5.90,
    image: '/images/point.webp',
    description: 'Recarga de 100 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '100',
      keywords: ['free fire', 'diamantes', '100 diamantes', 'recarga ff'],
      seoTitle: '100 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 100 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-diamonds-310',
    slug: 'freefire-310-diamantes',
    name: '310 Diamantes Free Fire',
    category: 'freefire',
    price: 11.90,
    image: '/images/point.webp',
    description: 'Recarga de 310 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '310',
      keywords: ['free fire', 'diamantes', '310 diamantes', 'recarga ff'],
      seoTitle: '310 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 310 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-diamonds-530',
    slug: 'freefire-530-diamantes',
    name: '530 Diamantes Free Fire',
    category: 'freefire',
    price: 19.90,
    popular: true,
    image: '/images/point.webp',
    description: 'Recarga de 530 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '530',
      keywords: ['free fire', 'diamantes', '530 diamantes', 'recarga ff'],
      seoTitle: '530 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 530 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-diamonds-1080',
    slug: 'freefire-1080-diamantes',
    name: '1080 Diamantes Free Fire',
    category: 'freefire',
    price: 29.90,
    image: '/images/point.webp',
    description: 'Recarga de 1080 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '1080',
      keywords: ['free fire', 'diamantes', '1080 diamantes', 'recarga ff'],
      seoTitle: '1080 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 1080 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-diamonds-2200',
    slug: 'freefire-2200-diamantes',
    name: '2200 Diamantes Free Fire',
    category: 'freefire',
    price: 49.90,
    popular: true,
    image: '/images/point.webp',
    description: 'Recarga de 2200 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '2200',
      keywords: ['free fire', 'diamantes', '2200 diamantes', 'recarga ff'],
      seoTitle: '2200 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 2200 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-diamonds-5600',
    slug: 'freefire-5600-diamantes',
    name: '5600 Diamantes Free Fire',
    category: 'freefire',
    price: 99.90,
    image: '/images/point.webp',
    description: 'Recarga de 5600 diamantes para Free Fire. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: '5600',
      keywords: ['free fire', 'diamantes', '5600 diamantes', 'recarga ff'],
      seoTitle: '5600 Diamantes Free Fire - Recarga Instantânea',
      seoDescription: 'Compre 5600 diamantes para Free Fire com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'ff-semanal',
    slug: 'freefire-assinatura-semanal',
    name: 'Assinatura Semanal Free Fire',
    category: 'freefire',
    price: 12.90,
    image: '/images/semanal.png',
    description: 'Ganhe 60 diamantes agora e resgate 40 diamantes todos os dias no jogo, durante 7 dias! Você receberá 340 diamantes no total.',
    metadata: {
      keywords: ['free fire', 'assinatura semanal', 'diamantes diários'],
      seoTitle: 'Assinatura Semanal Free Fire - 340 Diamantes Total',
      seoDescription: 'Assinatura semanal Free Fire com 340 diamantes no total. Receba diamantes diariamente por 7 dias.'
    }
  },
  {
    id: 'ff-mensal',
    slug: 'freefire-assinatura-mensal',
    name: 'Assinatura Mensal Free Fire',
    category: 'freefire',
    price: 29.90,
    popular: true,
    image: '/images/mensal.png',
    description: 'Ganhe 300 diamantes agora e resgate 50 diamantes todos os dias no jogo, durante 30 dias! Você receberá 1800 diamantes no total.',
    metadata: {
      keywords: ['free fire', 'assinatura mensal', 'diamantes diários'],
      seoTitle: 'Assinatura Mensal Free Fire - 1800 Diamantes Total',
      seoDescription: 'Assinatura mensal Free Fire com 1800 diamantes no total. Receba diamantes diariamente por 30 dias.'
    }
  },
  {
    id: 'ff-booyah',
    slug: 'freefire-passe-booyah-premium-plus',
    name: 'Passe Booyah Premium Plus',
    category: 'freefire',
    price: 49.90,
    image: '/images/boyahplus.png',
    description: 'Ganhe todos os privilégios e recompensas do Booyah Pass Premium + recompensas exclusivas + 50 níveis do Booyah Pass instantaneamente.',
    metadata: {
      keywords: ['free fire', 'booyah pass', 'premium plus', 'passe de batalha'],
      seoTitle: 'Passe Booyah Premium Plus Free Fire',
      seoDescription: 'Passe Booyah Premium Plus com todas as recompensas exclusivas e 50 níveis instantâneos.'
    }
  },
  {
    id: 'ff-nivel',
    slug: 'freefire-passe-de-nivel',
    name: 'Passe de Nível Free Fire',
    category: 'freefire',
    price: 39.90,
    image: '/images/passe-nivel.webp',
    description: 'Avance de nível e desbloqueie recompensas incríveis, incluindo skins exclusivas e diamantes.',
    metadata: {
      keywords: ['free fire', 'passe de nível', 'level up'],
      seoTitle: 'Passe de Nível Free Fire - Recompensas Exclusivas',
      seoDescription: 'Passe de Nível Free Fire com skins exclusivas e recompensas incríveis.'
    }
  },
  {
    id: 'ff-calca-angelical',
    slug: 'freefire-calca-angelical-azul',
    name: 'Calça Angelical Azul',
    category: 'freefire',
    price: 54.90,
    image: '/images/Calça Angelical Azul.png',
    description: 'Calça Angelical Azul - Item raro e exclusivo para seu personagem Free Fire.',
    metadata: {
      keywords: ['free fire', 'calça angelical', 'skin rara', 'item exclusivo'],
      seoTitle: 'Calça Angelical Azul Free Fire - Item Raro',
      seoDescription: 'Calça Angelical Azul para Free Fire. Item raro e exclusivo para seu personagem.'
    }
  },
  {
    id: 'ff-mochila-dino',
    slug: 'freefire-mochila-dino',
    name: 'Mochila Dino',
    category: 'freefire',
    price: 19.90,
    image: '/images/MochilaDino.png',
    description: 'Mochila temática de dinossauro para Free Fire.',
    metadata: {
      keywords: ['free fire', 'mochila dino', 'acessório'],
      seoTitle: 'Mochila Dino Free Fire - Acessório Exclusivo',
      seoDescription: 'Mochila Dino para Free Fire. Acessório temático exclusivo.'
    }
  },
  {
    id: 'ff-mochila-panda',
    slug: 'freefire-mochila-panda',
    name: 'Mochila Panda',
    category: 'freefire',
    price: 19.90,
    image: '/images/MochilaPanda.png',
    description: 'Mochila temática de panda para Free Fire.',
    metadata: {
      keywords: ['free fire', 'mochila panda', 'acessório'],
      seoTitle: 'Mochila Panda Free Fire - Acessório Exclusivo',
      seoDescription: 'Mochila Panda para Free Fire. Acessório temático exclusivo.'
    }
  },

  // ============= ROBUX =============
  {
    id: 'robux-2000',
    slug: 'roblox-2000-robux',
    name: '2000 Robux',
    category: 'robux',
    price: 28.97,
    popular: true,
    image: '/images/iconeRobux.svg',
    description: 'Recarga de 2000 Robux para Roblox. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: 2000,
      keywords: ['roblox', 'robux', '2000 robux', 'recarga roblox'],
      seoTitle: '2000 Robux - Recarga Instantânea Roblox',
      seoDescription: 'Compre 2000 Robux com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'robux-5250',
    slug: 'roblox-5250-robux',
    name: '5250 Robux',
    category: 'robux',
    price: 56.31,
    image: '/images/iconeRobux.svg',
    description: 'Recarga de 5250 Robux para Roblox. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: 5250,
      keywords: ['roblox', 'robux', '5250 robux', 'recarga roblox'],
      seoTitle: '5250 Robux - Recarga Instantânea Roblox',
      seoDescription: 'Compre 5250 Robux com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'robux-11000',
    slug: 'roblox-11000-robux',
    name: '11000 Robux',
    category: 'robux',
    price: 98.44,
    popular: true,
    image: '/images/iconeRobux.svg',
    description: 'Recarga de 11000 Robux para Roblox. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: 11000,
      keywords: ['roblox', 'robux', '11000 robux', 'recarga roblox'],
      seoTitle: '11000 Robux - Recarga Instantânea Roblox',
      seoDescription: 'Compre 11000 Robux com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },
  {
    id: 'robux-24000',
    slug: 'roblox-24000-robux',
    name: '24000 Robux',
    category: 'robux',
    price: 169.75,
    image: '/images/iconeRobux.svg',
    description: 'Recarga de 24000 Robux para Roblox. Entrega instantânea após confirmação do pagamento.',
    metadata: {
      amount: 24000,
      keywords: ['roblox', 'robux', '24000 robux', 'recarga roblox'],
      seoTitle: '24000 Robux - Recarga Instantânea Roblox',
      seoDescription: 'Compre 24000 Robux com entrega instantânea. Pagamento seguro via PIX ou cartão.'
    }
  },

  // ============= V-BUCKS (FORTNITE) =============
  {
    id: 'vbucks-2800',
    slug: 'fortnite-2800-vbucks',
    name: '2800 V-Bucks Fortnite',
    category: 'vbucks',
    price: 42.81,
    originalPrice: 84.00,
    image: '/images/2800Vbucks.avif',
    description: 'Conta Fortnite com 2800 V-Bucks. Acesso completo e seguro.',
    metadata: {
      amount: 2800,
      keywords: ['fortnite', 'v-bucks', '2800 vbucks', 'conta fortnite'],
      seoTitle: 'Conta Fortnite 2800 V-Bucks - 50% OFF',
      seoDescription: 'Conta Fortnite com 2800 V-Bucks por apenas R$ 42,81. Acesso completo e seguro.'
    }
  },
  {
    id: 'vbucks-3000',
    slug: 'fortnite-3000-vbucks',
    name: '3000 V-Bucks Fortnite',
    category: 'vbucks',
    price: 45.47,
    originalPrice: 90.00,
    image: '/images/3000Vbucks.jpeg',
    description: 'Conta Fortnite com 3000 V-Bucks. Acesso completo e seguro.',
    metadata: {
      amount: 3000,
      keywords: ['fortnite', 'v-bucks', '3000 vbucks', 'conta fortnite'],
      seoTitle: 'Conta Fortnite 3000 V-Bucks - 50% OFF',
      seoDescription: 'Conta Fortnite com 3000 V-Bucks por apenas R$ 45,47. Acesso completo e seguro.'
    }
  },
  {
    id: 'vbucks-5000',
    slug: 'fortnite-5000-vbucks',
    name: '5000 V-Bucks Fortnite',
    category: 'vbucks',
    price: 75.23,
    originalPrice: 150.00,
    popular: true,
    image: '/images/5000Vbucks.jpeg',
    description: 'Conta Fortnite com 5000 V-Bucks. Acesso completo e seguro.',
    metadata: {
      amount: 5000,
      keywords: ['fortnite', 'v-bucks', '5000 vbucks', 'conta fortnite'],
      seoTitle: 'Conta Fortnite 5000 V-Bucks - 50% OFF',
      seoDescription: 'Conta Fortnite com 5000 V-Bucks por apenas R$ 75,23. Acesso completo e seguro.'
    }
  },
  {
    id: 'vbucks-10000',
    slug: 'fortnite-10000-vbucks',
    name: '10000 V-Bucks Fortnite',
    category: 'vbucks',
    price: 150.89,
    originalPrice: 300.00,
    popular: true,
    image: '/images/10000Vbucks.jpeg',
    description: 'Conta Fortnite com 10000 V-Bucks. Acesso completo e seguro.',
    metadata: {
      amount: 10000,
      keywords: ['fortnite', 'v-bucks', '10000 vbucks', 'conta fortnite'],
      seoTitle: 'Conta Fortnite 10000 V-Bucks - 50% OFF',
      seoDescription: 'Conta Fortnite com 10000 V-Bucks por apenas R$ 150,89. Acesso completo e seguro.'
    }
  },
  {
    id: 'vbucks-13500',
    slug: 'fortnite-13500-vbucks',
    name: '13500 V-Bucks Fortnite',
    category: 'vbucks',
    price: 202.65,
    originalPrice: 405.00,
    image: '/images/13500Vbucks.jpeg',
    description: 'Conta Fortnite com 13500 V-Bucks. Acesso completo e seguro.',
    metadata: {
      amount: 13500,
      keywords: ['fortnite', 'v-bucks', '13500 vbucks', 'conta fortnite'],
      seoTitle: 'Conta Fortnite 13500 V-Bucks - 50% OFF',
      seoDescription: 'Conta Fortnite com 13500 V-Bucks por apenas R$ 202,65. Acesso completo e seguro.'
    }
  },
  {
    id: 'vbucks-27000',
    slug: 'fortnite-27000-vbucks',
    name: '27000 V-Bucks Fortnite',
    category: 'vbucks',
    price: 405.37,
    originalPrice: 810.00,
    image: '/images/27000.jpeg',
    description: 'Conta Fortnite com 27000 V-Bucks. Acesso completo e seguro.',
    metadata: {
      amount: 27000,
      keywords: ['fortnite', 'v-bucks', '27000 vbucks', 'conta fortnite'],
      seoTitle: 'Conta Fortnite 27000 V-Bucks - 50% OFF',
      seoDescription: 'Conta Fortnite com 27000 V-Bucks por apenas R$ 405,37. Acesso completo e seguro.'
    }
  },
  {
    id: 'vbucks-54000',
    slug: 'fortnite-54000-vbucks',
    name: '54000 V-Bucks Fortnite',
    category: 'vbucks',
    price: 810.92,
    originalPrice: 1620.00,
    image: '/images/54000Vbucks.jpeg',
    description: 'Conta Fortnite com 54000 V-Bucks. Acesso completo e seguro.',
    metadata: {
      amount: 54000,
      keywords: ['fortnite', 'v-bucks', '54000 vbucks', 'conta fortnite'],
      seoTitle: 'Conta Fortnite 54000 V-Bucks - 50% OFF',
      seoDescription: 'Conta Fortnite com 54000 V-Bucks por apenas R$ 810,92. Acesso completo e seguro.'
    }
  }
]

// Funções auxiliares
export function getProductBySlug(slug: string): Product | undefined {
  return productsData.find(p => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return productsData.find(p => p.id === id)
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return productsData.filter(p => p.category === category)
}

export function getAllSlugs(): string[] {
  return productsData.map(p => p.slug)
}
