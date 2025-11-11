export const metadata = {
  title: 'Checkout | Loja Digital',
  description: 'Finalizar compra',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
