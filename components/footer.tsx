"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "./language-provider"

export function Footer() {
  const { t } = useTranslations()

  return (
    <footer className="bg-black text-white py-4 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Image
            src="/images/bm-black.png"
            alt="Blackmouth Games Logo"
            width={100}
            height={30}
            className="invert" // Invertir colores para que se vea blanco en fondo negro
          />
        </div>
        <div className="text-sm text-gray-400">
          <Link
            href="https://blackmouthgames.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            © {new Date().getFullYear()} Blackmouth Games
          </Link>
        </div>
      </div>
    </footer>
  )
}

