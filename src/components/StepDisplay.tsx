import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatrixDisplay } from "./MatrixDisplay";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

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
  }[];
  formula?: string;
}

interface StepDisplayProps {
  steps: CalculationStep[];
  className?: string;
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

export const StepDisplay = ({ steps, className = "" }: StepDisplayProps) => {
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
    </div>
  );
};
