import { CalculationStep } from "@/components/StepDisplay";
import { SymbolicExpression, symbolicMultiply, symbolicAdd, symbolicSubtract } from "./symbolicMath";
import i18n from "@/i18n/config";

const t = (key: string, params?: Record<string, any>) => {
  return i18n.t(key, params);
};

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
    throw new Error(t("matrixOperations.errorMatrixSquareOnly"));
  }

  const steps: CalculationStep[] = [];
  const n = matrix.length;

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.symbolicDeterminantTitle"),
    description: t("matrixOperations.symbolicDeterminantDescription", { n, method: getMethodDescription(method, n) }),
    matrices: [{
      label: "\\text{" + t("matrixOperations.matrixWithParametersLabel") + "}",
      matrix: symbolicMatrixToDisplay(matrix),
      customLabels: symbolicMatrixToLatex(matrix)
    }]
  });

  let det: SymbolicExpression;

  if (n === 1) {
    det = matrix[0][0];
    steps.push({
      stepNumber: 2,
      title: t("matrixOperations.specialCase1x1Title"),
      description: t("matrixOperations.specialCase1x1Description"),
      formula: t("matrixOperations.formulaDeterminant", { det: det.toLatex() })
    });
  } else if (n === 2) {
    const a = matrix[0][0], b = matrix[0][1];
    const c = matrix[1][0], d = matrix[1][1];

    const ad = symbolicMultiply(a, d);
    const bc = symbolicMultiply(b, c);
    det = symbolicSubtract(ad, bc);

    steps.push({
      stepNumber: 2,
      title: t("matrixOperations.formula2x2Title"),
      description: t("matrixOperations.formula2x2Description"),
      formula: `\\det(A) = (${a.toLatex()})(${d.toLatex()}) - (${b.toLatex()})(${c.toLatex()}) = ${det.toLatex()}`
    });
  } else if (n === 3) {
    if (method === "sarrus") {
      det = calculateSymbolicDeterminant3x3Sarrus(matrix, steps);
    } else {
      det = calculateSymbolicDeterminant3x3Cofactors(matrix, steps);
    }
  } else {
    det = calculateSymbolicDeterminantWithSteps(matrix, steps, "A");
  }

  if (det.isPolynomial()) {
    const polyStepsStart = steps.length + 1;
    const variable = det.getVariables()[0];

    steps.push({
      stepNumber: polyStepsStart,
      title: t("matrixOperations.polynomialExpansionTitle"),
      description: t("matrixOperations.polynomialExpansionDescription", { variable }),
      formula: `\\text{det}(A) = ${det.expand().toLatex()}`,
    });

    const roots = det.solveFor(variable);
    if (roots.length > 0) {
      steps.push({
        stepNumber: polyStepsStart + 1,
        title: t("matrixOperations.rootsCalculationTitle"),
        description: t("matrixOperations.rootsCalculationDescription", { variable }),
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
    return method === "sarrus" ? t("matrixOperations.methodSarrus") : t("matrixOperations.methodCofactors");
  } else if (n >= 4) {
    return t("matrixOperations.methodCofactors");
  }
  return t("matrixOperations.methodDirect");
}

function calculateSymbolicDeterminant3x3Sarrus(
  matrix: SymbolicMatrix,
  steps: CalculationStep[]
): SymbolicExpression {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.methodSarrusTitle"),
    description: t("matrixOperations.methodSarrusDescription"),
    formula: "\\text{det}(A) = aei + bfg + cdh - ceg - bdi - afh"
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
    title: t("matrixOperations.productDevelopmentTitle"),
    description: t("matrixOperations.productDevelopmentDescription"),
    formula: `
aei = (${a.toLatex()})(${e.toLatex()})(${i.toLatex()}) = ${aei.toLatex()} \\\\
bfg = (${b.toLatex()})(${f.toLatex()})(${g.toLatex()}) = ${bfg.toLatex()} \\\\
cdh = (${c.toLatex()})(${d.toLatex()})(${h.toLatex()}) = ${cdh.toLatex()} \\\\
ceg = (${c.toLatex()})(${e.toLatex()})(${g.toLatex()}) = ${ceg.toLatex()} \\\\
bdi = (${b.toLatex()})(${d.toLatex()})(${i.toLatex()}) = ${bdi.toLatex()} \\\\
afh = (${a.toLatex()})(${f.toLatex()})(${h.toLatex()}) = ${afh.toLatex()}
  `
  });

  steps.push({
    stepNumber: 4,
    title: t("matrixOperations.resultSarrusTitle"),
    description: t("matrixOperations.resultSarrusDescription"),
    formula: `\\text{det}(A) = ${det.toLatex()}`
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
    title: t("matrixOperations.cofactor3x3Title"),
    description: t("matrixOperations.cofactor3x3Description"),
    formula: "\\text{det}(A) = a \\cdot C_{11} + b \\cdot C_{12} + c \\cdot C_{13}"
  });

  const c11 = symbolicSubtract(symbolicMultiply(e, i), symbolicMultiply(f, h));
  const c12 = symbolicSubtract(symbolicMultiply(d, i), symbolicMultiply(f, g)).negate();
  const c13 = symbolicSubtract(symbolicMultiply(d, h), symbolicMultiply(e, g));

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.cofactorsCalculationTitle"),
    description: t("matrixOperations.cofactorsCalculationDescription"),
    formula: `
C_{11} = ei - fh = ${c11.toLatex()} \\\\
C_{12} = -(di - fg) = ${c12.toLatex()} \\\\
C_{13} = dh - eg = ${c13.toLatex()}
    `
  });

  const term1 = symbolicMultiply(a, c11);
  const term2 = symbolicMultiply(b, c12);
  const term3 = symbolicMultiply(c, c13);
  const det = symbolicAdd(symbolicAdd(term1, term2), term3);

  steps.push({
    stepNumber: 4,
    title: t("matrixOperations.finalResultTitle"),
    description: t("matrixOperations.finalResultDescription"),
    formula: `
\\text{det}(A) = (${a.toLatex()})(${c11.toLatex()}) + (${b.toLatex()})(${c12.toLatex()}) + (${c.toLatex()})(${c13.toLatex()}) \\\\
= ${det.toLatex()}
    `
  });

  return det;
}


function calculateSymbolicDeterminantWithSteps(
  matrix: SymbolicMatrix, 
  steps: CalculationStep[], 
  label: string = "A"
): SymbolicExpression {
  const n = matrix.length;
  
  if (n === 1) {
    const result = matrix[0][0];
    steps.push({
      stepNumber: steps.length + 1,
      title: t("matrixOperations.baseCase1x1Title"),
      description: t("matrixOperations.baseCase1x1Description", { label }),
      formula: `\\det(${label}) = ${result.toLatex()}`
    });
    return result;
  }
  
  if (n === 2) {
    const [[a, b], [c, d]] = matrix;
    const result = symbolicSubtract(symbolicMultiply(a, d), symbolicMultiply(b, c));
    steps.push({
      stepNumber: steps.length + 1,
      title: t("matrixOperations.baseCase2x2Title"),
      description: t("matrixOperations.baseCase2x2Description", { label }),
      formula: `\\det(${label}) = (${a.toLatex()})(${d.toLatex()}) - (${b.toLatex()})(${c.toLatex()}) = ${result.toLatex()}`
    });
    return result;
  }
  
  if (n === 3) {
    return calculateSymbolicDeterminant3x3Cofactors(matrix, steps);
  }
  
  // Para n ≥ 4, usar expansión por cofactores
  return calculateSymbolicDeterminantCofactors(matrix, steps, label);
}

function calculateSymbolicDeterminantCofactors(
  matrix: SymbolicMatrix,
  steps: CalculationStep[],
  label: string = "A"
): SymbolicExpression {
  const n = matrix.length;
  
  steps.push({
    stepNumber: steps.length + 1,
    title: t("matrixOperations.cofactorExpansionTitle"),
    description: t("matrixOperations.cofactorExpansionDescription", { n }),
    matrices: [{
      label: label,
      matrix: symbolicMatrixToDisplay(matrix),
      customLabels: symbolicMatrixToLatex(matrix)
    }]
  });

  const expansionRow = findBestExpansionRow(matrix);
  
  steps.push({
    stepNumber: steps.length + 1,
    title: t("matrixOperations.expansionStrategyTitle"),
    description: t("matrixOperations.expansionStrategyDescription", { row: expansionRow + 1 }),
    formula: `\\text{det}(${label}) = \\sum_{j=1}^{${n}} a_{${expansionRow + 1}j} \\cdot C_{${expansionRow + 1}j}`
  });

  let det = SymbolicExpression.fromNumber(0);
  let termCount = 0;

  for (let j = 0; j < n; j++) {
    const element = matrix[expansionRow][j];
    
    if (element.isZero()) {
      steps.push({
        stepNumber: steps.length + 1,
        title: t("matrixOperations.zeroElementTitle", { row: expansionRow + 1, col: j + 1 }),
        description: t("matrixOperations.zeroElementDescription"),
        formula: `a_{${expansionRow + 1}${j + 1}} = 0 \\quad \\text{→ ${t("matrixOperations.termOmitted")}}`
      });
      continue;
    }

    termCount++;
    const sign = (expansionRow + j) % 2 === 0 ? 1 : -1;
    const signSymbol = sign === 1 ? '+' : '-';
    const signText = sign === 1 ? t("matrixOperations.positive") : t("matrixOperations.negative");
    
    steps.push({
      stepNumber: steps.length + 1,
      title: t("matrixOperations.elementAnalysisTitle", { term: termCount }),
      description: t("matrixOperations.elementAnalysisDescription", { 
        row: expansionRow + 1, 
        col: j + 1,
        sign: signText
      }),
      formula: `a_{${expansionRow + 1}${j + 1}} = ${element.toLatex()}, \\quad \\text{${t("matrixOperations.sign")}: } ${signSymbol}`
    });

    const minor = getSymbolicMinor(matrix, expansionRow, j);
    const minorLabel = `${label.substring(0, label.indexOf('_') || label.length)}_{${expansionRow + 1}${j + 1}}`;
    
    steps.push({
      stepNumber: steps.length + 1,
      title: t("matrixOperations.minorCalculationTitle", { row: expansionRow + 1, col: j + 1 }),
      description: t("matrixOperations.minorCalculationDescription"),
      matrices: [{
        label: minorLabel,
        matrix: symbolicMatrixToDisplay(minor),
        customLabels: symbolicMatrixToLatex(minor)
      }]
    });

    const minorDet = calculateSymbolicDeterminantWithSteps(minor, steps, minorLabel);
    const cofactor = sign === 1 ? minorDet : minorDet.negate();
    const contribution = symbolicMultiply(element, cofactor);

    steps.push({
      stepNumber: steps.length + 1,
      title: t("matrixOperations.cofactorContributionTitle"),
      description: t("matrixOperations.cofactorContributionDescription"),
      formula: `
C_{${expansionRow + 1}${j + 1}} = ${sign === 1 ? '' : '-'}\\det(${minorLabel}) = ${cofactor.toLatex()} \\\\
\\text{${t("matrixOperations.contribution")}} = (${element.toLatex()}) \\cdot (${cofactor.toLatex()}) = ${contribution.toLatex()}
      `
    });

    det = symbolicAdd(det, contribution);

    if (termCount > 1) {
      steps.push({
        stepNumber: steps.length + 1,
        title: t("matrixOperations.partialSumTitle"),
        description: t("matrixOperations.partialSumDescription"),
        formula: `\\text{${t("matrixOperations.partialSum")}} = ${det.toLatex()}`
      });
    }
  }

  steps.push({
    stepNumber: steps.length + 1,
    title: t("matrixOperations.finalDeterminantTitle"),
    description: t("matrixOperations.finalDeterminantDescription", { n }),
    formula: `\\det(${label}) = ${det.toLatex()}`
  });

  return det;
}

function findBestExpansionRow(matrix: SymbolicMatrix): number {
  let bestRow = 0;
  let maxZeros = -1;
  
  for (let i = 0; i < matrix.length; i++) {
    const zeroCount = matrix[i].filter(element => element.isZero()).length;
    if (zeroCount > maxZeros) {
      maxZeros = zeroCount;
      bestRow = i;
    }
  }
  
  return bestRow;
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