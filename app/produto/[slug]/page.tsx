import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getAllSlugs } from '@/lib/products-data'
import ProductPage from '@/components/ProductPage'

interface Props {
  params: {
    slug: string
  }
}

// Gerar metadata dinâmico para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug)
  
  if (!product) {
    return {
      title: 'Produto não encontrado'
    }
  }

  const seoTitle = product.metadata?.seoTitle || `${product.name} - Comprar Agora`
  const seoDescription = product.metadata?.seoDescription || product.description
  const keywords = product.metadata?.keywords || [product.name, product.category]

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywords.join(', '),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: [product.image],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [product.image]
    }
  }
}

// Gerar rotas estáticas em build time
export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return slugs.map((slug) => ({
    slug: slug
  }))
}

export default function ProductSlugPage({ params }: Props) {
  const product = getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }

  return <ProductPage product={product} />
}
