import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pedido Confirmado',
  description: 'Confirmação do pedido',
}

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
