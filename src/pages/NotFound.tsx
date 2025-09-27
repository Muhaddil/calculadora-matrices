"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Calculator } from "lucide-react"

interface NotFoundProps {
  pathname?: string
}

const NotFound = ({ pathname }: NotFoundProps) => {
  useEffect(() => {
    console.info("📊 Calculadora de Matrices - Página no encontrada:", pathname || window.location.pathname)
  }, [pathname])

  const handleGoHome = () => {
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center mb-4">
          <Calculator className="h-16 w-16 text-muted-foreground" />
        </div>

        <h1 className="text-6xl font-bold text-foreground">404</h1>

        <div className="space-y-2">
          <p className="text-xl text-muted-foreground">Página no encontrada</p>
          <p className="text-sm text-muted-foreground">La página que buscas no existe</p>
        </div>

        <Button onClick={handleGoHome} className="mt-6" size="lg">
          <Home className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>
      </div>
    </div>
  )
}

export default NotFound
