"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar automaticamente para a loja PRESERVANDO UTMs
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const fullPath = searchParams.toString() ? `/loja/freefire?${searchParams.toString()}` : '/loja/freefire'
      router.push(fullPath)
    }
  }, [router])

  // Mostrar loading enquanto redireciona
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
