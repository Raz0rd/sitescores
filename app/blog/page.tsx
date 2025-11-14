'use client'

import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

export default function BlogPage() {
  const [blogContent, setBlogContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBlogContent = async () => {
      try {
        const response = await fetch('/api/fetch-blog')
        const data = await response.json()
        if (data.content) {
          setBlogContent(data.content)
        }
      } catch (error) {
        console.error('Erro ao carregar blog:', error)
        setBlogContent('<div class="p-8 text-center"><h2 class="text-2xl font-bold mb-4 text-black">Free Fire - Últimas Notícias</h2><p class="text-gray-600">Conteúdo temporariamente indisponível.</p></div>')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBlogContent()
  }, [])

  return (
    <>
      <style jsx global>{`
        body {
          background-color: #ffffff !important;
          background: #ffffff !important;
        }
        * {
          background-color: transparent !important;
        }
        html, body, #__next, main {
          background: #ffffff !important;
        }
        .bg-dark, .bg-black, [class*="bg-dark"], [class*="bg-black"] {
          background-color: #ffffff !important;
          background: #ffffff !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-white" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-6xl mx-auto p-4 bg-white" style={{ backgroundColor: '#ffffff' }}>
          {isLoading ? (
            /* Loading */
            <div className="flex items-center justify-center min-h-screen bg-white">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4 animate-pulse">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-black">Carregando conteúdo...</p>
              </div>
            </div>
          ) : (
            /* Conteúdo do Blog */
            <div className="py-8 bg-white" style={{ backgroundColor: '#ffffff' }}>
              {/* Header fixo */}
              <div className="bg-white sticky top-0 z-10 pb-4 mb-6 border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-black">Free Fire - Notícias e Dicas</h1>
                    <p className="text-xs text-gray-500">Conteúdo oficial Incogaming</p>
                  </div>
                </div>
              </div>

              {/* Conteúdo renderizado do blog */}
              <div 
                className="prose prose-sm md:prose-base max-w-none bg-white"
                dangerouslySetInnerHTML={{ __html: blogContent }}
                style={{
                  color: '#000',
                  lineHeight: '1.6',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
