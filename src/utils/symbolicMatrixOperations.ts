import { CalculationStep } from "@/components/StepDisplay";
import { SymbolicExpression, symbolicMultiply, symbolicAdd, symbolicSubtract } from "./symbolicMath";

export type SymbolicMatrix = SymbolicExpression[][];

export interface SymbolicOperationResult {
  result: SymbolicMatrix | SymbolicExpression;
  steps: CalculationStep[];
}

export function parseSymbolicMatrix(input: (string | number)[][]): SymbolicMatrix {
  return input.map(row =>
    row.map(cell => {
      if (typeof cell === 'number') {
        return SymbolicExpression.fromNumber(cell);
      }
      return SymbolicExpression.parse(cell);
    })
  );
}

export function symbolicMatrixToDisplay(matrix: SymbolicMatrix): number[][] {
  return matrix.map(row => row.map(() => 0));
}

export function symbolicMatrixToLatex(matrix: SymbolicMatrix): string[][] {
  return matrix.map(row => row.map(cell => cell.toLatex()));
}

export function calculateSymbolicDeterminant(
  matrix: SymbolicMatrix,
  method: "zeros" | "cofactors" | "sarrus" = "cofactors"
): SymbolicOperationResult {
  if (matrix.length !== matrix[0].length) {
    throw new Error("El determinante solo se puede calcular para matrices cuadradas");
  }

  const steps: CalculationStep[] = [];
  const n = matrix.length;

  steps.push({
    stepNumber: 1,
    title: "Cálculo simbólico del determinante",
    description: `Matriz cuadrada ${n}×${n} con parámetros\nMétodo seleccionado: ${getMethodDescription(method, n)}\n\nEl resultado será una expresión algebraica en términos de los parámetros.`,
    matrices: [{
      label: "\\text{Matriz con parámetros}",
      matrix: symbolicMatrixToDisplay(matrix),
      customLabels: symbolicMatrixToLatex(matrix)
    }],
  });

  let det: SymbolicExpression;

  if (n === 1) {
    det = matrix[0][0];
    steps.push({
      stepNumber: 2,
      title: "Caso especial: Matriz 1×1",
      description: "Para una matriz 1×1, el determinante es el único elemento.",
      formula: `\\text{det}(A) = ${det.toLatex()}`,
    });
  } else if (n === 2) {
    const a = matrix[0][0], b = matrix[0][1];
    const c = matrix[1][0], d = matrix[1][1];

    const ad = symbolicMultiply(a, d);
    const bc = symbolicMultiply(b, c);
    det = symbolicSubtract(ad, bc);

    steps.push({
      stepNumber: 2,
      title: "Fórmula para matriz 2×2",
      description: `Aplicamos la fórmula: det = ad - bc`,
      formula: `\\text{det}(A) = (${a.toLatex()})(${d.toLatex()}) - (${b.toLatex()})(${c.toLatex()}) = ${det.toLatex()}`,
    });
  } else if (n === 3) {
    if (method === "sarrus") {
      det = calculateSymbolicDeterminant3x3Sarrus(matrix, steps);
    } else {
      det = calculateSymbolicDeterminant3x3Cofactors(matrix, steps);
    }
  } else {
    det = calculateSymbolicDeterminantCofactors(matrix, steps);
  }

  if (det.isPolynomial()) {
    const polyStepsStart = steps.length + 1;
    const variable = det.getVariables()[0];

    steps.push({
      stepNumber: polyStepsStart,
      title: "Desarrollo del polinomio",
      description: `Expandimos el determinante para obtener un polinomio en ${variable}`,
      formula: `\\text{det}(A) = ${det.expand().toLatex()}`,
    });

    const roots = det.solveFor(variable);
    if (roots.length > 0) {
      steps.push({
        stepNumber: polyStepsStart + 1,
        title: "Cálculo de raíces",
        description: `Resolvemos la ecuación det(A) = 0 para ${variable}`,
        formula: `${variable} = ${roots.map(r => r.toLatex()).join(", ")}`,
      });
    }
  }

//   steps.push({
//     stepNumber: steps.length + 1,
//     title: "RESULTADO FINAL",
//     description: `Determinante simbólico de la matriz ${n}×${n}`,
//     formula: `\\text{det}(A) = ${det.toLatex()}`,
//   });

  return { result: det, steps };
}

function getMethodDescription(method: string, n: number): string {
  if (n === 3) {
    return method === "sarrus" ? "Regla de Sarrus" : "Desarrollo por cofactores";
  } else if (n >= 4) {
    return "Desarrollo por cofactores";
  }
  return "Método directo";
}

function calculateSymbolicDeterminant3x3Sarrus(
  matrix: SymbolicMatrix,
  steps: CalculationStep[]
): SymbolicExpression {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;

  steps.push({
    stepNumber: 2,
    title: "Método: Regla de Sarrus",
    description: `Para matrices 3×3, aplicamos la regla de Sarrus:\ndet = aei + bfg + cdh - ceg - bdi - afh`,
    formula: "\\text{det}(A) = aei + bfg + cdh - ceg - bdi - afh",
  });

  const aei = symbolicMultiply(symbolicMultiply(a, e), i);
  const bfg = symbolicMultiply(symbolicMultiply(b, f), g);
  const cdh = symbolicMultiply(symbolicMultiply(c, d), h);
  const ceg = symbolicMultiply(symbolicMultiply(c, e), g);
  const bdi = symbolicMultiply(symbolicMultiply(b, d), i);
  const afh = symbolicMultiply(symbolicMultiply(a, f), h);

  const positiveSum = symbolicAdd(symbolicAdd(aei, bfg), cdh);
  const negativeSum = symbolicAdd(symbolicAdd(ceg, bdi), afh);
  const det = symbolicSubtract(positiveSum, negativeSum);

  steps.push({
    stepNumber: 3,
    title: "Desarrollo de productos",
    description: `Calculamos cada producto diagonal:`,
    formula: `
aei = (${a.toLatex()})(${e.toLatex()})(${i.toLatex()}) = ${aei.toLatex()} \\\\
bfg = (${b.toLatex()})(${f.toLatex()})(${g.toLatex()}) = ${bfg.toLatex()} \\\\
cdh = (${c.toLatex()})(${d.toLatex()})(${h.toLatex()}) = ${cdh.toLatex()} \\\\
ceg = (${c.toLatex()})(${e.toLatex()})(${g.toLatex()}) = ${ceg.toLatex()} \\\\
bdi = (${b.toLatex()})(${d.toLatex()})(${i.toLatex()}) = ${bdi.toLatex()} \\\\
afh = (${a.toLatex()})(${f.toLatex()})(${h.toLatex()}) = ${afh.toLatex()}
    `,
  });

  steps.push({
    stepNumber: 4,
    title: "Resultado con Sarrus",
    description: "Sumamos los términos positivos y restamos los negativos:",
    formula: `\\text{det}(A) = ${det.toLatex()}`,
  });

  return det;
}

function calculateSymbolicDeterminant3x3Cofactors(
  matrix: SymbolicMatrix,
  steps: CalculationStep[]
): SymbolicExpression {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;

  steps.push({
    stepNumber: 2,
    title: "Método: Desarrollo por cofactores",
    description: `Desarrollamos por la primera fila:\ndet(A) = a·C₁₁ + b·C₁₂ + c·C₁₃`,
    formula: "\\text{det}(A) = a \\cdot C_{11} + b \\cdot C_{12} + c \\cdot C_{13}",
  });

  const c11 = symbolicSubtract(symbolicMultiply(e, i), symbolicMultiply(f, h));
  const c12 = symbolicSubtract(symbolicMultiply(d, i), symbolicMultiply(f, g)).negate();
  const c13 = symbolicSubtract(symbolicMultiply(d, h), symbolicMultiply(e, g));

  steps.push({
    stepNumber: 3,
    title: "Cálculo de cofactores",
    description: `Calculamos los cofactores de la primera fila:`,
    formula: `
C_{11} = ei - fh = ${c11.toLatex()} \\\\
C_{12} = -(di - fg) = ${c12.toLatex()} \\\\
C_{13} = dh - eg = ${c13.toLatex()}
    `,
  });

  const term1 = symbolicMultiply(a, c11);
  const term2 = symbolicMultiply(b, c12);
  const term3 = symbolicMultiply(c, c13);
  const det = symbolicAdd(symbolicAdd(term1, term2), term3);

  steps.push({
    stepNumber: 4,
    title: "Resultado final",
    description: "Multiplicamos cada elemento por su cofactor y sumamos:",
    formula: `
\\text{det}(A) = (${a.toLatex()})(${c11.toLatex()}) + (${b.toLatex()})(${c12.toLatex()}) + (${c.toLatex()})(${c13.toLatex()}) \\\\
= ${det.toLatex()}
    `,
  });

  return det;
}

function calculateSymbolicDeterminantCofactors(
  matrix: SymbolicMatrix,
  steps: CalculationStep[]
): SymbolicExpression {
  const n = matrix.length;

  steps.push({
    stepNumber: 2,
    title: "Desarrollo por cofactores",
    description: `Desarrollamos por la primera fila de la matriz ${n}×${n}`,
    formula: `\\text{det}(A) = \\sum_{j=1}^{${n}} a_{1j} \\cdot C_{1j}`,
  });

  let det = SymbolicExpression.fromNumber(0);

  for (let j = 0; j < n; j++) {
    const element = matrix[0][j];
    if (element.isZero()) continue;

    const sign = j % 2 === 0 ? 1 : -1;
    const minor = getSymbolicMinor(matrix, 0, j);
    const minorDet = calculateSymbolicDeterminantSimple(minor);

    const cofactor = sign === 1 ? minorDet : minorDet.negate();
    const contribution = symbolicMultiply(element, cofactor);

    det = symbolicAdd(det, contribution);

    if (j < 3) {
      steps.push({
        stepNumber: 3 + j,
        title: `Término ${j + 1}`,
        description: `Contribución del elemento a₁${j + 1}:`,
        formula: `a_{1${j + 1}} \\cdot C_{1${j + 1}} = (${element.toLatex()}) \\cdot (${cofactor.toLatex()}) = ${contribution.toLatex()}`,
      });
    }
  }

  return det;
}

function getSymbolicMinor(matrix: SymbolicMatrix, row: number, col: number): SymbolicMatrix {
  const result: SymbolicMatrix = [];

  for (let i = 0; i < matrix.length; i++) {
    if (i === row) continue;

    const newRow: SymbolicExpression[] = [];
    for (let j = 0; j < matrix[i].length; j++) {
      if (j === col) continue;
      newRow.push(matrix[i][j]);
    }
    result.push(newRow);
  }

  return result;
}

function calculateSymbolicDeterminantSimple(matrix: SymbolicMatrix): SymbolicExpression {
  const n = matrix.length;

  if (n === 1) {
    return matrix[0][0];
  }

  if (n === 2) {
    const [[a, b], [c, d]] = matrix;
    const ad = symbolicMultiply(a, d);
    const bc = symbolicMultiply(b, c);
    return symbolicSubtract(ad, bc);
  }

  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
    const aei = symbolicMultiply(symbolicMultiply(a, e), i);
    const bfg = symbolicMultiply(symbolicMultiply(b, f), g);
    const cdh = symbolicMultiply(symbolicMultiply(c, d), h);
    const ceg = symbolicMultiply(symbolicMultiply(c, e), g);
    const bdi = symbolicMultiply(symbolicMultiply(b, d), i);
    const afh = symbolicMultiply(symbolicMultiply(a, f), h);

    const positiveSum = symbolicAdd(symbolicAdd(aei, bfg), cdh);
    const negativeSum = symbolicAdd(symbolicAdd(ceg, bdi), afh);
    return symbolicSubtract(positiveSum, negativeSum);
  }

  let det = SymbolicExpression.fromNumber(0);
  for (let j = 0; j < n; j++) {
    const element = matrix[0][j];
    if (element.isZero()) continue;

    const sign = j % 2 === 0 ? 1 : -1;
    const minor = getSymbolicMinor(matrix, 0, j);
    const minorDet = calculateSymbolicDeterminantSimple(minor);

    const cofactor = sign === 1 ? minorDet : minorDet.negate();
    const contribution = symbolicMultiply(element, cofactor);

    det = symbolicAdd(det, contribution);
  }

  return det;
}
