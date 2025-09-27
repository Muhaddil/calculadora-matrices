import { Card } from "@/components/ui/card";
import { BlockMath } from 'react-katex';

interface MatrixDisplayProps {
  matrix: number[][];
  label?: string;
  className?: string;
  highlight?: boolean;
  fraction?: string;
  showAsFraction?: boolean;
}

export const MatrixDisplay = ({ 
  matrix, 
  label, 
  className = "", 
  highlight = false,
  fraction,
  showAsFraction = false
}: MatrixDisplayProps) => {
  if (!matrix || matrix.length === 0) return null;

  const cols = matrix[0]?.length || 0;

  return (
    <Card className={`p-4 ${highlight ? 'bg-step-highlight border-accent' : 'bg-card'} shadow-card-soft border transition-smooth ${className}`}>
      <div className="flex flex-col items-center">
        {label && (
          <div className="mb-3 text-center w-full">
            <div className="text-sm font-semibold text-foreground">
              <BlockMath math={label} />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-3">
          {fraction && (
            <div className="text-xl font-math">
              <BlockMath math={fraction} />
            </div>
          )}
          
          <div className="relative">
            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
            <div className="absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
            
            <div 
              className="grid gap-3 py-2 px-4"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {matrix.map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="w-12 h-10 flex items-center justify-center text-sm font-mono text-foreground bg-matrix-cell border border-matrix-border rounded"
                  >
                    {fraction ? 
                      Math.round(cell)
                      : (showAsFraction ? 
                          formatAsFraction(cell)
                          : (Number.isInteger(cell) ? cell : cell.toFixed(2))
                        )
                    }
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const formatAsFraction = (value: number): string => {
  if (Number.isInteger(value)) return value.toString();
  
  const tolerance = 1e-6;
  for (let den = 1; den <= 100; den++) {
    for (let num = -100; num <= 100; num++) {
      if (Math.abs(value - num/den) < tolerance) {
        return simplifyFraction(num, den);
      }
    }
  }
  
  return value.toFixed(4).replace(/\.?0+$/, '');
};

const simplifyFraction = (numerator: number, denominator: number): string => {
  if (denominator === 0) return "∞";
  if (numerator === 0) return "0";
  
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };
  
  const divisor = gcd(numerator, denominator);
  let simplifiedNum = numerator / divisor;
  let simplifiedDen = denominator / divisor;
  
  if (simplifiedDen < 0) {
    simplifiedNum = -simplifiedNum;
    simplifiedDen = -simplifiedDen;
  }
  
  if (simplifiedDen === 1) return simplifiedNum.toString();
  
  return `${simplifiedNum}/${simplifiedDen}`;
};