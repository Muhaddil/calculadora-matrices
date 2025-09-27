import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator, Zap, ListTree, Grid3X3 } from "lucide-react";

interface MethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMethodSelect: (method: 'zeros' | 'cofactors' | 'sarrus') => void;
  matrixSize: number;
}

export const MethodDialog = ({ open, onOpenChange, onMethodSelect, matrixSize }: MethodDialogProps) => {
  const is3x3 = matrixSize === 3;
  const is4x4OrLarger = matrixSize >= 4;
  
  const [selectedMethod, setSelectedMethod] = useState<'zeros' | 'cofactors' | 'sarrus'>(
    is3x3 ? 'sarrus' : 'zeros'
  );

  const handleConfirm = () => {
    onMethodSelect(selectedMethod);
    onOpenChange(false);
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'zeros': return 'Ceros';
      case 'cofactors': return 'Cofactores';
      case 'sarrus': return 'Sarrus';
      default: return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar método de cálculo</DialogTitle>
          <DialogDescription>
            Elige cómo quieres calcular el determinante para esta matriz {matrixSize}×{matrixSize}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {is3x3 && (
            <Card 
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedMethod === 'sarrus' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedMethod('sarrus')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Regla de Sarrus</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Método específico para matrices 3×3. Más directo y visual.
                  </p>
                  <div className="text-xs text-primary mt-2">
                    • Específico para 3×3 • Más rápido • Recomendado para 3×3
                  </div>
                </div>
              </div>
            </Card>
          )}

          {is3x3 && (
            <Card 
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedMethod === 'cofactors' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedMethod('cofactors')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ListTree className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Método de Cofactores</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Método general aplicado a matrices 3×3. Más detallado.
                  </p>
                  <div className="text-xs text-primary mt-2">
                    • Más pasos • Más explicativo • Para aprendizaje
                  </div>
                </div>
              </div>
            </Card>
          )}

          {is4x4OrLarger && (
            <>
              <Card 
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedMethod === 'zeros' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedMethod('zeros')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Método de Ceros (Gauss)</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Más eficiente. Convierte la matriz en triangular y multiplica la diagonal.
                    </p>
                    <div className="text-xs text-primary mt-2">
                      • Menos pasos • Más rápido • Recomendado
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedMethod === 'cofactors' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedMethod('cofactors')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <ListTree className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Método de Cofactores</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Más detallado. Desarrolla por cofactores recursivamente.
                    </p>
                    <div className="text-xs text-primary mt-2">
                      • Más pasos • Más explicativo • Para aprendizaje
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            <Calculator className="mr-2 h-4 w-4" />
            Calcular con {getMethodDisplayName(selectedMethod)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};