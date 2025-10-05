import { Card } from "@/components/ui/card";
import { BlockMath } from "react-katex";

interface MatrixDisplayProps {
  matrix: number[][];
  label?: string;
  className?: string;
  highlight?: boolean;
  fraction?: string;
  showAsFraction?: boolean;
  customLabels?: string[][];
}

export const MatrixDisplay = ({
  matrix,
  label,
  className = "",
  highlight = false,
  fraction,
  showAsFraction = false,
  customLabels,
}: MatrixDisplayProps) => {
  if (!matrix || matrix.length === 0) return null;

  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  const maxRows = 8;
  const maxCols = 6;
  const shouldScroll = rows > maxRows || cols > maxCols;

  return (
    <Card
      className={`w-full p-4 ${
        highlight ? "bg-step-highlight border-accent" : "bg-card"
      } border transition-smooth ${className}`}
    >
      <div className="flex flex-col items-center w-full">
        {label && (
          <div className="mb-3 text-center w-full">
            <div className="text-sm font-semibold text-foreground">
              <BlockMath math={label} />
            </div>
          </div>
        )}

        <div className="flex items-start justify-center gap-3 w-full">
          {fraction && (
            <div className="text-xl font-math flex-shrink-0">
              <BlockMath math={fraction} />
            </div>
          )}

          <div className="relative w-full" style={{ overflow: "visible" }}>
            <div className="absolute top-0 bottom-0 w-[3px] -translate-x-[6px] bg-primary rounded-full pointer-events-none" style={{ left: 0 }} />
            <div className="absolute top-0 bottom-0 w-[3px] translate-x-[6px] bg-primary rounded-full pointer-events-none" style={{ right: 0 }} />

            <div
              className={`w-full ${shouldScroll ? "overflow-auto max-h-64" : "overflow-visible"}`}
            >
              <div
                className="inline-block"
                style={{
                  minWidth: "max-content",
                }}
              >
                <div
                  className="inline-grid gap-2 py-2 px-3"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(4rem, max-content))`,
                  }}
                >
                  {matrix.map((row, i) =>
                    row.map((cell, j) => {
                      const hasCustom = !!(customLabels && customLabels[i] && customLabels[i][j]);
                      const titleText = hasCustom ? String(customLabels![i][j]) : String(cell);

                      const plainContent =
                        fraction ? Math.round(cell) :
                        showAsFraction ? formatAsFraction(cell) :
                        Number.isInteger(cell) ? cell : cell.toFixed(2);

                      return (
                        <div
                          key={`${i}-${j}`}
                          className="flex items-center justify-center bg-matrix-cell border border-matrix-border rounded text-xs font-mono text-foreground px-3 py-2 text-center"
                          style={{
                            minWidth: "4rem",
                            maxWidth: "min(40rem, 60vw)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={titleText}
                        >
                          <div
                            className="katex-wrapper"
                            style={{
                              display: "inline-block",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {hasCustom ? (
                              <BlockMath math={customLabels![i][j]} />
                            ) : (
                              <span>{plainContent as any}</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
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
      if (Math.abs(value - num / den) < tolerance) {
        return simplifyFraction(num, den);
      }
    }
  }

  return value.toFixed(4).replace(/\.?0+$/, "");
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