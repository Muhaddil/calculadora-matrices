"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calculator, Zap, ListTree, Grid3X3 } from "lucide-react"

interface MethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMethodSelect: (method: "zeros" | "cofactors" | "sarrus") => void
  matrixSize: number
}

export const MethodDialog = ({ open, onOpenChange, onMethodSelect, matrixSize }: MethodDialogProps) => {
  const { t } = useTranslation()
  const is3x3 = matrixSize === 3
  const is4x4OrLarger = matrixSize >= 4

  const [selectedMethod, setSelectedMethod] = useState<"zeros" | "cofactors" | "sarrus">(is3x3 ? "sarrus" : "zeros")

  const handleConfirm = () => {
    onMethodSelect(selectedMethod)
    onOpenChange(false)
  }

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case "zeros":
        return t("methods.zeros")
      case "cofactors":
        return t("methods.cofactors")
      case "sarrus":
        return t("methods.sarrus")
      default:
        return method
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogs.selectCalculationMethod")}</DialogTitle>
          <DialogDescription>{t("dialogs.chooseCalculationMethod", { size: matrixSize })}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {is3x3 && (
            <Card
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedMethod === "sarrus" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedMethod("sarrus")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t("dialogs.sarrusRule")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("dialogs.sarrusDescription")}</p>
                  <div className="text-xs text-primary mt-2">{t("dialogs.sarrusFeatures")}</div>
                </div>
              </div>
            </Card>
          )}

          {is3x3 && (
            <Card
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedMethod === "cofactors" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedMethod("cofactors")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ListTree className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t("dialogs.cofactorsMethod")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("dialogs.cofactorsDescription")}</p>
                  <div className="text-xs text-primary mt-2">{t("dialogs.cofactorsFeatures")}</div>
                </div>
              </div>
            </Card>
          )}

          {is4x4OrLarger && (
            <>
              <Card
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedMethod === "zeros" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedMethod("zeros")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("dialogs.zerosMethod")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t("dialogs.zerosDescription")}</p>
                    <div className="text-xs text-primary mt-2">{t("dialogs.zerosFeatures")}</div>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedMethod === "cofactors"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedMethod("cofactors")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <ListTree className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("dialogs.cofactorsMethod")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t("dialogs.cofactorsDescription")}</p>
                    <div className="text-xs text-primary mt-2">{t("dialogs.cofactorsFeatures")}</div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("buttons.cancel")}
          </Button>
          <Button onClick={handleConfirm}>
            <Calculator className="mr-2 h-4 w-4" />
            {t("buttons.calculate", { method: getMethodDisplayName(selectedMethod) })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
