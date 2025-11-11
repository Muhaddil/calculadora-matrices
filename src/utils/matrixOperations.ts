import { CalculationStep } from "@/components/StepDisplay";
import i18n from "@/i18n/config";

const t = (key: string, params?: Record<string, any>) => {
  return i18n.t(key, params);
};

export type Matrix = number[][];

export interface MatrixOperationResult {
  result: Matrix;
  steps: CalculationStep[];
}

export const createMatrix = (
  rows: number,
  cols: number,
  defaultValue = 0
): Matrix => {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(defaultValue));
};

export const addMatrices = (a: Matrix, b: Matrix): MatrixOperationResult => {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error(t("matrixOperations.dimensionErrorAdd"));
  }

  const steps: CalculationStep[] = [];
  const result: Matrix = [];
  const rows = a.length;
  const cols = a[0].length;

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.dimensionVerification"),
    description: t("matrixOperations.dimensionVerificationDescriptionAdd", { rows, cols }),
    matrices: [
      { label: "\\text{" + t("matrixOperations.matrixA") + "}", matrix: a },
      { label: "\\text{" + t("matrixOperations.matrixB") + "}", matrix: b },
    ],
  });

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.sumRuleTitle"),
    description: t("matrixOperations.sumRuleDescription"),
    formula: t("matrixOperations.sumFormula"),
  });

  const calculations: string[] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      const sum = a[i][j] + b[i][j];
      row.push(sum);
      calculations.push(`C_{${i + 1},${j + 1}} = ${a[i][j]} + ${b[i][j]} = ${sum}`);
    }
    result.push(row);
  }

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.detailedCalculationsTitle"),
    description: t("matrixOperations.detailedCalculationsDescriptionAdd"),
    formula: calculations.join(" \\\\ "),
    matrices: [
      { label: "\\text{" + t("matrixOperations.matrixA") + "}", matrix: a },
      { label: "\\text{" + t("matrixOperations.matrixB") + "}", matrix: b },
      { label: "\\text{" + t("matrixOperations.resultAdd") + "}", matrix: result, highlight: true },
    ],
  });

  return { result, steps };
};

export const subtractMatrices = (a: Matrix, b: Matrix): MatrixOperationResult => {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error(t("matrixOperations.dimensionErrorSubtract"));
  }

  const steps: CalculationStep[] = [];
  const result: Matrix = [];
  const rows = a.length;
  const cols = a[0].length;

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.dimensionVerification"),
    description: t("matrixOperations.dimensionVerificationDescriptionSubtract", { rows, cols }),
    matrices: [
      { label: "\\text{" + t("matrixOperations.matrixAMinuend") + "}", matrix: a },
      { label: "\\text{" + t("matrixOperations.matrixBSubtrahend") + "}", matrix: b },
    ],
  });

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.subtractRuleTitle"),
    description: t("matrixOperations.subtractRuleDescription"),
    formula: t("matrixOperations.subtractFormula"),
  });

  const calculations: string[] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      const diff = a[i][j] - b[i][j];
      row.push(diff);
      calculations.push(`C_{${i + 1},${j + 1}} = ${a[i][j]} - ${b[i][j]} = ${diff}`);
    }
    result.push(row);
  }

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.detailedCalculationsTitle"),
    description: t("matrixOperations.detailedCalculationsDescriptionSubtract"),
    formula: calculations.join(" \\\\ "),
    matrices: [
      { label: "\\text{" + t("matrixOperations.matrixA") + "}", matrix: a },
      { label: "\\text{" + t("matrixOperations.matrixB") + "}", matrix: b },
      { label: "\\text{" + t("matrixOperations.resultSubtract") + "}", matrix: result, highlight: true },
    ],
  });

  return { result, steps };
};

export const multiplyMatrices = (
  a: Matrix,
  b: Matrix
): MatrixOperationResult => {
  if (a[0].length !== b.length) {
    throw new Error(t("matrixOperations.dimensionErrorMultiply"));
  }

  const steps: CalculationStep[] = [];
  const aRows = a.length;
  const aCols = a[0].length;
  const bRows = b.length;
  const bCols = b[0].length;

  const result: Matrix = createMatrix(aRows, bCols);

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.compatibilityVerification"),
    description: t("matrixOperations.compatibilityVerificationDescription", {
      aRows,
      aCols,
      bRows,
      bCols,
    }),
    matrices: [
      { label: "\\text{" + t("matrixOperations.matrixA") + "}", matrix: a },
      { label: "\\text{" + t("matrixOperations.matrixB") + "}", matrix: b },
    ],
  });

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.multiplicationRuleTitle"),
    description: t("matrixOperations.multiplicationRuleDescription"),
    formula: t("matrixOperations.multiplicationFormula"),
  });

  const detailedCalculations: string[] = [];

  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0;
      const symbolicTerms: string[] = [];
      const evaluatedTerms: string[] = [];

      for (let k = 0; k < aCols; k++) {
        const aVal = a[i][k];
        const bVal = b[k][j];
        const product = aVal * bVal;
        sum += product;

        const aStr = aVal < 0 ? `(${aVal})` : `${aVal}`;
        const bStr = bVal < 0 ? `(${bVal})` : `${bVal}`;

        symbolicTerms.push(`(${aStr} * ${bStr})`);
        evaluatedTerms.push(`(${product})`);
      }

      result[i][j] = sum;

      detailedCalculations.push(
        `C_{${i + 1},${j + 1}} = ${symbolicTerms.join(
          " + "
        )} = ${evaluatedTerms.join(" + ")} = ${sum}`
      );
    }
  }

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.detailedCalculationsTitleMultiply"),
    description: t("matrixOperations.detailedCalculationsDescriptionMultiply"),
    formula: detailedCalculations.join(" \\\\ "),
    matrices: [{ label: "\\text{" + t("matrixOperations.resultMultiply") + "}", matrix: result, highlight: true }],
  });

  return { result, steps };
};

export const transposeMatrix = (matrix: Matrix): MatrixOperationResult => {
  const steps: CalculationStep[] = [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: Matrix = createMatrix(cols, rows);

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.transposeOriginalMatrix"),
    description: t("matrixOperations.transposeOriginalDescription", { rows, cols }),
    matrices: [{ label: "\\text{" + t("matrixOperations.transposeOriginalLabel") + "}", matrix }],
  });

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.transposeProcessTitle"),
    description: t("matrixOperations.transposeProcessDescription"),
    formula: `
A_{i,j} \\rightarrow A^T_{j,i} \\\\
\\text{Ejemplo con los primeros elementos:} \\\\
A_{1,1} \\rightarrow A^T_{1,1} \\\\
A_{1,2} \\rightarrow A^T_{2,1} \\\\
A_{1,3} \\rightarrow A^T_{3,1} \\\\
A_{2,1} \\rightarrow A^T_{1,2} \\\\
A_{2,2} \\rightarrow A^T_{2,2} \\\\
A_{2,3} \\rightarrow A^T_{3,2} \\\\
\\dots
`,
  });

  const transformations: string[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
      if (transformations.length < 6) {
        transformations.push(
          `A_{${i + 1},${j + 1}} = ${matrix[i][j]} \\rightarrow A^T_{${j + 1},${i + 1}} = ${matrix[i][j]} \\\\`
        );
      }
    }
  }

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.transposeDetailedTitle"),
    description: t("matrixOperations.transposeDetailedDescription"),
    formula:
      transformations.join("\n") +
      (rows * cols > 6 ? "\n\\dots \\,\\text{(y así sucesivamente)}" : ""),
    matrices: [
      { label: "\\text{" + t("matrixOperations.transposeOriginalLabel") + "}", matrix },
      { label: "\\text{" + t("matrixOperations.transposeResultLabel").replace(" A^T", "") + "} A^{T}", matrix: result, highlight: true },
    ],
  });

  return { result, steps };
};

export const calculateDeterminant = (
  matrix: Matrix,
  method: "zeros" | "cofactors" | "sarrus" = "zeros"
): MatrixOperationResult => {
  if (matrix.length !== matrix[0].length) {
    throw new Error(t("matrixOperations.determinantSquareError"));
  }

  const steps: CalculationStep[] = [];
  const n = matrix.length;

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.determinantCheckTitle"),
    description: t("matrixOperations.determinantCheckDescription", {
      n: n,
      method: getMethodDescription(method, n)
    }),
    matrices: [{ label: "\\text{" + t("matrixOperations.transposeOriginalLabel") + "}", matrix }],
  });

  let det: number;
  if (n === 1) {
    det = matrix[0][0];
    steps.push({
      stepNumber: 2,
      title: t("matrixOperations.determinant1x1Title"),
      description: t("matrixOperations.determinant1x1Description"),
      formula: `det(A) = a₁₁ = ${det}`,
      matrices: [{ label: "\\text{" + t("matrixOperations.determinantLabel") + "}", matrix: [[det]] }],
    });
  } else if (n === 2) {
    const a = matrix[0][0],
      b = matrix[0][1],
      c = matrix[1][0],
      d = matrix[1][1];
    det = a * d - b * c;
    steps.push({
      stepNumber: 2,
      title: t("matrixOperations.determinant2x2Title"),
      description: `${t("matrixOperations.determinantFormulaLabel")}: ad - bc\n${a}×${d} = ${a * d}\n${b}×${c} = ${b * c}\n${a * d} - ${b * c} = ${det}`,
      formula: `det(A) = ad - bc = ${det}`,
      matrices: [{ label: "\\text{" + t("matrixOperations.determinantLabel") + "}", matrix: [[det]] }],
    });
  } else if (n === 3) {
    if (method === "sarrus") {
      det = calculateDeterminant3x3Sarrus(matrix, steps)
    } else {
      det = calculateDeterminant3x3Cofactors(matrix, steps)
    }
  } else {
    if (method === "zeros") {
      det = calculateDeterminantWithZeros(matrix, steps)
    } else {
      det = calculateDeterminantWithCofactors(matrix, steps)
    }
  }

  steps.push({
    stepNumber: steps.length + 1,
    title: t("matrixOperations.determinantFinalTitle"),
    description: t("matrixOperations.determinantFinalDescription", {
      n,
      det,
      interpretation: det === 0
        ? t("matrixOperations.determinantSingular")
        : t("matrixOperations.determinantRegular"),
    }),
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{" + t("matrixOperations.determinantFinalLabel") + "}", matrix: [[det]] }],
  });


  return { result: [[det]], steps }
}

const getMethodDescription = (method: string, n: number): string => {
  if (n === 3) {
    return method === "sarrus"
      ? t("matrixOperations.sarrusMethodTitle")
      : t("matrixOperations.cofactorsMethod");
  } else if (n >= 4) {
    return method === "zeros"
      ? t("matrixOperations.zerosMethod")
      : t("matrixOperations.cofactorsMethod");
  }
  return t("matrixOperations.directMethod");
};

const calculateDeterminant3x3Sarrus = (matrix: Matrix, steps: CalculationStep[]): number => {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.sarrusMethodTitle"),
    description: t("matrixOperations.sarrusMethodDescription"),
    formula: "det(A) = aei + bfg + cdh - ceg - bdi - afh",
    matrices: [{ label: "\\text{" + t("matrixOperations.sarrusMatrixLabel") + "}", matrix }],
  });
  const aei = a * e * i;
  const bfg = b * f * g;
  const cdh = c * d * h;
  const ceg = c * e * g;
  const bdi = b * d * i;
  const afh = a * f * h;
  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.sarrusDiagonalProductsTitle"),
    description: t("matrixOperations.sarrusDiagonalProductsDescription", {
      a, b, c, d, e, f, g, h, i,
      aei, bfg, cdh, ceg, bdi, afh
    }),
    formula: t("matrixOperations.sarrusDiagonalProductsFormula", {
      aei, bfg, cdh, ceg, bdi, afh,
      sumPositive: aei + bfg + cdh,
      sumNegative: ceg + bdi + afh
    }),
  });
  const det = aei + bfg + cdh - ceg - bdi - afh;
  steps.push({
    stepNumber: 4,
    title: t("matrixOperations.sarrusFinalTitle"),
    description: t("matrixOperations.sarrusFinalDescriptionWithValues", {
      aei, bfg, cdh, ceg, bdi, afh,
      sumPositive: aei + bfg + cdh,
      sumNegative: ceg + bdi + afh,
      det
    }),
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{" + t("matrixOperations.sarrusDeterminantLabel") + "}", matrix: [[det]] }],
  });
  return det;
};

const calculateDeterminant3x3Cofactors = (matrix: Matrix, steps: CalculationStep[]): number => {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.cofactors3x3MethodTitle"),
    description: t("matrixOperations.cofactors3x3MethodDescriptionWithValues", { a, b, c }),
    formula: t("matrixOperations.cofactors3x3Formula"),
    matrices: [{ label: "\\text{" + t("matrixOperations.sarrusMatrixLabel") + "}", matrix }],
  });

  const c11 = e * i - f * h;
  const c12 = -(d * i - f * g);
  const c13 = d * h - e * g;
  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.cofactors3x3StepTitle"),
    description: t("matrixOperations.cofactors3x3StepDescriptionWithValues", {
      e, f, h, i, d, g,
      ei: e * i,
      fh: f * h,
      di: d * i,
      fg: f * g,
      dh: d * h,
      eg: e * g,
      c11, c12, c13
    }),
    formula: t("matrixOperations.cofactors3x3StepFormula"),
  });

  const det = a * c11 + b * c12 + c * c13;
  steps.push({
    stepNumber: 4,
    title: t("matrixOperations.cofactors3x3FinalTitle"),
    description: t("matrixOperations.cofactors3x3FinalDescriptionWithValues", {
      a, b, c, c11, c12, c13,
      a_c11: a * c11,
      b_c12: b * c12,
      c_c13: c * c13,
      det
    }),
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{" + t("matrixOperations.determinantLabel") + "}", matrix: [[det]] }],
  });

  return det;
};

const calculateDeterminantWithZeros = (matrix: Matrix, steps: CalculationStep[]): number => {
  const n = matrix.length;
  let stepCounter = 2;
  let currentMatrix = matrix.map((row) => [...row]);
  let detMultiplier = 1;

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.zerosMethodTitle"),
    description: t("matrixOperations.zerosMethodDescription"),
    matrices: [{ label: "\\text{" + t("matrixOperations.transposeOriginalLabel") + "}", matrix: currentMatrix }],
  });

  const { bestType, bestIndex, zerosCount } = findBestRowOrColumn(currentMatrix);
  const typeText = bestType === "fila" ? t("matrixOperations.bestRow") : t("matrixOperations.bestColumn");

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.zerosMethodAnalysisTitle"),
    description: t("matrixOperations.zerosMethodAnalysisDescription", {
      type: typeText,
      index: bestIndex + 1,
      count: zerosCount,
    }),
    matrices: [{ label: "\\text{" + t("matrixOperations.transposeOriginalLabel") + "}", matrix: currentMatrix }],
  });

  if (zerosCount < n - 2) {
    const result = createZerosInRowOrColumn(currentMatrix, bestType, bestIndex, steps, stepCounter);
    currentMatrix = result.matrix;
    detMultiplier *= result.multiplier;
    stepCounter = result.nextStep;
  }

  const det = developByOptimalRowOrColumn(currentMatrix, bestType, bestIndex, steps, stepCounter);
  return det * detMultiplier;
};

const findBestRowOrColumn = (
  matrix: Matrix,
): { bestType: "fila" | "columna"; bestIndex: number; zerosCount: number } => {
  const n = matrix.length
  let bestType: "fila" | "columna" = "fila"
  let bestIndex = 0
  let maxZeros = 0

  for (let i = 0; i < n; i++) {
    const zerosInRow = matrix[i].filter((x) => Math.abs(x) < 1e-10).length
    if (zerosInRow > maxZeros) {
      maxZeros = zerosInRow
      bestType = "fila"
      bestIndex = i
    }
  }

  for (let j = 0; j < n; j++) {
    const zerosInCol = matrix.map((row) => row[j]).filter((x) => Math.abs(x) < 1e-10).length
    if (zerosInCol > maxZeros) {
      maxZeros = zerosInCol
      bestType = "columna"
      bestIndex = j
    }
  }

  return { bestType, bestIndex, zerosCount: maxZeros }
}

const createZerosInRowOrColumn = (
  matrix: Matrix,
  type: "fila" | "columna",
  index: number,
  steps: CalculationStep[],
  startStep: number,
): { matrix: Matrix; multiplier: number; nextStep: number } => {
  const n = matrix.length;
  const currentMatrix = matrix.map((row) => [...row]);
  let stepCounter = startStep;
  const multiplier = 1;

  // Traduce "fila" o "columna" una vez
  const translatedType = t(`matrixOperations.${type}`);

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.createZerosTitle", { type: translatedType, index: index + 1 }),
    description: t("matrixOperations.createZerosDescription"),
    matrices: [{ label: "\\text{" + t("matrixOperations.matrixBeforeZeros") + "}", matrix: currentMatrix }],
  });

  if (type === "fila") {
    let pivotCol = -1;
    for (let j = 0; j < n; j++) {
      if (Math.abs(currentMatrix[index][j]) > 1e-10) {
        pivotCol = j;
        break;
      }
    }
    if (pivotCol === -1) return { matrix: currentMatrix, multiplier, nextStep: stepCounter };

    const pivot = currentMatrix[index][pivotCol];
    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.pivotSelectedTitle"),
      description: t("matrixOperations.pivotSelectedDescription", {
        row: index + 1,
        col: pivotCol + 1,
        pivot,
        type: translatedType,
      }),
      formula: t("matrixOperations.pivotFormula", { row: index + 1, col: pivotCol + 1, pivot }),
    });

    for (let i = 0; i < n; i++) {
      if (i === index || Math.abs(currentMatrix[i][pivotCol]) < 1e-10) continue;

      const factor = currentMatrix[i][pivotCol] / pivot;
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.eliminatingElementTitle", { i: i + 1, j: pivotCol + 1 }),
        description: t("matrixOperations.eliminatingElementDescription", {
          i: i + 1,
          j: pivotCol + 1,
          element: currentMatrix[i][pivotCol],
          pivot,
          factor,
          operation: `F${i + 1} = F${i + 1} - (${factor}) × F${index + 1}`,
        }),
        formula: t("matrixOperations.eliminatingElementFormula", { operation: `F${i + 1} ← F${i + 1} - ${factor} × F${index + 1}` }),
      });

      for (let j = 0; j < n; j++) {
        currentMatrix[i][j] -= factor * currentMatrix[index][j];
      }

      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.operationResultTitle"),
        description: t("matrixOperations.operationResultDescription", {
          type: translatedType,
          index: i + 1,
          i: i + 1,
          j: pivotCol + 1,
        }),
        matrices: [{ label: "\\text{" + t("matrixOperations.matrixAfterOperation") + "}", matrix: currentMatrix.map((row) => [...row]) }],
      });
    }
  } else {
    let pivotRow = -1;
    for (let i = 0; i < n; i++) {
      if (Math.abs(currentMatrix[i][index]) > 1e-10) {
        pivotRow = i;
        break;
      }
    }
    if (pivotRow === -1) return { matrix: currentMatrix, multiplier, nextStep: stepCounter };

    const pivot = currentMatrix[pivotRow][index];
    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.pivotSelectedTitle"),
      description: t("matrixOperations.pivotSelectedDescription", {
        row: pivotRow + 1,
        col: index + 1,
        pivot,
        type: translatedType,
      }),
      formula: t("matrixOperations.pivotFormula", { row: pivotRow + 1, col: index + 1, pivot }),
    });

    for (let j = 0; j < n; j++) {
      if (j === index || Math.abs(currentMatrix[pivotRow][j]) < 1e-10) continue;

      const factor = currentMatrix[pivotRow][j] / pivot;
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.eliminatingElementTitle", { i: pivotRow + 1, j: j + 1 }),
        description: t("matrixOperations.eliminatingElementDescription", {
          i: pivotRow + 1,
          j: j + 1,
          element: currentMatrix[pivotRow][j],
          pivot,
          factor,
          operation: `C${j + 1} = C${j + 1} - (${factor}) × C${index + 1}`,
        }),
        formula: t("matrixOperations.eliminatingElementFormula", { operation: `C${j + 1} ← C${j + 1} - ${factor} × C${index + 1}` }),
      });

      for (let i = 0; i < n; i++) {
        currentMatrix[i][j] -= factor * currentMatrix[i][index];
      }

      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.operationResultTitle"),
        description: t("matrixOperations.operationResultDescription", {
          type: translatedType,
          index: j + 1,
          i: pivotRow + 1,
          j: j + 1,
        }),
        matrices: [{ label: "\\text{" + t("matrixOperations.matrixAfterOperation") + "}", matrix: currentMatrix.map((row) => [...row]) }],
      });
    }
  }

  return { matrix: currentMatrix, multiplier, nextStep: stepCounter };
};

const developByOptimalRowOrColumn = (
  matrix: Matrix,
  type: "fila" | "columna",
  index: number,
  steps: CalculationStep[],
  startStep: number,
): number => {
  const n = matrix.length;
  let stepCounter = startStep;

  const translatedType = t(`matrixOperations.${type}`);

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.developByRowOrColumnTitle", {
      type: translatedType,
      index: index + 1
    }),
    description: t("matrixOperations.developByRowOrColumnDescription", {
      type: translatedType,
      index: index + 1
    }),
    matrices: [{
      label: `\\text{${t("matrixOperations.optimizedMatrixLabel", { n })}}`,
      matrix: matrix
    }],
  });

  let det = 0;
  const elements = type === "fila" ? matrix[index] : matrix.map((row) => row[index]);

  for (let j = 0; j < n; j++) {
    const element = elements[j];

    if (Math.abs(element) < 1e-10) {
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.zeroElementTitle", { i: index + 1, j: j + 1 }),
        description: t("matrixOperations.zeroElementDescription"),
        formula: t("matrixOperations.zeroContributionFormula"),
      });
      continue;
    }

    const rowToRemove = type === "fila" ? index : j;
    const colToRemove = type === "fila" ? j : index;
    const sign = Math.pow(-1, rowToRemove + colToRemove);
    const signSymbol = sign === 1 ? "+" : "-";
    const position = type === "fila" ? `[${index + 1},${j + 1}]` : `[${j + 1},${index + 1}]`;

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.processingElementTitle", { position, element }),
      description: t("matrixOperations.processingElementDescription", {
        signSymbol,
        sign,
        row: rowToRemove + 1,
        col: colToRemove + 1
      }),
      formula: t("matrixOperations.cofactorFormula", {
        row: rowToRemove + 1,
        col: colToRemove + 1,
        signSymbol
      }),
    });

    const minor = getMinorDeterminant(matrix, rowToRemove, colToRemove);

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.minorMatrixTitle", {
        row: rowToRemove + 1,
        col: colToRemove + 1
      }),
      description: t("matrixOperations.minorMatrixDescription", {
        size: n - 1,
        row: rowToRemove + 1,
        col: colToRemove + 1,
        message: n === 4 ? t("matrixOperations.minor3x3Message") : ""
      }),
      matrices: [{
        label: `\\text{${t("matrixOperations.minorMatrixLabel", { size: n - 1 })}}`,
        matrix: minor
      }],
    });

    let minorDet: number;

    if (n - 1 === 1) {
      minorDet = minor[0][0];
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.determinant1x1Title"),
        description: t("matrixOperations.determinant1x1Description"),
        formula: t("matrixOperations.determinant1x1Formula", { minorDet }),
      });
    } else if (n - 1 === 2) {
      const [[a, b], [c, d]] = minor;
      minorDet = a * d - b * c;
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.determinant2x2Title"),
        description: t("matrixOperations.determinant2x2Description", {
          a, b, c, d,
          ad: a * d,
          bc: b * c,
          minorDet
        }),
        formula: t("matrixOperations.determinant2x2Formula", { minorDet }),
      });
    } else if (n - 1 === 3) {
      const tempSteps: CalculationStep[] = [];
      minorDet = calculateDeterminant3x3Sarrus(minor, tempSteps);
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.determinant3x3Title"),
        description: t("matrixOperations.determinant3x3Description"),
        formula: t("matrixOperations.determinant3x3Formula", { minorDet }),
      });
    } else {
      minorDet = calculateDeterminantWithZerosSimple(minor);
    }

    const cofactor = sign * minorDet;
    const contribution = element * cofactor;
    det += contribution;

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.cofactorCalculationTitle"),
      description: t("matrixOperations.cofactorCalculationDescription", {
        sign,
        minorDet,
        cofactor,
        element,
        contribution,
        det
      }),
      formula: t("matrixOperations.contributionFormula", { contribution }),
    });
  }

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.optimizedResultTitle"),
    description: t("matrixOperations.optimizedResultDescription", {
      type: translatedType,
      index: index + 1
    }),
    formula: t("matrixOperations.finalDeterminantFormula", { det }),
    matrices: [{
      label: `\\text{${t("matrixOperations.determinantLabel")}}`,
      matrix: [[det]]
    }],
  });

  return det;
};

const calculateDeterminantWithCofactors = (
  matrix: Matrix,
  steps: CalculationStep[]
): number => {
  const n = matrix.length;
  let stepCounter = 2;

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.cofactorsMethodTitle"),
    description: t("matrixOperations.cofactorsMethodDescription"),
    formula: t("matrixOperations.cofactorsMethodFormula"),
    matrices: [{
      label: `\\text{${t("matrixOperations.matrixNxNLabel", { n })}}`,
      matrix: matrix
    }],
  });

  let det = 0;

  for (let j = 0; j < n; j++) {
    const element = matrix[0][j];
    const sign = Math.pow(-1, 0 + j);
    const signSymbol = sign === 1 ? "+" : "-";

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.processingElementCofactorsTitle", {
        j: j + 1,
        element
      }),
      description: t("matrixOperations.processingElementCofactorsDescription", {
        j: j + 1,
        element,
        signSymbol,
        sign,
        exponent: j + 1
      }),
      formula: t("matrixOperations.cofactorFormulaCofactors", {
        j: j + 1,
        signSymbol
      }),
    });

    const minor = getMinorDeterminant(matrix, 0, j);

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.minorMatrixCofactorsTitle", {
        j: j + 1
      }),
      description: t("matrixOperations.minorMatrixCofactorsDescription", {
        j: j + 1
      }),
      matrices: [{
        label: `\\text{${t("matrixOperations.minorMatrixLabel", { size: n - 1 })}}`,
        matrix: minor
      }],
    });

    const minorDet = calculateDeterminantWithZerosSimple(minor);
    const cofactor = sign * minorDet;
    const contribution = element * cofactor;
    det += contribution;

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.completeCalculationTitle", {
        j: j + 1
      }),
      description: t("matrixOperations.completeCalculationDescription", {
        j: j + 1,
        minorDet,
        sign,
        cofactor,
        element,
        contribution
      }),
      formula: t("matrixOperations.contributionFormulaCofactors", {
        j: j + 1,
        contribution
      }),
    });
  }

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.finalResultTitle"),
    description: t("matrixOperations.finalResultDescription"),
    formula: t("matrixOperations.finalDeterminantFormula", { det }),
    matrices: [{
      label: `\\text{${t("matrixOperations.determinantLabel")}}`,
      matrix: [[det]]
    }],
  });

  return det;
};

const getMinorDeterminant = (matrix: Matrix, rowToRemove: number, colToRemove: number): Matrix => {
  const result: Matrix = []

  for (let i = 0; i < matrix.length; i++) {
    if (i === rowToRemove) continue

    const newRow: number[] = []
    for (let j = 0; j < matrix[i].length; j++) {
      if (j === colToRemove) continue
      newRow.push(matrix[i][j])
    }
    result.push(newRow)
  }

  return result
}

const calculateDeterminantWithZerosSimple = (matrix: Matrix, rowOffset = 0): number => {
  const n = matrix.length
  if (n === 1) return matrix[0][0]
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]

  let det = 0
  for (let j = 0; j < n; j++) {
    const element = matrix[0][j]
    if (Math.abs(element) < 1e-10) continue

    const minor = getMinorDeterminant(matrix, 0, j)
    const minorDet = calculateDeterminantWithZerosSimple(minor, rowOffset + 1)
    const sign = Math.pow(-1, 0 + j)
    det += sign * element * minorDet
  }
  return det
}

const getMinor = (matrix: Matrix, row: number, col: number): Matrix => {
  return matrix
    .filter((_, i) => i !== row)
    .map((r) => r.filter((_, j) => j !== col));
};

const determinantRecursive = (matrix: Matrix): number => {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let det = 0;
  for (let j = 0; j < n; j++) {
    const minor = getMinor(matrix, 0, j);
    det += Math.pow(-1, j) * matrix[0][j] * determinantRecursive(minor);
  }
  return det;
};

const transpose = (matrix: number[][]): number[][] =>
  matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));

export const calculateAdjugate = (matrix: Matrix): MatrixOperationResult => {
  if (matrix.length !== matrix[0].length) {
    throw new Error(t("matrixOperations.adjugateSquareError"));
  }

  const steps: CalculationStep[] = [];
  const n = matrix.length;
  const cofactors: Matrix = createMatrix(n, n);
  const result: Matrix = createMatrix(n, n);

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.adjugateConceptTitle"),
    description: t("matrixOperations.adjugateConceptDescription"),
    matrices: [{ label: "\\text{" + t("matrixOperations.originalMatrixLabel") + "}", matrix: matrix }],
  });

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.whatIsCofactorTitle"),
    description: t("matrixOperations.whatIsCofactorDescription"),
    formula: t("matrixOperations.cofactorFormulaTranspose"),
  });

  const cofactorExamples: string[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = getMinor(matrix, i, j);
      const minorDet = determinantRecursive(minor);
      const sign = Math.pow(-1, i + j);
      cofactors[i][j] = sign * minorDet;

      if (cofactorExamples.length < 4) {
        const signStr = sign > 0 ? "+" : "-";
        cofactorExamples.push(
          `C_{${i + 1},${j + 1}} = ${signStr}\\det(\\text{${t("matrixOperations.minorLabel")}}) = ${signStr}(${minorDet}) = ${cofactors[i][j]} \\\\`
        );
      }
    }
  }

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.cofactorsCalculationTitle"),
    description: t("matrixOperations.cofactorsCalculationDescription"),
    matrices: [{ label: "\\text{" + t("matrixOperations.cofactorsMatrixLabel") + "}", matrix: cofactors }],
    formula: cofactorExamples.join("\n"),
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[j][i] = cofactors[i][j];
    }
  }

  steps.push({
    stepNumber: 4,
    title: t("matrixOperations.finalTranspositionTitle"),
    description: t("matrixOperations.finalTranspositionDescription"),
    formula: t("matrixOperations.adjugateFormula"),
    matrices: [
      { label: "\\text{" + t("matrixOperations.cofactorsMatrixLabel") + "}", matrix: cofactors },
      { label: "\\text{" + t("matrixOperations.adjugateMatrixLabel") + "}", matrix: result, highlight: true },
    ],
  });

  return { result, steps };
};

export const calculateInverse = (matrix: Matrix): MatrixOperationResult => {
  if (matrix.length !== matrix[0].length) {
    throw new Error(t("matrixOperations.inverseSquareError"));
  }

  const steps: CalculationStep[] = [];
  const n = matrix.length;

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.whatIsInverseTitle"),
    description: t("matrixOperations.whatIsInverseDescription"),
    matrices: [{ label: "\\text{" + t("matrixOperations.matrixALabel") + "}", matrix: matrix }],
  });

  const det = determinantRecursive(matrix);
  if (Math.abs(det) < 1e-10) {
    throw new Error(t("matrixOperations.nonInvertibleError", { det: det.toFixed(6) }));
  }

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.invertibilityCheckTitle"),
    description: t("matrixOperations.invertibilityCheckDescription", { det: det.toFixed(2) }),
    formula: t("matrixOperations.invertibilityCheckFormula", { det: det.toFixed(2) }),
  });

  const cofactorMatrix = matrix.map((row, i) =>
    row.map((_, j) => {
      const minor = getMinor(matrix, i, j);
      const cofactor = ((i + j) % 2 === 0 ? 1 : -1) * determinantRecursive(minor);
      return cofactor;
    })
  );

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.cofactorsMatrixTitle"),
    description: t("matrixOperations.cofactorsMatrixDescription"),
    formula: t("matrixOperations.cofactorFormulaTranspose"),
    matrices: [
      { label: "\\text{" + t("matrixOperations.cofactorsMatrixLabel") + "}", matrix: cofactorMatrix },
    ],
  });

  const adjMatrix = transpose(cofactorMatrix);

  steps.push({
    stepNumber: 4,
    title: t("matrixOperations.adjugateMatrixTitle"),
    description: t("matrixOperations.adjugateMatrixDescription"),
    matrices: [
      { label: "\\text{" + t("matrixOperations.adjugateMatrixLabel") + "}", matrix: adjMatrix },
    ],
  });

  const fractionText = `\\frac{1}{${det.toFixed(2)}}`;

  steps.push({
    stepNumber: 5,
    title: t("matrixOperations.inverseMatrixFractionTitle"),
    description: t("matrixOperations.inverseMatrixFractionDescription", { fractionText }),
    matrices: [
      {
        label: `A^{-1} = ${fractionText} \\times \\text{adj}(A)`,
        matrix: adjMatrix,
        fraction: fractionText,
        highlight: true,
      },
    ],
  });

  const result: Matrix = adjMatrix.map((row) =>
    row.map((cell) => {
      const value = cell / det;
      return Math.abs(value) < 1e-10 ? 0 : value;
    })
  );

  steps.push({
    stepNumber: 6,
    title: t("matrixOperations.resultingInverseMatrixTitle"),
    description: t("matrixOperations.resultingInverseMatrixDescription"),
    matrices: [
      {
        label: "A^{-1}",
        matrix: result,
        highlight: true,
        showAsFraction: true,
      },
    ],
  });

  const identityCheck = multiplyMatrices(matrix, result);

  steps.push({
    stepNumber: 7,
    title: t("matrixOperations.verificationTitle"),
    description: t("matrixOperations.verificationDescription"),
    matrices: [
      {
        label: "A \\times A^{-1}",
        matrix: identityCheck.result,
      },
    ],
  });

  return { result, steps };
};

export const calculateRank = (matrix: Matrix): MatrixOperationResult => {
  const steps: CalculationStep[] = [];
  const rows = matrix.length;
  const cols = matrix[0].length;

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.rankDefinitionTitle"),
    description: t("matrixOperations.rankDefinitionDescription"),
    formula: t("matrixOperations.rankDefinitionFormula"),
    matrices: [{ label: `\\text{${t("matrixOperations.originalMatrixLabel")}}`, matrix: matrix }],
  });

  const maxOrder = Math.min(rows, cols);
  let rank = 0;
  let stepCounter = 2;
  let currentBaseRows: number[] = [];
  let currentBaseCols: number[] = [];

  const isZeroMatrix = matrix.every(row => row.every(element => Math.abs(element) < 1e-10));

  if (isZeroMatrix) {
    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.zeroMatrixDetectedTitle"),
      description: t("matrixOperations.zeroMatrixDetectedDescription"),
      formula: t("matrixOperations.zeroMatrixFormula"),
    });

    return { result: [[0]], steps };
  }

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.searchingOrder1Title"),
    description: t("matrixOperations.searchingOrder1Description"),
    matrices: [{ label: `\\text{${t("matrixOperations.examiningIndividualElementsLabel")}}`, matrix: matrix }],
  });

  let firstNonZeroPos: [number, number] | null = null;
  const nonZeroElements: string[] = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (Math.abs(matrix[i][j]) > 1e-10) {
        nonZeroElements.push(`a_{${i + 1},${j + 1}} = ${matrix[i][j]}`);
        if (!firstNonZeroPos) {
          firstNonZeroPos = [i, j];
          currentBaseRows = [i];
          currentBaseCols = [j];
          rank = 1;
        }
      }
    }
  }

  if (firstNonZeroPos) {
    const [i, j] = firstNonZeroPos;
    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.order1FoundTitle"),
      description: t("matrixOperations.order1FoundDescription", {
        elements: nonZeroElements.join('\n'),
        row: i + 1,
        col: j + 1,
        value: matrix[i][j]
      }),
      formula: t("matrixOperations.order1FoundFormula", { value: matrix[i][j] }),
      matrices: [{
        label: `\\text{${t("matrixOperations.minorOrder1Label", { row: i + 1, col: j + 1 })}}`,
        matrix: [[matrix[i][j]]],
        highlight: true
      }],
    });
  }

  const evaluateMinorsWithDetail = (baseRows: number[], baseCols: number[], targetOrder: number): { found: boolean; submatrix: Matrix | null; newRows: number[]; newCols: number[]; det: number } => {

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.constructingMinorsTitle", { order: targetOrder }),
      description: t("matrixOperations.constructingMinorsDescription", {
        prevOrder: targetOrder - 1,
        rows: baseRows.map(r => r + 1).join(','),
        cols: baseCols.map(c => c + 1).join(','),
        order: targetOrder
      }),
      formula: t("matrixOperations.constructingMinorsFormula", {
        prevOrder: targetOrder - 1,
        order: targetOrder
      }),
    });

    for (let newRow = 0; newRow < rows; newRow++) {
      if (baseRows.includes(newRow)) continue;

      for (let newCol = 0; newCol < cols; newCol++) {
        if (baseCols.includes(newCol)) continue;

        const extendedRows = [...baseRows, newRow];
        const extendedCols = [...baseCols, newCol];

        const submatrix: Matrix = [];
        for (const ii of extendedRows) {
          const row: number[] = [];
          for (const jj of extendedCols) {
            row.push(matrix[ii][jj]);
          }
          submatrix.push(row);
        }

        steps.push({
          stepNumber: stepCounter++,
          title: t("matrixOperations.testingSpecificMinorTitle", { order: targetOrder }),
          description: t("matrixOperations.testingSpecificMinorDescription", {
            rows: extendedRows.map(r => r + 1).join(', '),
            cols: extendedCols.map(c => c + 1).join(', ')
          }),
          matrices: [{
            label: `\\text{${t("matrixOperations.minorOrderTestLabel", { order: targetOrder })}}`,
            matrix: submatrix
          }],
        });

        const detResult = calculateDeterminantWithSteps(submatrix);
        const det = detResult.result[0][0];

        steps.push({
          stepNumber: stepCounter++,
          title: t("matrixOperations.calculatingDeterminantTitle", { order: targetOrder }),
          description: t("matrixOperations.calculatingDeterminantDescription", { order: targetOrder }),
          formula: t("matrixOperations.calculatingDeterminantFormula", { order: targetOrder, det }),
          matrices: [{
            label: `\\text{${t("matrixOperations.determinantResultLabel")}}`,
            matrix: [[det]]
          }],
        });

        if (Math.abs(det) > 1e-10) {
          steps.push({
            stepNumber: stepCounter++,
            title: t("matrixOperations.minorFoundTitle", { order: targetOrder }),
            description: t("matrixOperations.minorFoundDescription", { order: targetOrder }),
            formula: t("matrixOperations.minorFoundFormula", { det, order: targetOrder }),
            matrices: [{
              label: `\\text{${t("matrixOperations.nonZeroMinorLabel", { order: targetOrder })}}`,
              matrix: submatrix,
              highlight: true
            }],
          });

          return { found: true, submatrix, newRows: extendedRows, newCols: extendedCols, det };
        } else {
          steps.push({
            stepNumber: stepCounter++,
            title: t("matrixOperations.minorIsZeroTitle", { order: targetOrder }),
            description: t("matrixOperations.minorIsZeroDescription"),
            formula: t("matrixOperations.minorIsZeroFormula"),
          });
        }
      }
    }

    return { found: false, submatrix: null, newRows: [], newCols: [], det: 0 };
  };

  for (let order = 2; order <= maxOrder; order++) {
    if (currentBaseRows.length !== order - 1) {
      break;
    }

    const result = evaluateMinorsWithDetail(currentBaseRows, currentBaseCols, order);

    if (result.found && result.submatrix) {
      rank = order;
      currentBaseRows = result.newRows;
      currentBaseCols = result.newCols;

      if (order === maxOrder) {
        steps.push({
          stepNumber: stepCounter++,
          title: t("matrixOperations.maxOrderReachedTitle"),
          description: t("matrixOperations.maxOrderReachedDescription", {
            maxOrder,
            rows,
            cols
          }),
          formula: t("matrixOperations.maxOrderReachedFormula", { maxOrder }),
        });
        break;
      }
    } else {
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.resultForOrderTitle", { order }),
        description: t("matrixOperations.resultForOrderDescription", {
          order,
          rank: order - 1
        }),
        formula: t("matrixOperations.resultForOrderFormula", { rank: order - 1 }),
      });
      break;
    }
  }

  if (maxOrder === 1) {
    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.specialCase1x1Title"),
      description: t("matrixOperations.specialCase1x1Description"),
      formula: t("matrixOperations.specialCase1x1Formula", { rank }),
    });
  }

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.finalRankResultTitle"),
    description: getRankInterpretation(rank, rows, cols),
    formula: t("matrixOperations.finalRankResultFormula", { rank }),
    matrices: [
      { label: `\\text{${t("matrixOperations.originalMatrixLabel")}}`, matrix: matrix },
      { label: `\\text{${t("matrixOperations.rankLabel", { rank })}}`, matrix: [[rank]], highlight: true },
    ],
  });

  return { result: [[rank]], steps };
};

const calculateDeterminantWithSteps = (matrix: Matrix): MatrixOperationResult => {
  const n = matrix.length;
  let det = 0;

  if (n === 1) {
    det = matrix[0][0];
  } else if (n === 2) {
    det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  } else if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
    det = a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h;
  } else {
    for (let j = 0; j < n; j++) {
      const minor = getMinorDeterminant(matrix, 0, j);
      const minorDet = calculateDeterminantSimple(minor);
      const sign = Math.pow(-1, j);
      det += sign * matrix[0][j] * minorDet;
    }
  }

  return { result: [[det]], steps: [] };
};

const calculateDeterminantSimple = (matrix: Matrix): number => {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h;
};

const getRankInterpretation = (rank: number, rows: number, cols: number): string => {
  const maxPossibleRank = Math.min(rows, cols);

  if (rank === maxPossibleRank) {
    return t("matrixOperations.fullRankMessage", {
      maxRank: maxPossibleRank,
      rows,
      cols
    });
  } else if (rank === 0) {
    return t("matrixOperations.zeroRankMessage");
  } else {
    return t("matrixOperations.partialRankMessage", {
      rank,
      maxRank: maxPossibleRank,
      dependentRows: rows - rank,
      dependentCols: cols - rank
    });
  }
};

interface SystemSolutionResult {
  solution: Matrix | null;
  compatibility: string;
  steps: CalculationStep[];
  parametricSolution?: ParametricSolution;
  cramerApplied?: boolean;
}

interface ParametricSolution {
  particularSolution: Matrix;
  homogeneousBasis: Matrix[];
  freeVariables: number[];
  degreesOfFreedom: number;
  parametricForm?: string;
}

export const solveLinearSystem = (A: Matrix, B: Matrix): SystemSolutionResult => {
  const steps: CalculationStep[] = [];
  const n = A.length;
  const m = A[0]?.length || 0;

  if (B[0]?.length !== 1) throw new Error(t("matrixOperations.columnVectorError"));
  if (B.length !== n) throw new Error(t("matrixOperations.rowMismatchError"));

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.systemCheckTitle"),
    description: t("matrixOperations.systemCheckDescription", { equations: n, unknowns: m }),
    matrices: [
      { label: `\\text{${t("matrixOperations.matrixALabel")}}`, matrix: A },
      { label: `\\text{${t("matrixOperations.vectorBLabel")}}`, matrix: B }
    ],
  });

  const augmentedMatrix: Matrix = A.map((row, i) => [...row, B[i][0]]);
  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.augmentedMatrixTitle"),
    description: t("matrixOperations.augmentedMatrixDescription"),
    matrices: [
      { label: `\\text{${t("matrixOperations.augmentedMatrixLabel")}}`, matrix: augmentedMatrix, highlight: true }
    ],
  });

  const rankA = calculateRankSimple(A);
  const rankAugmented = calculateRankSimple(augmentedMatrix);
  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.rankCalculationTitle"),
    description: t("matrixOperations.rankCalculationDescription", {
      rankA,
      rankAugmented,
      unknowns: m
    }),
    formula: t("matrixOperations.rankCalculationFormula", {
      rankA,
      rankAugmented,
      unknowns: m
    })
  });

  let compatibility: string;
  let solution: Matrix | null = null;
  let parametricSolution: ParametricSolution | null = null;

  if (rankA !== rankAugmented) {
    compatibility = t("matrixOperations.incompatible");
    steps.push({
      stepNumber: 4,
      title: t("matrixOperations.systemIncompatibleTitle"),
      description: t("matrixOperations.systemIncompatibleDescription", { rankA, rankAugmented }),
      formula: t("matrixOperations.systemIncompatibleFormula")
    });
  } else if (rankA === m) {
    compatibility = t("matrixOperations.compatibleDetermined");
    solution = solveWithGaussianElimination(A, B, steps);
  } else {
    compatibility = t("matrixOperations.compatibleIndeterminate");
    const degreesOfFreedom = m - rankA;

    steps.push({
      stepNumber: 4,
      title: t("matrixOperations.systemIndeterminateTitle"),
      description: t("matrixOperations.systemIndeterminateDescription", {
        rankA,
        unknowns: m,
        degreesOfFreedom
      }),
      formula: t("matrixOperations.systemIndeterminateFormula", { degreesOfFreedom })
    });

    parametricSolution = solveIndeterminateSystemComplete(A, B, steps);
    solution = parametricSolution.particularSolution;
  }

  return { solution, compatibility, steps, parametricSolution };
};

const solveWithGaussianElimination = (A: Matrix, B: Matrix, steps: CalculationStep[]): Matrix => {
  const n = A.length;
  const m = A[0].length;
  let augmented: Matrix = A.map((row, i) => [...row, B[i][0]]);

  steps.push({
    stepNumber: steps.length + 1,
    title: t("matrixOperations.gaussianEliminationTitle"),
    description: t("matrixOperations.gaussianEliminationDescription"),
    matrices: [
      { label: `\\text{${t("matrixOperations.initialAugmentedMatrixLabel")}}`, matrix: augmented }
    ]
  });

  let stepCounter = steps.length + 1;

  for (let pivot = 0; pivot < Math.min(n, m); pivot++) {
    let maxRow = pivot;
    for (let i = pivot + 1; i < n; i++) {
      if (Math.abs(augmented[i][pivot]) > Math.abs(augmented[maxRow][pivot])) {
        maxRow = i;
      }
    }

    if (Math.abs(augmented[maxRow][pivot]) < 1e-10) continue;

    if (maxRow !== pivot) {
      [augmented[pivot], augmented[maxRow]] = [augmented[maxRow], augmented[pivot]];
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.rowSwapTitle"),
        description: t("matrixOperations.rowSwapDescription", { row1: pivot + 1, row2: maxRow + 1 }),
        matrices: [
          { label: `\\text{${t("matrixOperations.afterSwapLabel")}}`, matrix: augmented }
        ]
      });
    }

    const pivotValue = augmented[pivot][pivot];
    if (Math.abs(pivotValue) > 1e-10) {
      for (let j = pivot; j <= m; j++) {
        augmented[pivot][j] /= pivotValue;
      }

      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.pivotNormalizationTitle"),
        description: t("matrixOperations.pivotNormalizationDescription", { row: pivot + 1, pivotValue: pivotValue.toFixed(4) }),
        matrices: [
          { label: `\\text{${t("matrixOperations.afterNormalizationLabel")}}`, matrix: augmented }
        ]
      });
    }

    for (let i = pivot + 1; i < n; i++) {
      const factor = augmented[i][pivot];

      if (Math.abs(factor) > 1e-10) {
        for (let j = pivot; j <= m; j++) {
          augmented[i][j] -= factor * augmented[pivot][j];
        }

        steps.push({
          stepNumber: stepCounter++,
          title: t("matrixOperations.rowEliminationTitle", { row: i + 1 }),
          description: t("matrixOperations.rowEliminationDescription", { row: i + 1, factor: factor.toFixed(4), pivotRow: pivot + 1 }),
          matrices: [
            { label: `\\text{${t("matrixOperations.afterEliminationLabel")}}`, matrix: augmented }
          ]
        });
      }
    }
  }

  const solution: Matrix = createMatrix(m, 1);
  const usedRows: boolean[] = new Array(m).fill(false);

  for (let i = Math.min(n, m) - 1; i >= 0; i--) {
    let pivotCol = -1;
    for (let j = 0; j < m; j++) {
      if (Math.abs(augmented[i][j]) > 1e-10 && !usedRows[j]) {
        pivotCol = j;
        usedRows[j] = true;
        break;
      }
    }

    if (pivotCol === -1) continue;

    let sum = 0;
    for (let j = pivotCol + 1; j < m; j++) {
      sum += augmented[i][j] * solution[j][0];
    }
    solution[pivotCol][0] = augmented[i][m] - sum;
  }

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.backSubstitutionTitle"),
    description: t("matrixOperations.backSubstitutionDescription"),
    formula: t("matrixOperations.backSubstitutionFormula"),
    matrices: [
      { label: `\\text{${t("matrixOperations.finalSolutionLabel")}}`, matrix: solution, highlight: true }
    ]
  });

  return solution;
};

const solveIndeterminateSystemComplete = (A: Matrix, B: Matrix, steps: CalculationStep[]): ParametricSolution => {
  const n = A.length;
  const m = A[0].length;

  let augmented: Matrix = A.map((row, i) => [...row, B[i][0]]);

  steps.push({
    stepNumber: steps.length + 1,
    title: t("matrixOperations.gaussJordanTitle"),
    description: t("matrixOperations.gaussJordanDescription"),
    matrices: [
      { label: `\\text{${t("matrixOperations.initialAugmentedMatrixLabel")}}`, matrix: augmented }
    ]
  });

  let stepCounter = steps.length + 1;
  let pivotRow = 0;
  const pivotColumns: number[] = [];

  for (let col = 0; col < m && pivotRow < n; col++) {
    let maxRow = pivotRow;
    for (let i = pivotRow + 1; i < n; i++) {
      if (Math.abs(augmented[i][col]) > Math.abs(augmented[maxRow][col])) maxRow = i;
    }

    if (Math.abs(augmented[maxRow][col]) < 1e-10) continue;

    if (maxRow !== pivotRow) {
      [augmented[pivotRow], augmented[maxRow]] = [augmented[maxRow], augmented[pivotRow]];
      steps.push({
        stepNumber: stepCounter++,
        title: t("matrixOperations.rowSwapTitle"),
        description: t("matrixOperations.rowSwapDescription", { row1: pivotRow + 1, row2: maxRow + 1 }),
        matrices: [
          { label: `\\text{${t("matrixOperations.afterSwapLabel")}}`, matrix: augmented }
        ]
      });
    }

    const pivotValue = augmented[pivotRow][col];
    for (let j = col; j <= m; j++) augmented[pivotRow][j] /= pivotValue;

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.pivotNormalizationTitle", { col: col + 1 }),
      description: t("matrixOperations.pivotNormalizationDescription", { row: pivotRow + 1, pivotValue: pivotValue.toFixed(4) }),
      matrices: [
        { label: `\\text{${t("matrixOperations.afterNormalizationLabel")}}`, matrix: augmented }
      ]
    });

    for (let i = 0; i < n; i++) {
      if (i !== pivotRow && Math.abs(augmented[i][col]) > 1e-10) {
        const factor = augmented[i][col];
        for (let j = col; j <= m; j++) augmented[i][j] -= factor * augmented[pivotRow][j];

        steps.push({
          stepNumber: stepCounter++,
          title: t("matrixOperations.rowEliminationTitle", { row: i + 1 }),
          description: t("matrixOperations.rowEliminationDescription", { row: i + 1, factor: factor.toFixed(4), pivotRow: pivotRow + 1 }),
          matrices: [
            { label: `\\text{${t("matrixOperations.afterEliminationLabel")}}`, matrix: augmented }
          ]
        });
      }
    }

    pivotColumns.push(col);
    pivotRow++;
  }

  const freeVariables: number[] = [];
  for (let col = 0; col < m; col++) if (!pivotColumns.includes(col)) freeVariables.push(col);

  const degreesOfFreedom = freeVariables.length;
  const particularSolution: Matrix = createMatrix(m, 1);
  for (let i = 0; i < pivotColumns.length; i++) {
    const pivotCol = pivotColumns[i];
    particularSolution[pivotCol][0] = augmented[i][m];
  }

  const homogeneousBasis: Matrix[] = [];
  for (const freeVar of freeVariables) {
    const basisVector: Matrix = createMatrix(m, 1);
    basisVector[freeVar][0] = 1;
    for (let i = 0; i < pivotColumns.length; i++) {
      const pivotCol = pivotColumns[i];
      basisVector[pivotCol][0] = -augmented[i][freeVar];
    }
    homogeneousBasis.push(basisVector);
  }

  let parametricForm = "X = X_p";
  const paramNames = ['t', 's', 'u', 'v', 'w'];
  for (let i = 0; i < homogeneousBasis.length; i++) parametricForm += ` + ${paramNames[i]} \\cdot X_${i + 1}`;

  steps.push({
    stepNumber: stepCounter++,
    title: t("matrixOperations.parametricSolutionTitle"),
    description: t("matrixOperations.parametricSolutionDescription", { degreesOfFreedom, parametricForm }),
    formula: parametricForm,
    matrices: [
      { label: `\\text{${t("matrixOperations.reducedRowEchelonLabel")}}`, matrix: augmented },
      { label: `\\text{${t("matrixOperations.particularSolutionLabel")}}`, matrix: particularSolution, highlight: true }
    ]
  });

  for (let i = 0; i < homogeneousBasis.length; i++) {
    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.homogeneousBasisVectorTitle", { index: i + 1 }),
      description: t("matrixOperations.homogeneousBasisVectorDescription", { index: i + 1, paramName: paramNames[i] }),
      matrices: [
        { label: `\\text{${t("matrixOperations.homogeneousBasisVectorLabel", { index: i + 1 })}}`, matrix: homogeneousBasis[i] }
      ]
    });
  }

  if (homogeneousBasis.length > 0) {
    const exampleSolution = createMatrix(m, 1);
    for (let i = 0; i < m; i++) exampleSolution[i][0] = particularSolution[i][0] + homogeneousBasis[0][i][0];

    steps.push({
      stepNumber: stepCounter++,
      title: t("matrixOperations.exampleGeneralSolutionTitle"),
      description: t("matrixOperations.exampleGeneralSolutionDescription", { paramName: paramNames[0] }),
      matrices: [
        { label: `\\text{${t("matrixOperations.exampleGeneralSolutionLabel", { paramName: paramNames[0] })}}`, matrix: exampleSolution }
      ]
    });
  }

  return {
    particularSolution,
    homogeneousBasis,
    freeVariables,
    degreesOfFreedom,
    parametricForm
  };
};

const calculateRankSimple = (matrix: Matrix): number => {
  if (matrix.length === 0) return 0;

  const n = matrix.length;
  const m = matrix[0].length;

  const temp: Matrix = matrix.map(row => [...row]);
  let rank = 0;

  for (let col = 0; col < m && rank < n; col++) {
    let pivotRow = -1;

    for (let i = rank; i < n; i++) {
      if (Math.abs(temp[i][col]) > 1e-10) {
        pivotRow = i;
        break;
      }
    }

    if (pivotRow === -1) continue;

    if (pivotRow !== rank) {
      [temp[rank], temp[pivotRow]] = [temp[pivotRow], temp[rank]];
    }

    for (let i = rank + 1; i < n; i++) {
      const factor = temp[i][col] / temp[rank][col];
      for (let j = col; j < m; j++) {
        temp[i][j] -= factor * temp[rank][j];
      }
    }

    rank++;
  }

  return rank;
};

export const solveLinearSystemWithCramer = (A: Matrix, B: Matrix): SystemSolutionResult => {
  const steps: CalculationStep[] = [];
  const n = A.length;
  const m = A[0]?.length || 0;

  if (B[0]?.length !== 1) throw new Error("El vector B debe ser una matriz columna (n×1)");
  if (B.length !== n) throw new Error("El número de filas de A y B deben coincidir");
  if (n !== m) throw new Error("La regla de Cramer solo se aplica a sistemas cuadrados");

  steps.push({
    stepNumber: 1,
    title: t("matrixOperations.cramerVerificationTitle"),
    description: t("matrixOperations.cramerVerificationDescription", { n }),
    matrices: [
      { label: `\\text{${t("matrixOperations.coeffMatrixLabel")}}`, matrix: A },
      { label: `\\text{${t("matrixOperations.vectorBLabel")}}`, matrix: B }
    ]
  });

  steps.push({
    stepNumber: 2,
    title: t("matrixOperations.determinantStepTitle"),
    description: t("matrixOperations.determinantStepDescription"),
    formula: t("matrixOperations.formulaXi")
  });

  const detAResult = calculateDeterminant(A, 'cofactors');
  const detA = detAResult.result[0][0];

  steps.push({
    stepNumber: 3,
    title: t("matrixOperations.determinantResultTitle"),
    description: t("matrixOperations.determinantResultDescription"),
    formula: `\\det(A) = ${detA}`,
    matrices: [{ label: `\\text{${t("matrixOperations.determinantResultLabel")}}`, matrix: [[detA]], highlight: true }]
  });

  if (Math.abs(detA) < 1e-10) {
    steps.push({
      stepNumber: 4,
      title: t("matrixOperations.cramerNotApplicableTitle"),
      description: t("matrixOperations.cramerNotApplicableDescription", { detA }),
      formula: t("matrixOperations.cramerNotApplicableFormula")
    });
    return { solution: null, compatibility: t("matrixOperations.cramerNotApplicable"), steps, parametricSolution: undefined };
  }

  steps.push({
    stepNumber: 4,
    title: t("matrixOperations.cramerApplicableTitle"),
    description: t("matrixOperations.cramerApplicableDescription", { detA }),
    formula: t("matrixOperations.cramerApplicableFormula", { detA })
  });

  const solution: Matrix = createMatrix(n, 1);
  const cramerCalculations: string[] = [];

  for (let i = 0; i < n; i++) {
    const Ai: Matrix = A.map((row, rowIndex) =>
      row.map((value, colIndex) => (colIndex === i ? B[rowIndex][0] : value))
    );

    steps.push({
      stepNumber: 5 + i * 3,
      title: t("matrixOperations.matrixAiTitle", { i: i + 1 }),
      description: t("matrixOperations.matrixAiDescription", { i: i + 1 }),
      matrices: [
        {
          label: `A_{${i + 1}} = A \\text{ con columna ${i + 1} } \\to B`,
          matrix: Ai,
          highlight: true
        }
      ]
    });

    const detAiResult = calculateDeterminant(Ai, 'cofactors');
    const detAi = detAiResult.result[0][0];

    steps.push({
      stepNumber: 6 + i * 3,
      title: t("matrixOperations.detAiTitle", { i: i + 1 }),
      description: t("matrixOperations.detAiDescription", { i: i + 1 }),
      formula: `\\det(A_{${i + 1}}) = ${detAi}`,
      matrices: [{ label: `\\det(A_{${i + 1}})`, matrix: [[detAi]] }]
    });

    const xi = detAi / detA;
    solution[i][0] = xi;

    steps.push({
      stepNumber: 7 + i * 3,
      title: t("matrixOperations.calculateXiTitle", { i: i + 1 }),
      description: t("matrixOperations.calculateXiDescription", { i: i + 1 }),
      formula: `x_{${i + 1}} = \\frac{${detAi}}{${detA}} = ${xi.toFixed(6)}`,
      matrices: [{ label: `x_{${i + 1}}`, matrix: [[xi]], highlight: true }]
    });

    cramerCalculations.push(`x_{${i + 1}} = \\frac{${detAi}}{${detA}} = ${xi.toFixed(6)}`);
  }

  steps.push({
    stepNumber: 5 + n * 3,
    title: t("matrixOperations.cramerSummaryTitle"),
    description: t("matrixOperations.cramerSummaryDescription"),
    formula: cramerCalculations.join(" \\\\ "),
    matrices: [{ label: `\\text{${t("matrixOperations.finalSolutionLabel")}}`, matrix: solution, highlight: true }]
  });

  steps.push({
    stepNumber: 6 + n * 3,
    title: t("matrixOperations.verificationTitle"),
    description: t("matrixOperations.verificationDescription"),
    formula: t("matrixOperations.verificationFormula")
  });

  const verification = multiplyMatrices(A, solution);
  const error = verification.result.map((row, i) => Math.abs(row[0] - B[i][0])).reduce((sum, err) => sum + err, 0);
  const satisfies = error < 1e-8 ? "sí" : "no";

  steps.push({
    stepNumber: 7 + n * 3,
    title: t("matrixOperations.verificationResultTitle"),
    description: t("matrixOperations.verificationResultDescription", { error: error.toFixed(10), satisfies }),
    matrices: [
      { label: "A \\cdot X", matrix: verification.result },
      { label: "B", matrix: B }
    ]
  });

  return {
    solution,
    compatibility: t("matrixOperations.cramerCompatibility"),
    steps,
    parametricSolution: undefined
  };
};