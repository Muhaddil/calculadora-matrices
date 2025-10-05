import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

interface MatrixInputProps {
  label: string;
  matrix: (number | string)[][];
  onChange: (matrix: number[][]) => void;
  className?: string;
  allowVariables?: boolean;
  showControls?: boolean;
  forceSingleColumn?: boolean;
  systemMatrixA?: number[][];
  allowParameters?: boolean;
}

export const MatrixInput = ({
  label,
  matrix,
  onChange,
  className = "",
  allowVariables = false,
  showControls = true,
  forceSingleColumn = false,
  systemMatrixA = [[]],
  allowParameters = false,
}: MatrixInputProps) => {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  const [matrixStr, setMatrixStr] = useState(
    matrix.map((row) => row.map((cell) => cell.toString()))
  );

  useEffect(() => {
    setMatrixStr(matrix.map((row) => row.map((cell) => cell.toString())));
  }, [rows, cols]);

  const parseExpression = (value: string): number | string => {
    if (!value || value === "-" || value === "." || value === "-.") return 0;

    value = value.trim();

    if (allowParameters || allowVariables) {
      return value;
    }

    if (/^-?\d*\.?\d+$/.test(value)) {
      return parseFloat(value);
    }

    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(value)) {
      return 1;
    }

    if (/^-[a-zA-Z][a-zA-Z0-9]*$/.test(value)) {
      return -1;
    }

    const coefMatch = value.match(/^(-?)(\d*\.?\d*)([a-zA-Z][a-zA-Z0-9]*)$/);
    if (coefMatch) {
      const [_, sign, numStr, variable] = coefMatch;
      let num = numStr === '' ? 1 : parseFloat(numStr);
      if (sign === '-') num = -num;
      return num;
    }

    const explicitMultMatch = value.match(/^(-?)(\d*\.?\d*)\s*\*\s*([a-zA-Z][a-zA-Z0-9]*)$/);
    if (explicitMultMatch) {
      const [_, sign, numStr, variable] = explicitMultMatch;
      let num = numStr === '' ? 1 : parseFloat(numStr);
      if (sign === '-') num = -num;
      return num;
    }

    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const updateCell = (row: number, col: number, value: string) => {
    const newMatrixStr = matrixStr.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );

    setMatrixStr(newMatrixStr);

    if (allowVariables || allowParameters) {
      const mixedMatrix = newMatrixStr.map((r, i) =>
        r.map((v, j) => {
          if (v === "" || v === "-" || v === "." || v === "-.") return 0;
          return parseExpression(v);
        })
      );
      onChange(mixedMatrix);
    } else {
      const numericMatrix = newMatrixStr.map((r, i) =>
        r.map((v, j) => {
          if (v === "" || v === "-" || v === "." || v === "-.") return 0;
          const parsed = parseFloat(v);
          return isNaN(parsed) ? 0 : parsed;
        })
      );
      onChange(numericMatrix);
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (allowVariables) {
      updateCell(row, col, value);
    } else {
      if (value === "" || value === "-" || value === "." || value === "-." || /^-?\d*\.?\d*$/.test(value)) {
        updateCell(row, col, value);
      }
    }
  };

  useEffect(() => {
    if (forceSingleColumn) {
      const newRows = systemMatrixA.length;
      const newMatrix = Array.from({ length: newRows }, (_, i) => [matrix[i]?.[0] || 0]);
      onChange(newMatrix);
      setMatrixStr(newMatrix.map(row => row.map(cell => cell.toString())));
    }
  }, [systemMatrixA.length]);

  const addRow = () => {
    if (rows < 10) {
      const newRow = new Array(cols).fill(0);
      onChange([...matrix, newRow]);
    }
  };

  const removeRow = () => {
    if (rows > 1) {
      onChange(matrix.slice(0, -1));
      setMatrixStr((prev) => prev.slice(0, -1));
    }
  };

  const addCol = () => {
    if (forceSingleColumn) return;
    if (cols < 10) {
      const newMatrix = matrix.map((row) => [...row, 0]);
      onChange(newMatrix);
      setMatrixStr((prev) => prev.map((r) => [...r, "0"]));
    }
  };

  const removeCol = () => {
    if (forceSingleColumn) return;
    if (cols > 1) {
      const newMatrix = matrix.map((row) => row.slice(0, -1));
      onChange(newMatrix);
      setMatrixStr((prev) => prev.map((r) => r.slice(0, -1)));
    }
  };

  return (
    <Card
      className={`p-6 bg-linear-to-br from-card to-secondary/30 shadow-card-soft border-matrix-border transition-smooth ${className}`}
    >
      <div className="space-y-4">
        {showControls && (
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-foreground">{label}</Label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={removeRow}
                  disabled={rows <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">{rows}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addRow}
                  disabled={rows >= 10}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={removeCol}
                  disabled={cols <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">{cols}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addCol}
                  disabled={cols >= 10}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {!showControls && label && (
          <Label className="text-lg font-semibold text-foreground">{label}</Label>
        )}

        <div className="matrix-container max-h-96 max-w-full overflow-auto">
          <div
            className="inline-grid gap-2 p-4 bg-matrix-cell rounded-lg border-2 border-matrix-border shadow-matrix"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {matrixStr.map((row, i) =>
              row.map((cell, j) => (
                <Input
                  key={`${i}-${j}`}
                  type="text"
                  value={cell}
                  onChange={(e) => handleInputChange(i, j, e.target.value)}
                  className="w-12 h-10 text-center font-mono text-sm border-matrix-border focus:border-primary focus:ring-primary/20 min-w-[3rem]"
                  placeholder="0"
                />
              ))
            )}
          </div>
        </div>
      </div>

      <br />

      {allowVariables && (
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
          💡 Puedes ingresar números, variables (x, y, z) o expresiones simples
        </div>
      )}
    </Card>
  );
};