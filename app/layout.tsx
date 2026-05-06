import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Armurerie SCUM",
  description: "Boutique armurerie serveur SCUM",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
