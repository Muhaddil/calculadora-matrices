import { CalculationStep } from "@/components/StepDisplay";

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
    throw new Error(
      "Las matrices deben tener las mismas dimensiones para sumarlas"
    );
  }

  const steps: CalculationStep[] = [];
  const result: Matrix = [];
  const rows = a.length;
  const cols = a[0].length;

  steps.push({
    stepNumber: 1,
    title: "Verificación de dimensiones",
    description: `✓ Matriz A: ${rows}×${cols}\n✓ Matriz B: ${rows}×${cols}\n\nAmbas matrices tienen las mismas dimensiones, podemos proceder con la suma.`,
    matrices: [
      { label: "\\text{Matriz A}", matrix: a },
      { label: "\\text{Matriz B}", matrix: b },
    ],
  });

  steps.push({
    stepNumber: 2,
    title: "Regla de suma de matrices",
    description:
      "La suma de matrices se realiza sumando cada elemento correspondiente:",
    formula: "C_{i,j} = A_{i,j} + B_{i,j}",
  });

  const calculations: string[] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      const sum = a[i][j] + b[i][j];
      row.push(sum);
      calculations.push(
        `C_{${i + 1},${j + 1}} = ${a[i][j]} + ${b[i][j]} = ${sum}`
      );
    }
    result.push(row);
  }

  steps.push({
    stepNumber: 3,
    title: "Cálculos detallados",
    description: "Sumamos cada par de elementos correspondientes:",
    formula: calculations.join(" \\\\ "),
    matrices: [
      { label: "\\text{Matriz A}", matrix: a },
      { label: "\\text{Matriz B}", matrix: b },
      { label: "\\text{Resultado } (A + B)", matrix: result, highlight: true },
    ],
  });

  return { result, steps };
};

export const subtractMatrices = (
  a: Matrix,
  b: Matrix
): MatrixOperationResult => {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error(
      "Las matrices deben tener las mismas dimensiones para restarlas"
    );
  }

  const steps: CalculationStep[] = [];
  const result: Matrix = [];
  const rows = a.length;
  const cols = a[0].length;

  steps.push({
    stepNumber: 1,
    title: "Verificación de dimensiones",
    description: `✓ Matriz A: ${rows}×${cols}\n✓ Matriz B: ${rows}×${cols}\n\nAmbas matrices tienen las mismas dimensiones, podemos proceder con la resta.`,
    matrices: [
      { label: "\\text{Matriz A (minuendo)}", matrix: a },
      { label: "\\text{Matriz B (sustraendo)}", matrix: b },
    ],
  });

  steps.push({
    stepNumber: 2,
    title: "Regla de resta de matrices",
    description:
      "La resta de matrices se realiza restando cada elemento correspondiente:",
    formula: "C_{i,j} = A_{i,j} - B_{i,j}",
  });

  const calculations: string[] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      const diff = a[i][j] - b[i][j];
      row.push(diff);
      calculations.push(
        `C_{${i + 1},${j + 1}} = ${a[i][j]} - ${b[i][j]} = ${diff}`
      );
    }
    result.push(row);
  }

  steps.push({
    stepNumber: 3,
    title: "Cálculos detallados",
    description: "Restamos cada par de elementos correspondientes:",
    formula: calculations.join(" \\\\ "),
    matrices: [
      { label: "\\text{Matriz A}", matrix: a },
      { label: "\\text{Matriz B}", matrix: b },
      { label: "\\text{Resultado } (A - B)", matrix: result, highlight: true },
    ],
  });

  return { result, steps };
};

export const multiplyMatrices = (
  a: Matrix,
  b: Matrix
): MatrixOperationResult => {
  if (a[0].length !== b.length) {
    throw new Error(
      "El número de columnas de la primera matriz debe ser igual al número de filas de la segunda"
    );
  }

  const steps: CalculationStep[] = [];
  const aRows = a.length;
  const aCols = a[0].length;
  const bRows = b.length;
  const bCols = b[0].length;

  const result: Matrix = createMatrix(aRows, bCols);

  steps.push({
    stepNumber: 1,
    title: "Verificación de compatibilidad",
    description: `✓ Matriz A: ${aRows}×${aCols}\n✓ Matriz B: ${bRows}×${bCols}\n\nColumnas de A (${aCols}) = Filas de B (${bRows}) ✓\nLa multiplicación es posible. El resultado será una matriz ${aRows}×${bCols}.`,
    matrices: [
      { label: "Matriz A", matrix: a },
      { label: "Matriz B", matrix: b },
    ],
  });

  steps.push({
    stepNumber: 2,
    title: "Regla de multiplicación de matrices",
    description: `Para calcular cada elemento C_{i,j} del resultado:\n\n1. Tomamos la fila i de A\n2. Tomamos la columna j de B\n3. Multiplicamos elemento por elemento\n4. Sumamos todos los productos\n\nEjemplo: C_{1,1} = (fila 1 de A) ⋅ (columna 1 de B)`,
    formula: "C_{i,j} = \\sum_{k=1}^{3} A_{i,k} \\cdot B_{k,j}",
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
    title: "Cálculos detallados de todos los elementos",
    description: "Calculamos cada elemento paso a paso:",
    formula: detailedCalculations.join(" \\\\ "),
    matrices: [{ label: "Resultado (A × B)", matrix: result, highlight: true }],
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
    title: "Matriz original",
    description: `📋 Dimensión original: ${rows}×${cols}\n📋 Dimensión transpuesta: ${cols}×${rows}\n\nLa transposición intercambia filas por columnas. Es como "rotar" la matriz 90° y reflejarla.`,
    matrices: [{ label: "\\text{Matriz Original}", matrix: matrix }],
  });

  steps.push({
    stepNumber: 2,
    title: "Proceso de transposición",
    description: `🔄 Cada elemento de la matriz original se mueve según la regla:`,
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
          `A_{${i + 1},${j + 1}} = ${matrix[i][j]} \\rightarrow A^T_{${j + 1},${i + 1
          }} = ${matrix[i][j]} \\\\`
        );
      }
    }
  }

  steps.push({
    stepNumber: 3,
    title: "Transformaciones detalladas",
    description: `Ejemplos de cómo se mueven los elementos:`,
    formula:
      transformations.join("\n") +
      (rows * cols > 6 ? "\n\\dots \\,\\text{(y así sucesivamente)}" : ""),
    matrices: [
      { label: "\\text{Matriz Original}", matrix: matrix },
      {
        label: "\\text{Matriz Transpuesta } A^T",
        matrix: result,
        highlight: true,
      },
    ],
  });

  return { result, steps };
};

export const calculateDeterminant = (
  matrix: Matrix,
  method: "zeros" | "cofactors" | "sarrus" = "zeros",
): MatrixOperationResult => {
  if (matrix.length !== matrix[0].length) {
    throw new Error("El determinante solo se puede calcular para matrices cuadradas")
  }

  const steps: CalculationStep[] = []
  const n = matrix.length

  steps.push({
    stepNumber: 1,
    title: "Verificación y preparación",
    description: `Matriz cuadrada ${n}×${n} confirmada\nMétodo seleccionado: ${getMethodDescription(method, n)}`,
    matrices: [{ label: "\\text{Matriz Original}", matrix: matrix }],
  })

  let det: number
  if (n === 1) {
    det = matrix[0][0]
    steps.push({
      stepNumber: 2,
      title: "Caso especial: Matriz 1×1",
      description: `Para una matriz 1×1, el determinante es simplemente el valor del único elemento.`,
      formula: `det(A) = a₁₁ = ${det}`,
      matrices: [{ label: "\\text{Determinante}", matrix: [[det]] }],
    })
  } else if (n === 2) {
    const a = matrix[0][0],
      b = matrix[0][1]
    const c = matrix[1][0],
      d = matrix[1][1]
    det = a * d - b * c

    steps.push({
      stepNumber: 2,
      title: "Fórmula para matriz 2×2",
      description: `Fórmula: ad - bc\n${a}×${d} = ${a * d}\n${b}×${c} = ${b * c}\n${a * d} - ${b * c} = ${det}`,
      formula: `det(A) = ad - bc = ${det}`,
      matrices: [{ label: "\\text{Determinante}", matrix: [[det]] }],
    })
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
    title: "RESULTADO FINAL",
    description: `Matriz: ${n}×${n}\nValor del determinante: ${det}\nInterpretación: ${det === 0 ? "Matriz SINGULAR (no invertible)" : "Matriz REGULAR (invertible)"}`,
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{Determinante Final}", matrix: [[det]] }],
  })

  return { result: [[det]], steps }
}

const getMethodDescription = (method: string, n: number): string => {
  if (n === 3) {
    return method === "sarrus" ? "Regla de Sarrus" : "Desarrollo por cofactores"
  } else if (n >= 4) {
    return method === "zeros" ? "Hacer ceros (Gauss)" : "Desarrollo por cofactores"
  }
  return "Método directo"
}

const calculateDeterminant3x3Sarrus = (matrix: Matrix, steps: CalculationStep[]): number => {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix

  steps.push({
    stepNumber: 2,
    title: "Método: Regla de Sarrus",
    description: `Para matrices 3×3, la regla de Sarrus es más directa:\n- Repetir las dos primeras columnas a la derecha\n- Sumar productos de diagonales principales\n- Restar productos de diagonales secundarias`,
    formula: "det(A) = aei + bfg + cdh - ceg - bdi - afh",
    matrices: [{ label: "\\text{Matriz 3×3}", matrix: matrix }],
  })

  const aei = a * e * i
  const bfg = b * f * g
  const cdh = c * d * h
  const ceg = c * e * g
  const bdi = b * d * i
  const afh = a * f * h

  steps.push({
    stepNumber: 3,
    title: "Cálculo de productos diagonales",
    description: `Productos de diagonales principales (positivos):\na×e×i = ${a}×${e}×${i} = ${aei}\nb×f×g = ${b}×${f}×${g} = ${bfg}\nc×d×h = ${c}×${d}×${h} = ${cdh}\n\nProductos de diagonales secundarias (negativos):\nc×e×g = ${c}×${e}×${g} = ${ceg}\nb×d×i = ${b}×${d}×${i} = ${bdi}\na×f×h = ${a}×${f}×${h} = ${afh}`,
    formula: `Suma positiva: ${aei} + ${bfg} + ${cdh} = ${aei + bfg + cdh}\nSuma negativa: ${ceg} + ${bdi} + ${afh} = ${ceg + bdi + afh}`,
  })

  const det = aei + bfg + cdh - ceg - bdi - afh

  steps.push({
    stepNumber: 4,
    title: "Resultado final con Sarrus",
    description: `Aplicamos la fórmula completa:\ndet(A) = (${aei} + ${bfg} + ${cdh}) - (${ceg} + ${bdi} + ${afh})\ndet(A) = ${aei + bfg + cdh} - ${ceg + bdi + afh}\ndet(A) = ${det}`,
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{Determinante}", matrix: [[det]] }],
  })

  return det
}

const calculateDeterminant3x3Cofactors = (matrix: Matrix, steps: CalculationStep[]): number => {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix

  steps.push({
    stepNumber: 2,
    title: "Método: Desarrollo por cofactores",
    description: `Para una matriz 3×3, utilizamos la primera fila para el desarrollo:\nElementos de la primera fila: ${a}, ${b}, ${c}\nCada elemento se multiplica por su cofactor correspondiente\nLos cofactores alternan en signo: +, -, +`,
    formula: "det(A) = a₁₁C₁₁ + a₁₂C₁₂ + a₁₃C₁₃",
    matrices: [{ label: "\\text{Matriz 3×3}", matrix: matrix }],
  })

  const c11 = e * i - f * h
  const c12 = -(d * i - f * g)
  const c13 = d * h - e * g

  steps.push({
    stepNumber: 3,
    title: "Cálculo de cofactores paso a paso",
    description: `C₁₁ = +det([${e} ${f}; ${h} ${i}]) = +(${e}×${i} - ${f}×${h}) = +(${e * i} - ${f * h}) = ${c11}\nC₁₂ = -det([${d} ${f}; ${g} ${i}]) = -(${d}×${i} - ${f}×${g}) = -(${d * i} - ${f * g}) = ${c12}\nC₁₃ = +det([${d} ${e}; ${g} ${h}]) = +(${d}×${h} - ${e}×${g}) = +(${d * h} - ${e * g}) = ${c13}`,
    formula: "Cofactor = (-1)^(i+j) × det(menor)",
  })

  const det = a * c11 + b * c12 + c * c13

  steps.push({
    stepNumber: 4,
    title: "Resultado final",
    description: `Multiplicamos cada elemento por su cofactor y sumamos:\ndet(A) = ${a}×(${c11}) + ${b}×(${c12}) + ${c}×(${c13})\ndet(A) = ${a * c11} + ${b * c12} + ${c * c13}\ndet(A) = ${det}`,
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{Determinante}", matrix: [[det]] }],
  })

  return det
}

const calculateDeterminantWithZeros = (matrix: Matrix, steps: CalculationStep[]): number => {
  const n = matrix.length
  let stepCounter = 2
  let currentMatrix = matrix.map((row) => [...row])
  let detMultiplier = 1

  steps.push({
    stepNumber: stepCounter++,
    title: "Método: Hacer ceros estratégicamente",
    description: `Buscaremos la fila o columna con más ceros o que permita crear más ceros fácilmente.\nUsaremos operaciones elementales para simplificar el cálculo.`,
    matrices: [{ label: "\\text{Matriz Original}", matrix: currentMatrix }],
  })

  const { bestType, bestIndex, zerosCount } = findBestRowOrColumn(currentMatrix)

  steps.push({
    stepNumber: stepCounter++,
    title: `Análisis estratégico`,
    description: `Mejor opción encontrada: ${bestType} ${bestIndex + 1}\nCeros actuales: ${zerosCount}\nEsta ${bestType} nos permitirá minimizar los cálculos.`,
    matrices: [{ label: "\\text{Matriz Actual}", matrix: currentMatrix }],
  })

  if (zerosCount < n - 2) {
    const result = createZerosInRowOrColumn(currentMatrix, bestType, bestIndex, steps, stepCounter)
    currentMatrix = result.matrix
    detMultiplier *= result.multiplier
    stepCounter = result.nextStep
  }

  const det = developByOptimalRowOrColumn(currentMatrix, bestType, bestIndex, steps, stepCounter)

  return det * detMultiplier
}

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
  const n = matrix.length
  const currentMatrix = matrix.map((row) => [...row])
  let stepCounter = startStep
  const multiplier = 1

  steps.push({
    stepNumber: stepCounter++,
    title: `Creando ceros en ${type} ${index + 1}`,
    description: `Usaremos operaciones elementales para crear ceros.\nRecuerda: estas operaciones no cambian el valor del determinante (o lo multiplican por una constante conocida).`,
    matrices: [{ label: "\\text{Matriz antes de crear ceros}", matrix: currentMatrix }],
  })

  if (type === "fila") {
    let pivotCol = -1
    for (let j = 0; j < n; j++) {
      if (Math.abs(currentMatrix[index][j]) > 1e-10) {
        pivotCol = j
        break
      }
    }

    if (pivotCol === -1) return { matrix: currentMatrix, multiplier, nextStep: stepCounter }

    const pivot = currentMatrix[index][pivotCol]

    steps.push({
      stepNumber: stepCounter++,
      title: `Pivote seleccionado`,
      description: `Pivote: elemento [${index + 1},${pivotCol + 1}] = ${pivot}\nUsaremos este elemento para crear ceros en el resto de la ${type}.`,
      formula: `Pivote = a${index + 1}${pivotCol + 1} = ${pivot}`,
    })

    for (let i = 0; i < n; i++) {
      if (i === index || Math.abs(currentMatrix[i][pivotCol]) < 1e-10) continue

      const factor = currentMatrix[i][pivotCol] / pivot

      steps.push({
        stepNumber: stepCounter++,
        title: `Eliminando elemento [${i + 1},${pivotCol + 1}]`,
        description: `Factor = a${i + 1}${pivotCol + 1} / pivote = ${currentMatrix[i][pivotCol]} / ${pivot} = ${factor}\nOperación: F${i + 1} = F${i + 1} - (${factor}) × F${index + 1}`,
        formula: `F${i + 1} ← F${i + 1} - ${factor} × F${index + 1}`,
      })

      for (let j = 0; j < n; j++) {
        currentMatrix[i][j] -= factor * currentMatrix[index][j]
      }

      steps.push({
        stepNumber: stepCounter++,
        title: `Resultado de la operación`,
        description: `Fila ${i + 1} actualizada. El elemento [${i + 1},${pivotCol + 1}] ahora es 0.`,
        matrices: [{ label: "\\text{Matriz después de la operación}", matrix: currentMatrix.map((row) => [...row]) }],
      })
    }
  } else {
    let pivotRow = -1
    for (let i = 0; i < n; i++) {
      if (Math.abs(currentMatrix[i][index]) > 1e-10) {
        pivotRow = i
        break
      }
    }

    if (pivotRow === -1) return { matrix: currentMatrix, multiplier, nextStep: stepCounter }

    const pivot = currentMatrix[pivotRow][index]

    steps.push({
      stepNumber: stepCounter++,
      title: `Pivote seleccionado`,
      description: `Pivote: elemento [${pivotRow + 1},${index + 1}] = ${pivot}\nUsaremos este elemento para crear ceros en el resto de la ${type}.`,
      formula: `Pivote = a${pivotRow + 1}${index + 1} = ${pivot}`,
    })

    for (let j = 0; j < n; j++) {
      if (j === index || Math.abs(currentMatrix[pivotRow][j]) < 1e-10) continue

      const factor = currentMatrix[pivotRow][j] / pivot

      steps.push({
        stepNumber: stepCounter++,
        title: `Eliminando elemento [${pivotRow + 1},${j + 1}]`,
        description: `Factor = a${pivotRow + 1}${j + 1} / pivote = ${currentMatrix[pivotRow][j]} / ${pivot} = ${factor}\nOperación: C${j + 1} = C${j + 1} - (${factor}) × C${index + 1}`,
        formula: `C${j + 1} ← C${j + 1} - ${factor} × C${index + 1}`,
      })

      for (let i = 0; i < n; i++) {
        currentMatrix[i][j] -= factor * currentMatrix[i][index]
      }

      steps.push({
        stepNumber: stepCounter++,
        title: `Resultado de la operación`,
        description: `Columna ${j + 1} actualizada. El elemento [${pivotRow + 1},${j + 1}] ahora es 0.`,
        matrices: [{ label: "\\text{Matriz después de la operación}", matrix: currentMatrix.map((row) => [...row]) }],
      })
    }
  }

  return { matrix: currentMatrix, multiplier, nextStep: stepCounter }
}

const developByOptimalRowOrColumn = (
  matrix: Matrix,
  type: "fila" | "columna",
  index: number,
  steps: CalculationStep[],
  startStep: number,
): number => {
  const n = matrix.length
  let stepCounter = startStep

  steps.push({
    stepNumber: stepCounter++,
    title: `Desarrollo por ${type} ${index + 1}`,
    description: `Ahora desarrollaremos el determinante por la ${type} ${index + 1}.\nGracias a los ceros creados, muchos términos serán cero y el cálculo será más simple.`,
    matrices: [{ label: `Matriz optimizada ${n}×${n}`, matrix: matrix }],
  })

  let det = 0
  const elements = type === "fila" ? matrix[index] : matrix.map((row) => row[index])

  for (let j = 0; j < n; j++) {
    const element = elements[j]
    if (Math.abs(element) < 1e-10) {
      steps.push({
        stepNumber: stepCounter++,
        title: `Elemento ${type === "fila" ? `[${index + 1},${j + 1}]` : `[${j + 1},${index + 1}]`} = 0`,
        description: `Este elemento es cero, por lo que no contribuye al determinante.`,
        formula: `Contribución = 0`,
      })
      continue
    }

    const rowToRemove = type === "fila" ? index : j
    const colToRemove = type === "fila" ? j : index
    const sign = Math.pow(-1, rowToRemove + colToRemove)
    const signSymbol = sign === 1 ? "+" : "-"

    steps.push({
      stepNumber: stepCounter++,
      title: `Procesando elemento ${type === "fila" ? `[${index + 1},${j + 1}]` : `[${j + 1},${index + 1}]`} = ${element}`,
      description: `Signo: ${signSymbol} (porque (-1)^(${rowToRemove + 1} + ${colToRemove + 1}) = ${sign})`,
      formula: `C${rowToRemove + 1}${colToRemove + 1} = ${signSymbol} det(M${rowToRemove + 1}${colToRemove + 1})`,
    })

    const minor = getMinorDeterminant(matrix, rowToRemove, colToRemove)

    steps.push({
      stepNumber: stepCounter++,
      title: `Menor M${rowToRemove + 1}${colToRemove + 1}`,
      description: `Matriz ${n - 1}×${n - 1} obtenida al eliminar la fila ${rowToRemove + 1} y columna ${colToRemove + 1}.\n${n === 4 ? "Ahora tenemos una matriz 3×3 que es más fácil de calcular!" : ""}`,
      matrices: [{ label: `\\text{Menor ${n - 1}×${n - 1}}`, matrix: minor }],
    })

    let minorDet: number
    if (n - 1 === 1) {
      minorDet = minor[0][0]
      steps.push({
        stepNumber: stepCounter++,
        title: `Determinante del menor 1×1`,
        description: `Para una matriz 1×1, el determinante es el único elemento.`,
        formula: `det(M) = ${minorDet}`,
      })
    } else if (n - 1 === 2) {
      const [[a, b], [c, d]] = minor
      minorDet = a * d - b * c
      steps.push({
        stepNumber: stepCounter++,
        title: `Determinante del menor 2×2`,
        description: `Usando la fórmula ad - bc:\n${a}×${d} - ${b}×${c} = ${a * d} - ${b * c} = ${minorDet}`,
        formula: `det(M) = ${minorDet}`,
      })
    } else if (n - 1 === 3) {
      const tempSteps: CalculationStep[] = []
      minorDet = calculateDeterminant3x3Sarrus(minor, tempSteps)

      steps.push({
        stepNumber: stepCounter++,
        title: `Determinante del menor 3×3`,
        description: `Calculamos el determinante de la matriz 3×3 usando desarrollo por cofactores.\n¡Esto es mucho más simple que calcular directamente una matriz 4×4!`,
        formula: `det(M) = ${minorDet}`,
      })
    } else {
      minorDet = calculateDeterminantWithZerosSimple(minor)
    }

    const cofactor = sign * minorDet
    const contribution = element * cofactor
    det += contribution

    steps.push({
      stepNumber: stepCounter++,
      title: `Cálculo del cofactor y contribución`,
      description: `Cofactor = ${sign} × ${minorDet} = ${cofactor}\nContribución = ${element} × ${cofactor} = ${contribution}\nDeterminante parcial = ${det}`,
      formula: `Contribución = ${contribution}`,
    })
  }

  steps.push({
    stepNumber: stepCounter++,
    title: "Resultado del desarrollo optimizado",
    description: `Suma de todas las contribuciones de la ${type} ${index + 1}.\nGracias a la estrategia de ceros, solo calculamos los términos no nulos.`,
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{Determinante}", matrix: [[det]] }],
  })

  return det
}

const calculateDeterminantWithCofactors = (matrix: Matrix, steps: CalculationStep[]): number => {
  const n = matrix.length
  let stepCounter = 2

  steps.push({
    stepNumber: stepCounter++,
    title: "Método: Desarrollo por Cofactores",
    description: `Desarrollaremos la matriz por la primera fila:\nCada elemento a₁ⱼ se multiplica por su cofactor C₁ⱼ\nCofactor C₁ⱼ = (-1)¹⁺⁽ʲ⁾ × determinante del menor M₁ⱼ`,
    formula: `det(A) = a₁₁C₁₁ + a₁₂C₁₂ + ... + a₁ₙC₁ₙ`,
    matrices: [{ label: `\\text{Matriz ${n}×${n}}`, matrix: matrix }],
  })

  let det = 0

  for (let j = 0; j < n; j++) {
    const element = matrix[0][j]
    const sign = Math.pow(-1, 0 + j)
    const signSymbol = sign === 1 ? "+" : "-"

    steps.push({
      stepNumber: stepCounter++,
      title: `Procesando elemento a₁${j + 1} = ${element}`,
      description: `Calculando el cofactor para la posición [1,${j + 1}]:\nElemento: ${element}\nSigno: ${signSymbol} (porque (-1)¹⁺⁽${j + 1}⁾ = ${sign})`,
      formula: `C₁${j + 1} = ${signSymbol} det(M₁${j + 1})`,
    })

    const minor = getMinorDeterminant(matrix, 0, j)

    steps.push({
      stepNumber: stepCounter++,
      title: `Menor M₁${j + 1}`,
      description: `Matriz obtenida al eliminar la fila 1 y columna ${j + 1}`,
      matrices: [{ label: `\\text{Menor ${n - 1}×${n - 1}}`, matrix: minor }],
    })

    const minorDet = calculateDeterminantWithZerosSimple(minor)
    const cofactor = sign * minorDet
    const contribution = element * cofactor
    det += contribution

    steps.push({
      stepNumber: stepCounter++,
      title: `Cálculo completo para a₁${j + 1}`,
      description: `det(M₁${j + 1}) = ${minorDet}\nCofactor = ${sign} × ${minorDet} = ${cofactor}\nContribución = ${element} × ${cofactor} = ${contribution}`,
      formula: `a₁${j + 1} × C₁${j + 1} = ${contribution}`,
    })
  }

  steps.push({
    stepNumber: stepCounter++,
    title: "Resultado final",
    description: `Suma de todas las contribuciones:`,
    formula: `det(A) = ${det}`,
    matrices: [{ label: "\\text{Determinante}", matrix: [[det]] }],
  })

  return det
}

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
    throw new Error(
      "La matriz adjunta solo se puede calcular para matrices cuadradas"
    );
  }

  const steps: CalculationStep[] = [];
  const n = matrix.length;
  const cofactors: Matrix = createMatrix(n, n);
  const result: Matrix = createMatrix(n, n);

  steps.push({
    stepNumber: 1,
    title: "Concepto de matriz adjunta",
    description: `🎯 La matriz adjunta (o adjugada) se calcula en dos pasos:\n\n1️⃣ Calcular la matriz de cofactores\n2️⃣ Transponer la matriz de cofactores\n\n📚 Es fundamental para calcular la matriz inversa: A^{-1} = (1/det(A)) × adj(A)`,
    matrices: [{ label: "\\text{Matriz Original}", matrix: matrix }],
  });

  steps.push({
    stepNumber: 2,
    title: "¿Qué es un cofactor?",
    description: `🔍 Para cada elemento A_{i,j}, su cofactor C_{i,j} se calcula así:\n\n• Eliminar la fila i y columna j (obtener el "menor")\n• Calcular el determinante de ese menor\n• Aplicar el signo: (-1)^{i+j}\n\n📝 El patrón de signos es como un tablero de ajedrez:`,
    formula: "C_{i,j} = (-1)^{i+j} \\times \\det(M_{i,j})",
  });

  const cofactorExamples: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = getMinor(matrix, i, j);
      const minorDet = determinantRecursive(minor);
      const sign = Math.pow(-1, 0 + j);
      cofactors[i][j] = sign * minorDet;

      if (cofactorExamples.length < 4) {
        const signStr = sign > 0 ? "+" : "-";
        cofactorExamples.push(
          `C_{${i + 1},${j + 1
          }} = ${signStr}\\det(\\text{menor}) = ${signStr}(${minorDet}) = ${cofactors[i][j]
          } \\\\`
        );
      }
    }
  }

  steps.push({
    stepNumber: 3,
    title: "Cálculo de cofactores",
    description: `Calculamos algunos cofactores como ejemplo:`,
    matrices: [{ label: "\\text{Matriz de Cofactores}", matrix: cofactors }],
    formula: cofactorExamples.join("\n"),
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[j][i] = cofactors[i][j];
    }
  }

  steps.push({
    stepNumber: 4,
    title: "Transposición final",
    description: `🔄 El último paso es transponer la matriz de cofactores:\n\n• Cada fila se convierte en columna\n• C_{i,j} → adj(A)_{j,i}\n\n✅ ¡Ya tenemos la matriz adjunta!`,
    formula: "\\text{adj}(A) = (\\text{matriz de cofactores})^T",
    matrices: [
      { label: "\\text{Matriz de Cofactores}", matrix: cofactors },
      { label: "\\text{Matriz Adjunta}", matrix: result, highlight: true },
    ],
  });

  return { result, steps };
};

export const calculateInverse = (matrix: Matrix): MatrixOperationResult => {
  if (matrix.length !== matrix[0].length) {
    throw new Error(
      "La matriz inversa solo se puede calcular para matrices cuadradas"
    );
  }

  const steps: CalculationStep[] = [];
  const n = matrix.length;

  steps.push({
    stepNumber: 1,
    title: "¿Qué es la matriz inversa?",
    description: `La matriz inversa A⁻¹ es aquella que cumple: A × A⁻¹ = I`,
    matrices: [{ label: "\\text{Matriz } A", matrix: matrix }],
  });

  const det = determinantRecursive(matrix);

  if (Math.abs(det) < 1e-10) {
    throw new Error("La matriz no es invertible (determinante = 0)");
  }

  steps.push({
    stepNumber: 2,
    title: "Verificación de invertibilidad",
    description: `Determinante calculado: det(A) = ${det}`,
    formula: `det(A) = ${det} \\neq 0 \\; \\checkmark`,
  });

  const cofactorMatrix = matrix.map((row, i) =>
    row.map((_, j) => {
      const minor = getMinor(matrix, i, j);
      const cofactor =
        ((i + j) % 2 === 0 ? 1 : -1) * determinantRecursive(minor);
      return cofactor;
    })
  );

  steps.push({
    stepNumber: 3,
    title: "Matriz de cofactores",
    description: "Cada elemento se define como:",
    formula: `C_{ij} = (-1)^{i+j} \\cdot \\det(M_{ij})`,
    matrices: [
      { label: "\\text{Matriz de Cofactores}", matrix: cofactorMatrix },
    ],
  });

  const adjMatrix = transpose(cofactorMatrix);

  steps.push({
    stepNumber: 4,
    title: "Matriz adjunta",
    description: `La matriz adjunta es la transpuesta de la matriz de cofactores`,
    matrices: [
      { label: "\\text{Matriz Adjunta } \\text{adj}(A)", matrix: adjMatrix },
    ],
  });

  const fractionText = `\\frac{1}{${det}}`;
  const displayLabel = `\\text{Matriz Inversa } A^{-1} = ${fractionText} \\times \\text{adj}(A)`;

  steps.push({
    stepNumber: 5,
    title: "Matriz inversa (forma fraccionaria)",
    description: `La matriz inversa se obtiene multiplicando la matriz adjunta por $\\frac{1}{\\det(A)}$`,
    matrices: [
      {
        label: displayLabel,
        matrix: adjMatrix,
        fraction: fractionText,
        highlight: true,
      },
    ],
  });

  const result: Matrix = adjMatrix.map((row) => row.map((cell) => cell / det));

  steps.push({
    stepNumber: 6,
    title: "Matriz inversa resultante",
    description: `Matriz inversa calculada con valores exactos`,
    matrices: [
      {
        label: "\\text{Matriz Inversa } A^{-1}",
        matrix: result,
        highlight: true,
        showAsFraction: true,
      },
    ],
  });

  const identityCheck = multiplyMatrices(matrix, result);

  steps.push({
    stepNumber: 7,
    title: "Verificación",
    description: `Comprobación: A × A⁻¹ = I`,
    matrices: [
      {
        label: "\\text{Verificación: } A \\times A^{-1} \\approx I",
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
    title: "Definición del rango por menores",
    description: `El rango de una matriz es el orden del mayor menor no nulo.\n\nUn "menor" es el determinante de una submatriz cuadrada.\n\nMétodo: Buscaremos sistemáticamente menores de orden creciente.`,
    formula: "\\text{rango}(A) = \\max\\{k : \\exists \\text{ menor de orden } k \\neq 0\\}",
    matrices: [{ label: "\\text{Matriz Original}", matrix: matrix }],
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
      title: "Matriz nula detectada",
      description: "🔍 Examinando todos los elementos:\n\n• Todos los elementos son cero\n• No hay menores no nulos de ningún orden",
      formula: "\\text{rango}(A) = 0",
    });

    return { result: [[0]], steps };
  }

  steps.push({
    stepNumber: stepCounter++,
    title: "🔍 Búsqueda de menor de orden 1 no nulo",
    description: "Un menor de orden 1 es simplemente un elemento de la matriz.\nBuscamos al menos un elemento diferente de cero.",
    matrices: [{ label: "\\text{Examinando elementos individuales}", matrix: matrix }],
  });

  let firstNonZeroPos: [number, number] | null = null;
  const nonZeroElements: string[] = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (Math.abs(matrix[i][j]) > 1e-10) {
        nonZeroElements.push(`a_{${i + 1}${j + 1}} = ${matrix[i][j]}`);
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
      title: "✅ Menor de orden 1 no nulo encontrado",
      description: `Elementos no nulos encontrados:\n${nonZeroElements.join('\n')}\n\nUsaremos como base el elemento [${i + 1},${j + 1}] = ${matrix[i][j]}`,
      formula: `M_{1} = |${matrix[i][j]}| = ${matrix[i][j]} \\neq 0 \\Rightarrow \\text{rango} \\geq 1`,
      matrices: [{
        label: `\\text{Menor de orden 1 (posición [${i + 1},${j + 1}])}`,
        matrix: [[matrix[i][j]]],
        highlight: true
      }],
    });
  }

  const evaluateMinorsWithDetail = (baseRows: number[], baseCols: number[], targetOrder: number): { found: boolean; submatrix: Matrix | null; newRows: number[]; newCols: number[]; det: number } => {

    steps.push({
      stepNumber: stepCounter++,
      title: `🔍 Construyendo menores de orden ${targetOrder}`,
      description: `A partir del menor base de orden ${targetOrder - 1} (filas [${baseRows.map(r => r + 1).join(',')}], columnas [${baseCols.map(c => c + 1).join(',')}])\n\nAñadiremos una fila y una columna nuevas para formar submatrices ${targetOrder}×${targetOrder}.`,
      formula: `\\text{Base: orden ${targetOrder - 1}} \\rightarrow \\text{Objetivo: orden ${targetOrder}}`,
    });

    for (let newRow = 0; newRow < rows; newRow++) {
      if (baseRows.includes(newRow)) continue;

      for (let newCol = 0; newCol < cols; newCol++) {
        if (baseCols.includes(newCol)) continue;

        const extendedRows = [...baseRows, newRow];
        const extendedCols = [...baseCols, newCol];

        const submatrix: Matrix = [];
        for (const i of extendedRows) {
          const row: number[] = [];
          for (const j of extendedCols) {
            row.push(matrix[i][j]);
          }
          submatrix.push(row);
        }

        const constructionDesc = `Submatriz formada por:\n• Filas: ${extendedRows.map(r => r + 1).join(', ')}\n• Columnas: ${extendedCols.map(c => c + 1).join(', ')}`;

        steps.push({
          stepNumber: stepCounter++,
          title: `Probando menor específico de orden ${targetOrder}`,
          description: constructionDesc,
          matrices: [{
            label: `\\text{Menor de orden ${targetOrder} en prueba}`,
            matrix: submatrix
          }],
        });

        const detResult = calculateDeterminantWithSteps(submatrix);
        const det = detResult.result[0][0];

        steps.push({
          stepNumber: stepCounter++,
          title: `Cálculo del determinante de orden ${targetOrder}`,
          description: `El determinante de esta submatriz ${targetOrder}×${targetOrder} es:`,
          formula: `\\det(M_{${targetOrder}}) = ${det}`,
          matrices: [{
            label: `\\text{Resultado del determinante}`,
            matrix: [[det]]
          }],
        });

        if (Math.abs(det) > 1e-10) {
          steps.push({
            stepNumber: stepCounter++,
            title: `✅ ¡Menor de orden ${targetOrder} no nulo encontrado!`,
            description: `Hemos encontrado una submatriz ${targetOrder}×${targetOrder} con determinante no cero.\n\nEsto significa que hay ${targetOrder} filas y ${targetOrder} columnas linealmente independientes.`,
            formula: `\\det = ${det} \\neq 0 \\Rightarrow \\text{rango} \\geq ${targetOrder}`,
            matrices: [{
              label: `\\text{Menor no nulo de orden ${targetOrder}}`,
              matrix: submatrix,
              highlight: true
            }],
          });

          return { found: true, submatrix, newRows: extendedRows, newCols: extendedCols, det };
        } else {
          steps.push({
            stepNumber: stepCounter++,
            title: `❌ Menor de orden ${targetOrder} es nulo`,
            description: `Esta submatriz particular tiene determinante cero.\n\nContinuamos probando otras combinaciones...`,
            formula: `\\det = 0 \\Rightarrow \\text{Esta combinación no aumenta el rango}`,
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
          title: `🎉 Orden máximo alcanzado`,
          description: `Hemos encontrado un menor no nulo de orden ${maxOrder}, que es el máximo posible para una matriz ${rows}×${cols}.`,
          formula: `\\text{rango}(A) = ${maxOrder} \\text{ (rango completo)}`,
        });
        break;
      }
    } else {
      steps.push({
        stepNumber: stepCounter++,
        title: `📊 Resultado para orden ${order}`,
        description: `No se encontró ningún menor de orden ${order} no nulo que extienda el menor base.\n\nEsto significa que el rango de la matriz es ${order - 1}.`,
        formula: `\\text{rango}(A) = ${order - 1}`,
      });
      break;
    }
  }

  if (maxOrder === 1) {
    steps.push({
      stepNumber: stepCounter++,
      title: "Caso especial: Matriz 1×1",
      description: "Para una matriz 1×1, el rango es 1 si el elemento es no nulo.",
      formula: `\\text{rango}(A) = ${rank}`,
    });
  }

  steps.push({
    stepNumber: stepCounter++,
    title: "🎯 Resultado final del rango",
    description: getRankInterpretation(rank, rows, cols),
    formula: `\\text{rango}(A) = ${rank}`,
    matrices: [
      { label: "\\text{Matriz Original}", matrix: matrix },
      { label: `\\text{Rango} = ${rank}`, matrix: [[rank]], highlight: true },
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
    return `✅ La matriz tiene rango completo (rango máximo posible: ${maxPossibleRank}).\n\n• Todas las ${rows} filas son linealmente independientes\n• Todas las ${cols} columnas son linealmente independientes\n• La matriz es de rango máximo`;
  } else if (rank === 0) {
    return `❌ La matriz es nula.\n\n• No hay filas linealmente independientes\n• No hay columnas linealmente independientes\n• Todos los elementos son cero`;
  } else {
    return `📊 La matriz tiene rango ${rank} de un máximo posible de ${maxPossibleRank}.\n\n• Hay ${rank} filas linealmente independientes\n• Hay ${rank} columnas linealmente independientes\n• ${rows - rank} filas son combinación lineal de otras\n• ${cols - rank} columnas son combinación lineal de otras`;
  }
};