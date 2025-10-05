import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatrixDisplay } from "./MatrixDisplay";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { SymbolicSystemResult } from "./symbolicOperations";

export interface CalculationStep {
  stepNumber: number;
  title: string;
  description: string;
  matrices?: {
    label: string;
    matrix: number[][];
    highlight?: boolean;
    fraction?: string;
    showAsFraction?: boolean;
    customLabels?: string[][];
  }[];
  formula?: string;
}

interface StepDisplayProps {
  steps: CalculationStep[];
  className?: string;
  specialCases?: Array<{
    condition: string;
    solution: SymbolicSystemResult;
  }>;
}

const LatexWithLineBreaks = ({ text }: { text: string }) => {
  return text.split('\n').map((line, index) => {
    const parts = line.split(/(\$[^$]+\$)/g);
    return (
      <span key={index}>
        {parts.map((part, i) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            return <InlineMath key={i} math={math} />;
          }
          return part;
        })}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
};

const SpecialCaseDisplay = ({ specialCase, index }: { 
  specialCase: { condition: string; solution: SymbolicSystemResult }; 
  index: number 
}) => {
  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200 mt-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Caso {index + 1}
          </Badge>
          <h4 className="font-semibold text-yellow-800">
            Condición: <InlineMath math={specialCase.condition} />
          </h4>
        </div>
        
        <div className="text-sm text-yellow-700">
          <strong>Compatibilidad:</strong> {specialCase.solution.compatibility}
        </div>

        {specialCase.solution.steps && specialCase.solution.steps.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-yellow-800">Proceso de resolución:</div>
            {specialCase.solution.steps.map((step, stepIndex) => (
              <Card key={stepIndex} className="p-3 bg-white border">
                <div className="text-xs font-medium text-gray-600">Paso {step.stepNumber}</div>
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-600 mt-1">
                  <LatexWithLineBreaks text={step.description} />
                </div>
                {step.formula && (
                  <div className="bg-gray-50 p-2 rounded mt-2">
                    <BlockMath math={step.formula} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {specialCase.solution.solution && (
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <div className="text-sm font-medium text-green-800">Solución:</div>
            <BlockMath math={`
              \\begin{cases}
                ${specialCase.solution.solution.map((row, i) => 
                  `x_{${i + 1}} = ${row[0].toLatex()}`
                ).join(' \\\\ ')}
              \\end{cases}
            `} />
          </div>
        )}
      </div>
    </Card>
  );
};

export const StepDisplay = ({ steps, className = "", specialCases = [] }: StepDisplayProps) => {
  if (steps.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-foreground mb-4">Proceso paso a paso</h2>

      {steps.map((step) => (
        <Card
          key={step.stepNumber}
          className="p-6 bg-linear-to-r from-card to-secondary/20 shadow-card-soft border transition-smooth hover:shadow-lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="default"
                className="bg-gradient-primary text-primary-foreground px-3 py-1"
              >
                Paso {step.stepNumber}
              </Badge>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              <LatexWithLineBreaks text={step.description} />
            </p>

            {step.formula && (
              <div className="bg-muted p-3 rounded-lg border">
                <BlockMath math={step.formula} />
              </div>
            )}

            {step.matrices && (
              <div className="w-full">
                <div className="w-full overflow-x-auto">
                  <div className="grid grid-flow-col auto-cols-min gap-4 items-start py-2">
                    {step.matrices.map((matrixInfo, index) => (
                      <div key={index} className="self-start min-w-0">
                        <MatrixDisplay
                          key={index}
                          matrix={matrixInfo.matrix}
                          label={matrixInfo.label}
                          highlight={matrixInfo.highlight}
                          fraction={matrixInfo.fraction}
                          showAsFraction={matrixInfo.showAsFraction}
                          customLabels={matrixInfo.customLabels}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {specialCases.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-blue-500 text-white px-3 py-1">
                Casos Especiales
              </Badge>
              <h3 className="text-lg font-semibold text-blue-800">
                Análisis de Valores Críticos
              </h3>
            </div>
            
            <p className="text-blue-700 leading-relaxed">
              Se encontraron {specialCases.length} caso(s) especial(es) donde el sistema tiene comportamiento diferente:
            </p>

            {specialCases.map((specialCase, index) => (
              <SpecialCaseDisplay 
                key={index} 
                specialCase={specialCase} 
                index={index} 
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};