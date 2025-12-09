"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import HeadManager from '@/components/HeadManager'
import { CartProvider, useCart } from '@/contexts/CartContext'
// CartButton REMOVIDO - Usando apenas FixedCartButton no LojaLayout

function LojaContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* CartButton lateral REMOVIDO - Usando apenas botão fixo inferior */}
    </>
  )
}

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Forçar light mode
  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark')
    html.removeAttribute('data-theme')
    html.style.colorScheme = 'light'
  }, [])

  return (
    <CartProvider>
      <HeadManager />
      <LojaContent>{children}</LojaContent>
    </CartProvider>
  )
}
