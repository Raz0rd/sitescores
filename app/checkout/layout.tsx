export const metadata = {
  title: 'Central de Recarga Jogo',
  description: 'Central de Recarga Jogo',
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
