import { useState, useEffect } from "react";
import { MatrixInput } from "@/components/MatrixInput";
import { StepDisplay, CalculationStep } from "@/components/StepDisplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Plus, Minus, X, RotateCcw, Hash, Grid3x2 as Grid3X3, Divide, ArrowUp, ExternalLink, Download, RefreshCw, ChevronUp, ChevronDown, BookOpen, Zap, Sigma } from "lucide-react";
import { addMatrices, subtractMatrices, multiplyMatrices, transposeMatrix, calculateDeterminant, calculateAdjugate, calculateInverse, createMatrix, Matrix, calculateRank, solveLinearSystem, solveLinearSystemWithCramer } from "@/utils/matrixOperations";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { MethodDialog } from "@/components/MethodDialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import packageJson from '../../package.json';
import { SystemMethodDialog } from "@/components/SystemMethodDialog";
import { parseSymbolicMatrix, calculateSymbolicDeterminant } from "@/utils/symbolicMatrixOperations";
import { solveSymbolicLinearSystem, SymbolicSystemResult } from "@/utils/symbolicSystemOperations";

const currentVersion = packageJson.version;

const Index = () => {
  const [matrixA, setMatrixA] = useState<Matrix>(createMatrix(2, 2));
  const [matrixB, setMatrixB] = useState<Matrix>(createMatrix(2, 2));
  const [steps, setSteps] = useState<CalculationStep[]>([]);
  const [currentOperation, setCurrentOperation] = useState<string>("");
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<'A' | 'B'>('A');
  const [remoteVersion, setRemoteVersion] = useState<string>("");
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const [systemMatrixA, setSystemMatrixA] = useState<Matrix>(createMatrix(2, 2));
  const [systemVectorB, setSystemVectorB] = useState<Matrix>(createMatrix(2, 1));
  const [systemSolution, setSystemSolution] = useState<Matrix | null>(null);
  const [systemCompatibility, setSystemCompatibility] = useState<string>("");
  const [systemMethodDialogOpen, setSystemMethodDialogOpen] = useState(false);
  const [selectedSystemMethod, setSelectedSystemMethod] = useState<'gauss' | 'cramer' | ''>('');

  const [symbolicMatrix, setSymbolicMatrix] = useState<Matrix>(createMatrix(2, 2));
  const [symbolicMethodDialogOpen, setSymbolicMethodDialogOpen] = useState(false);

  const [specialCases, setSpecialCases] = useState<Array<{
    condition: string;
    solution: SymbolicSystemResult;
  }>>([]);

  const { toast } = useToast();

  async function checkForUpdate() {
    try {
      const response = await fetch('https://muhaddil.github.io/calculadora-matrices/version.json', { cache: 'no-store' });
      const remote = await response.json();
      if (remote.version && remote.version !== currentVersion) {
        setRemoteVersion(remote.version);
        setUpdateAvailable(true);
      }
    } catch (e) {
      console.warn('Error comprobando actualizaciones:', e);
    }
  }

  useEffect(() => {
    checkForUpdate();

    const interval = setInterval(() => {
      checkForUpdate();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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

  const handleSystemSolve = (method: 'gauss' | 'cramer') => {
    try {
      const hasVariables = systemMatrixA.some(row =>
        row.some(cell => typeof cell === 'string' && /[a-zA-Z]/.test(cell.toString()))
      ) || systemVectorB.some(row =>
        row.some(cell => typeof cell === 'string' && /[a-zA-Z]/.test(cell.toString()))
      );

      if (hasVariables) {
        const result = solveSymbolicLinearSystem(systemMatrixA, systemVectorB, method);

        setSteps(result.steps);
        setSpecialCases(result.specialCases || []);
        setCurrentOperation(`Sistema de Ecuaciones (Simbólico)`);
        setSystemSolution(null);
        setSystemCompatibility(result.compatibility);

        toast({
          title: "¡Sistema resuelto simbólicamente!",
          description: `Sistema ${result.compatibility.toLowerCase()} con parámetros.`,
        });
      } else {
        const numericA = systemMatrixA.map(row =>
          row.map(cell => {
            if (typeof cell === 'number') return cell;
            const parsed = parseFloat(cell);
            return isNaN(parsed) ? 0 : parsed;
          })
        );

        const numericB = systemVectorB.map(row =>
          row.map(cell => {
            if (typeof cell === 'number') return cell;
            const parsed = parseFloat(cell);
            return isNaN(parsed) ? 0 : parsed;
          })
        );

        const isSquare = systemMatrixA.length === systemMatrixA[0]?.length;
        const shouldUseCramer = method === 'cramer' && isSquare;

        if (shouldUseCramer) {
          const detA = calculateDeterminant(numericA, 'cofactors').result[0][0];
          if (Math.abs(detA) < 1e-10) {
            toast({
              title: "Cramer no aplicable",
              description: "El determinante es cero. Usando eliminación gaussiana.",
              variant: "destructive",
            });
            const result = solveLinearSystem(numericA, numericB);
            setSteps(result.steps);
            setCurrentOperation("Sistema de Ecuaciones (Gauss)");
            setSystemSolution(result.solution);
            setSystemCompatibility(result.compatibility);
            return;
          }
        }

        const result = shouldUseCramer
          ? solveLinearSystemWithCramer(numericA, numericB)
          : solveLinearSystem(numericA, numericB);

        setSteps(result.steps);
        setCurrentOperation(`Sistema de Ecuaciones (${shouldUseCramer ? 'Cramer' : 'Gauss'})`);
        setSystemSolution(result.solution);
        setSystemCompatibility(result.compatibility);

        toast({
          title: "¡Sistema resuelto!",
          description: `Sistema ${result.compatibility.toLowerCase()} resuelto con ${shouldUseCramer ? 'Cramer' : 'Gauss'}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error en el cálculo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setSteps([]);
      setCurrentOperation("");
      setSystemSolution(null);
      setSystemCompatibility("");
      setSpecialCases([]);
    }
  };

  const handleSystemMethodSelect = (method: 'gauss' | 'cramer') => {
    setSelectedSystemMethod(method);
    setSystemMethodDialogOpen(false);
    handleSystemSolve(method);
  };

  const handleSymbolicDeterminant = (method: 'zeros' | 'cofactors' | 'sarrus') => {
    try {
      const symbolicMatrixParsed = parseSymbolicMatrix(symbolicMatrix);
      const result = calculateSymbolicDeterminant(symbolicMatrixParsed, method);

      setSteps(result.steps);
      setCurrentOperation("Determinante Simbólico");

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
        title: "¡Determinante simbólico calculado!",
        description: `Método usado: ${methodDescription}`,
      });
    } catch (error) {
      toast({
        title: "Error en el cálculo simbólico",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setSteps([]);
      setCurrentOperation("");
    }
  };

  const handleSymbolicMethodSelect = (method: 'zeros' | 'cofactors' | 'sarrus') => {
    if (symbolicMatrix.length >= 3) {
      handleSymbolicDeterminant(method);
      setSymbolicMethodDialogOpen(false);
    } else {
      handleSymbolicDeterminant('cofactors');
      setSymbolicMethodDialogOpen(false);
    }
  };

  const clearResults = () => {
    setSteps([]);
    setCurrentOperation("");
    setSystemSolution(null);
    setSystemCompatibility("");
    setSpecialCases([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-bg relative">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {updateAvailable && (
          <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <RefreshCw className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <AlertTitle className="text-blue-700 dark:text-blue-400">¡Nueva versión disponible!</AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-300">
              Hay una nueva versión disponible ({remoteVersion}). La versión actual es {currentVersion}.
              <Button
                variant="outline"
                size="sm"
                className="ml-4 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                onClick={() => window.location.reload()}
              >
                <Download className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <div className="p-3 bg-gradient-primary rounded-full">
                <Calculator className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Calculadora de Matrices
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Realiza operaciones con matrices y visualiza cada paso del proceso
            </p>
          </div>

          <Button
            onClick={() => window.open("https://muhaddil.github.io/", "_blank")}
            className="rounded-full p-3 group whitespace-nowrap flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <span className="font-medium">Ver más páginas</span>
            <ExternalLink className="h-4 w-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MatrixInput
            label="Matriz A"
            matrix={matrixA}
            onChange={setMatrixA}
            allowVariables={false}
          />
          <MatrixInput
            label="Matriz B"
            matrix={matrixB}
            onChange={setMatrixB}
            allowVariables={false}
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
          </Card>

          <Collapsible>
            <Card className="p-6 bg-linear-to-r from-card to-orange-500/10 shadow-card-soft border-2 border-orange-200">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left mb-4 group">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Sigma className="h-5 w-5 text-orange-500" />
                    Determinante con Parámetros
                  </h2>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800 mb-4">
                    💡 Ingresa una matriz con variables (a, b, c, x, y, z, etc.) y obtén el determinante como expresión algebraica
                  </div>

                  <MatrixInput
                    label="Matriz con parámetros"
                    matrix={symbolicMatrix}
                    onChange={setSymbolicMatrix}
                    allowVariables={true}
                    allowParameters={true}
                  />

                  <Button
                    onClick={() => {
                      if (symbolicMatrix.length >= 3) {
                        setSymbolicMethodDialogOpen(true);
                      } else {
                        handleSymbolicDeterminant('cofactors');
                      }
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transition-smooth w-full py-3"
                    size="lg"
                  >
                    <Sigma className="mr-2 h-5 w-5" />
                    Calcular Determinante Simbólico
                  </Button>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible>
            <Card className="p-6 bg-linear-to-r from-card to-purple-500/10 shadow-card-soft border-2 border-purple-200">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left mb-4 group">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    Sistemas de Ecuaciones Lineales
                  </h2>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 text-foreground">Matriz de Coeficientes (A)</h3>
                      <MatrixInput
                        label=""
                        matrix={systemMatrixA}
                        onChange={setSystemMatrixA}
                        allowVariables={true}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 text-foreground">Vector Términos Independientes (B)</h3>
                      <MatrixInput
                        label=""
                        matrix={systemVectorB}
                        onChange={setSystemVectorB}
                        allowVariables={true}
                        allowParameters={true}
                        forceSingleColumn={true}
                        showControls={false}
                        systemMatrixA={systemMatrixA}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSystemMethodDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transition-smooth w-full py-3"
                    size="lg"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Resolver Sistema A·X = B
                  </Button>

                  {systemCompatibility && (
                    <div className="mt-4 p-4 bg-step-highlight rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={
                          systemCompatibility.includes("COMPATIBLE")
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }>
                          {systemCompatibility}
                        </Badge>
                        <Badge variant="outline" className="border-purple-400 text-purple-600">
                          {selectedSystemMethod === 'cramer' ? 'Método: Cramer' : 'Método: Gauss'}
                        </Badge>
                      </div>
                      {systemSolution && (
                        <span className="text-sm text-muted-foreground">
                          Solución encontrada - Ver pasos abajo
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

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
        </div>

        {currentOperation && (
          <div className="mb-6">
            <Badge className="bg-gradient-accent text-accent-foreground px-4 py-2 text-lg">
              {currentOperation}
            </Badge>
          </div>
        )}

        <StepDisplay steps={steps} specialCases={specialCases} />

        <MethodDialog
          open={methodDialogOpen}
          onOpenChange={setMethodDialogOpen}
          onMethodSelect={handleMethodSelect}
          matrixSize={selectedMatrix === 'A' ? matrixA.length : matrixB.length}
        />

        <MethodDialog
          open={symbolicMethodDialogOpen}
          onOpenChange={setSymbolicMethodDialogOpen}
          onMethodSelect={handleSymbolicMethodSelect}
          matrixSize={symbolicMatrix.length}
        />

        <SystemMethodDialog
          open={systemMethodDialogOpen}
          onOpenChange={setSystemMethodDialogOpen}
          onMethodSelect={handleSystemMethodSelect}
          matrixSize={systemMatrixA.length}
          isSquare={systemMatrixA.length === systemMatrixA[0]?.length}
        />
      </div>

      <div className="fixed bottom-4 left-4 z-10">
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 shadow-md">
          v{currentVersion}
        </Badge>
      </div>

      {showScrollButton && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-10 rounded-full p-3 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-lg transition-smooth"
          size="icon"
          aria-label="Volver arriba"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default Index;