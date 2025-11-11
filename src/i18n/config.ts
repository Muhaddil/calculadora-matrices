import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const modules = import.meta.glob("./locales/*.json", { eager: true }) as Record<string, any>

const resources: Record<string, any> = {}

for (const path in modules) {
  const langCode = path.split("/").pop()?.replace(".json", "") || "unknown"
  resources[langCode] = { translation: modules[path].default || modules[path] }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "es",
    fallbackLng: "es",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng)
})

export default i18n
