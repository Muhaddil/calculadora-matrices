import { useState } from "react";
import { MatrixInput } from "@/components/MatrixInput";
import { StepDisplay, CalculationStep } from "@/components/StepDisplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Plus, Minus, X, RotateCcw, Hash, Grid3X3, Divide, ArrowUp } from "lucide-react";
import { addMatrices, subtractMatrices, multiplyMatrices, transposeMatrix, calculateDeterminant, calculateAdjugate, calculateInverse, createMatrix, Matrix, calculateRank } from "@/utils/matrixOperations";
import { useToast } from "@/hooks/use-toast";
import { MethodDialog } from "@/components/MethodDialog";

const Index = () => {
  const [matrixA, setMatrixA] = useState<Matrix>(createMatrix(2, 2));
  const [matrixB, setMatrixB] = useState<Matrix>(createMatrix(2, 2));
  const [steps, setSteps] = useState<CalculationStep[]>([]);
  const [currentOperation, setCurrentOperation] = useState<string>("");
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<'A' | 'B'>('A');
  const { toast } = useToast();

  const handleOperation = (operation: 'add' | 'subtract' | 'multiply') => {
    try {
      let result;
      let operationName = "";

      switch (operation) {
        case 'add':
          result = addMatrices(matrixA, matrixB);
          operationName = "Suma";
          break;
        case 'subtract':
          result = subtractMatrices(matrixA, matrixB);
          operationName = "Resta";
          break;
        case 'multiply':
          result = multiplyMatrices(matrixA, matrixB);
          operationName = "Multiplicación";
          break;
        default:
          throw new Error("Operación no válida");
      }

      setSteps(result.steps);
      setCurrentOperation(operationName);

      toast({
        title: "¡Cálculo completado!",
        description: `${operationName} de matrices realizada exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error en el cálculo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setSteps([]);
      setCurrentOperation("");
    }
  };

  const handleDeterminantClick = (matrixType: 'A' | 'B') => {
    const matrix = matrixType === 'A' ? matrixA : matrixB;

    if (matrix.length >= 3) {
      setSelectedMatrix(matrixType);
      setMethodDialogOpen(true);
    } else {
      handleSingleMatrixOperation('determinant', matrix, 'cofactors');
    }
  };

  const handleMethodSelect = (method: 'zeros' | 'cofactors' | 'sarrus') => {
    const matrix = selectedMatrix === 'A' ? matrixA : matrixB;

    try {
      const result = calculateDeterminant(matrix, method);

      setSteps(result.steps);
      setCurrentOperation("Determinante");

      let methodDescription = '';
      switch (method) {
        case 'zeros':
          methodDescription = 'Ceros (Gauss)';
          break;
        case 'cofactors':
          methodDescription = 'Cofactores';
          break;
        case 'sarrus':
          methodDescription = 'Regla de Sarrus';
          break;
      }

      toast({
        title: "¡Determinante calculado!",
        description: `Método usado: ${methodDescription}`,
      });
    } catch (error) {
      toast({
        title: "Error en el cálculo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setSteps([]);
      setCurrentOperation("");
    }
  };

  const handleSingleMatrixOperation = (operation: 'transpose' | 'determinant' | 'adjugate' | 'inverse' | 'rank', matrix: Matrix, method?: 'zeros' | 'cofactors') => {
    try {
      let result;
      let operationName = "";

      switch (operation) {
        case 'transpose':
          result = transposeMatrix(matrix);
          operationName = "Transpuesta";
          break;
        case 'determinant':
          result = calculateDeterminant(matrix, method);
          operationName = "Determinante";
          break;
        case 'adjugate':
          result = calculateAdjugate(matrix);
          operationName = "Matriz Adjunta";
          break;
        case 'inverse':
          result = calculateInverse(matrix);
          operationName = "Matriz Inversa";
          break;
        case 'rank':
          result = calculateRank(matrix);
          operationName = "Rango";
          break;
        default:
          throw new Error("Operación no válida");
      }

      setSteps(result.steps);
      setCurrentOperation(operationName);

      toast({
        title: "¡Cálculo completado!",
        description: `${operationName} calculada exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error en el cálculo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setSteps([]);
      setCurrentOperation("");
    }
  };

  const clearResults = () => {
    setSteps([]);
    setCurrentOperation("");
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-full">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Calculadora de Matrices
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Realiza operaciones con matrices y visualiza cada paso del proceso
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MatrixInput
            label="Matriz A"
            matrix={matrixA}
            onChange={setMatrixA}
          />
          <MatrixInput
            label="Matriz B"
            matrix={matrixB}
            onChange={setMatrixB}
          />
        </div>

        <div className="space-y-6 mb-8">
          <Card className="p-6 bg-linear-to-r from-card to-secondary/20 shadow-card-soft">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Operaciones con dos matrices</h2>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => handleOperation('add')}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-lg transition-smooth"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Sumar (A + B)
              </Button>
              <Button
                onClick={() => handleOperation('subtract')}
                className="bg-gradient-accent hover:opacity-90 text-accent-foreground shadow-lg transition-smooth"
                size="lg"
              >
                <Minus className="mr-2 h-4 w-4" />
                Restar (A - B)
              </Button>
              <Button
                onClick={() => handleOperation('multiply')}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-lg transition-smooth"
                size="lg"
              >
                <X className="mr-2 h-4 w-4" />
                Multiplicar (A × B)
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-linear-to-r from-card to-accent/10 shadow-card-soft">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Operaciones con una matriz</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">Matriz A</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleSingleMatrixOperation('transpose', matrixA)}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-smooth"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Transpuesta
                  </Button>
                  <Button
                    onClick={() => handleDeterminantClick('A')}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  >
                    <Hash className="mr-2 h-4 w-4" />
                    Determinante
                  </Button>
                  <Button
                    onClick={() => handleSingleMatrixOperation('adjugate', matrixA)}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-smooth"
                  >
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Adjunta
                  </Button>
                  <Button
                    onClick={() => handleSingleMatrixOperation('inverse', matrixA)}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  >
                    <Divide className="mr-2 h-4 w-4" />
                    Inversa
                  </Button>
                  <Button
                    onClick={() => handleSingleMatrixOperation('rank', matrixA)}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-smooth"
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Rango
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-foreground">Matriz B</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleSingleMatrixOperation('transpose', matrixB)}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-smooth"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Transpuesta
                  </Button>
                  <Button
                    onClick={() => handleDeterminantClick('B')}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  >
                    <Hash className="mr-2 h-4 w-4" />
                    Determinante
                  </Button>
                  <Button
                    onClick={() => handleSingleMatrixOperation('adjugate', matrixB)}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-smooth"
                  >
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Adjunta
                  </Button>
                  <Button
                    onClick={() => handleSingleMatrixOperation('inverse', matrixB)}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  >
                    <Divide className="mr-2 h-4 w-4" />
                    Inversa
                  </Button>
                  <Button
                    onClick={() => handleSingleMatrixOperation('rank', matrixB)}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-smooth"
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Rango
                  </Button>
                </div>
              </div>
            </div>

            {steps.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  onClick={clearResults}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Limpiar resultados
                </Button>
              </div>
            )}
          </Card>
        </div>

        {currentOperation && (
          <div className="mb-6">
            <Badge className="bg-gradient-accent text-accent-foreground px-4 py-2 text-lg">
              {currentOperation} de Matrices
            </Badge>
          </div>
        )}

        <StepDisplay steps={steps} />

        <MethodDialog
          open={methodDialogOpen}
          onOpenChange={setMethodDialogOpen}
          onMethodSelect={handleMethodSelect}
          matrixSize={selectedMatrix === 'A' ? matrixA.length : matrixB.length}
        />
      </div>
    </div>
  );
};

export default Index;