import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Re-namer | Blackmouth Games",
  description: "Herramienta interna para renombrar imágenes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <LanguageProvider>
          <Header />
          <div className="flex-grow">{children}</div>
          <Footer />
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}



import './globals.css'