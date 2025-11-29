import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Centro de Recarga Oficial - Free Fire, Delta Force, Haikyu | Ofertas Exclusivas",
  description: "Centro oficial de recarga de jogos com ofertas exclusivas para usuários verificados. Recarga Free Fire, Delta Force e Haikyu com segurança e rapidez. Transações 100% seguras!",
  keywords: [
    "recarga diamantes ff",
    "diamantes ff",
    "dimas ff",
    "recarga free fire",
    "comprar diamantes free fire",
    "diamantes free fire barato",
    "recarga ff com id",
    "site recarga free fire",
    "recarga de jogos",
    "recarga jogo com id",
    "recarga jogos mobile",
    "pc gamer",
    "montar pc gamer",
    "periféricos gamer",
    "speedrepair",
  ],
  openGraph: {
    title: "Centro de Recarga Oficial - Free Fire, Delta Force, Haikyu",
    description: "Centro oficial de recarga com ofertas exclusivas para usuários verificados. Transações 100% seguras!",
    type: "website",
  },
}

export default function QuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
