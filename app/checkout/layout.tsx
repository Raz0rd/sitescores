export const metadata = {
  title: 'Recarga Jogo Free Fire',
  description: 'Recarga Jogo Free Fire',
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
