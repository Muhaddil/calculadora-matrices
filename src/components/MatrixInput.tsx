import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

interface MatrixInputProps {
  label: string;
  matrix: number[][];
  onChange: (matrix: number[][]) => void;
  className?: string;
}

export const MatrixInput = ({
  label,
  matrix,
  onChange,
  className = "",
}: MatrixInputProps) => {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  const [matrixStr, setMatrixStr] = useState(
    matrix.map((row) => row.map((cell) => cell.toString()))
  );

  useEffect(() => {
    setMatrixStr(matrix.map((row) => row.map((cell) => cell.toString())));
  }, [rows, cols]);

  const isValidNumberInput = (value: string) => {
    return /^-?\d*\.?\d*$/.test(value);
  };

  const isFullyNumeric = (value: string) => {
    if (value === "" || value === "-" || value === "." || value === "-.") return false;
    const n = parseFloat(value);
    return !isNaN(n);
  };

  const updateCell = (row: number, col: number, value: string) => {
    if (value === "") {
      const newMatrixStr = matrixStr.map((r, i) =>
        r.map((c, j) => (i === row && j === col ? "0" : c))
      );
      setMatrixStr(newMatrixStr);
      
      const numericMatrix = newMatrixStr.map((r, i) =>
        r.map((v, j) => {
          if (i === row && j === col) return 0;
          const parsed = parseFloat(v);
          return isNaN(parsed) ? matrix[i][j] : parsed;
        })
      );
      onChange(numericMatrix);
      return;
    }

    if (value.startsWith("0-") && value.length > 2) {
      const newValue = `-${value.slice(2)}`;
      if (isValidNumberInput(newValue)) {
        updateCell(row, col, newValue);
      }
      return;
    }

    if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
      const newValue = value.replace(/^0+/, '');
      if (isValidNumberInput(newValue)) {
        updateCell(row, col, newValue || "0");
      }
      return;
    }

    if (!isValidNumberInput(value)) return;

    const newMatrixStr = matrixStr.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );

    setMatrixStr(newMatrixStr);

    if (isFullyNumeric(value)) {
      const numericMatrix = newMatrixStr.map((r, i) =>
        r.map((v, j) => {
          const parsed = parseFloat(v);
          return isNaN(parsed) ? matrix[i][j] : parsed;
        })
      );
      onChange(numericMatrix);
    }
  };

  const addRow = () => {
    const newRow = new Array(cols).fill(0);
    onChange([...matrix, newRow]);
  };

  const removeRow = () => {
    if (rows > 1) {
      onChange(matrix.slice(0, -1));
      setMatrixStr((prev) => prev.slice(0, -1));
    }
  };

  const addCol = () => {
    const newMatrix = matrix.map((row) => [...row, 0]);
    onChange(newMatrix);
    setMatrixStr((prev) => prev.map((r) => [...r, "0"]));
  };

  const removeCol = () => {
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
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="matrix-container">
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
                  onChange={(e) => updateCell(i, j, e.target.value)}
                  className="w-16 h-12 text-center font-mono text-sm border-matrix-border focus:border-primary focus:ring-primary/20"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};