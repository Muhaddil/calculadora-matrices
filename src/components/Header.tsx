"use client"

import { useTranslation } from "react-i18next"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ReactCountryFlag from "react-country-flag"
import { useState, useMemo } from "react"
import i18n from "@/i18n/config"

export const Header = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const languages = useMemo(() => Object.keys(i18n.options.resources || {}), [])

  const filteredLangs = languages.filter((lng) =>
    lng.toLowerCase().includes(search.toLowerCase())
  )

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language)
    document.documentElement.lang = language
    setOpen(false)
  }

  const getFlag = (lang: string) => {
    const map: Record<string, string> = {
      en: "US", // Inglés
      es: "ES", // Español
      eu: "ES", // Euskera --> No hay bandera
      fr: "FR", // Francés
      de: "DE", // Alemán
      it: "IT", // Italiano
      pt: "PT", // Portugués
      zh: "CN", // Chino
      ja: "JP", // Japonés
      ko: "KR", // Coreano
    }
    return map[lang] || "UN"
  }

  const getLanguageName = (lang: string) => {
    try {
      const display = new Intl.DisplayNames([lang], { type: "language" })
      return display.of(lang)
    } catch {
      return lang.toUpperCase()
    }
  }

  const formatLanguageName = (name: string) => {
    if (!name) return ""
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-end">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ReactCountryFlag
                countryCode={getFlag(i18n.language)}
                svg
                style={{ width: "1.2em", height: "1.2em" }}
              />
              {formatLanguageName(getLanguageName(i18n.language))}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 p-2">
            {languages.length > 5 && (
              <Input
                placeholder={t("navigation.search_language") || "Buscar idioma..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2"
              />
            )}
            {filteredLangs.map((lng) => (
              <DropdownMenuItem
                key={lng}
                onClick={() => handleLanguageChange(lng)}
                className={`gap-2 ${i18n.language === lng ? "bg-accent" : ""}`}
              >
                <ReactCountryFlag
                  countryCode={getFlag(lng)}
                  svg
                  style={{ width: "1.5em", height: "1.5em" }}
                />
                {formatLanguageName(getLanguageName(lng))}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
