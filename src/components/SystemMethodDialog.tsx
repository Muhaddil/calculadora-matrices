import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, Grid3X3, Zap } from "lucide-react";

interface SystemMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMethodSelect: (method: 'gauss' | 'cramer') => void;
  matrixSize: number;
  isSquare: boolean;
}

export const SystemMethodDialog = ({
  open,
  onOpenChange,
  onMethodSelect,
  matrixSize,
  isSquare
}: SystemMethodDialogProps) => {
  // const isCramerApplicable = isSquare;
  const isCramerApplicable = true;
  const isGaussApplicable = true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Método de Resolución
          </DialogTitle>
          <DialogDescription>
            Elige el método para resolver el sistema de ecuaciones
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <Card
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${isCramerApplicable
                ? "border-purple-200 hover:border-purple-400"
                : "border-gray-200 opacity-60"
              }`}
            onClick={() => isCramerApplicable && onMethodSelect('cramer')}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Grid3X3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Regla de Cramer
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Resuelve usando determinantes. Solo aplicable para sistemas cuadrados con determinante no nulo.
                </p>
                {!isCramerApplicable && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ No disponible para sistemas no cuadrados
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer border-blue-200 hover:border-blue-400 hover:shadow-md transition-all" ${isGaussApplicable
                ? "border-purple-200 hover:border-purple-400"
                : "border-gray-200 opacity-60"
              }`}
            onClick={() => isGaussApplicable && onMethodSelect('gauss')}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Eliminación Gaussiana
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Método general que funciona para cualquier sistema. Incluye solución paramétrica para sistemas indeterminados.
                </p>
                {!isGaussApplicable && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ No disponible de momento
                  </p>
                )}

              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onMethodSelect('cramer')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Usar Cramer (Por Defecto)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};