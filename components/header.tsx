"use client"

import Image from "next/image"
import { LanguageSwitcher } from "./language-switcher"
import { useTranslations } from "./language-provider"
import { FileImage } from "lucide-react"

export function Header() {
  const { t } = useTranslations()

  return (
    <header className="bg-black text-white py-3 shadow-md">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Image
              src="/images/bm-black.png"
              alt="Blackmouth Games Logo"
              width={120}
              height={40}
              className="invert" // Invertir colores para que se vea blanco en fondo negro
            />
          </div>
          <div className="h-8 w-px bg-gray-600 hidden md:block" />
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">{t("appTitle")}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300 hidden md:block">v1.2.0</div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}

