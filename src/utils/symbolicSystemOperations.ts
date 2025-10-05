import { CalculationStep } from "@/components/StepDisplay";
import { SymbolicExpression, symbolicMultiply, symbolicAdd, symbolicSubtract, symbolicDivide } from "./symbolicMath";
import { SymbolicMatrix, parseSymbolicMatrix } from "./symbolicMatrixOperations";
import { create, all, MathJsInstance } from 'mathjs';

const math: MathJsInstance = create(all, {});

export interface SymbolicSystemResult {
    solution: SymbolicMatrix | null;
    compatibility: string;
    steps: CalculationStep[];
    parametricSolution?: SymbolicParametricSolution;
    specialCases?: SymbolicSpecialCase[];
}

export interface SymbolicParametricSolution {
    particularSolution: SymbolicMatrix;
    homogeneousBasis: SymbolicMatrix[];
    freeVariables: number[];
    degreesOfFreedom: number;
    parametricForm?: string;
}

export interface SymbolicSpecialCase {
    condition: string;
    solution: SymbolicSystemResult;
}

export function solveSymbolicLinearSystem(
    A: (number | string)[][],
    B: (number | string)[][],
    method: 'gauss' | 'cramer' = 'gauss'
): SymbolicSystemResult {
    const steps: CalculationStep[] = [];

    try {
        const symbolicA = parseSymbolicMatrix(A);
        const symbolicB = parseSymbolicMatrix(B);

        const n = symbolicA.length;
        const m = symbolicA[0]?.length || 0;

        steps.push({
            stepNumber: 1,
            title: "Sistema de ecuaciones original",
            description: `Sistema de ${n} ecuaciones con ${m} incógnitas - Método: ${method.toUpperCase()}`,
            matrices: [
                {
                    label: "A",
                    matrix: symbolicA.map(row => row.map(() => 0)),
                    customLabels: symbolicA.map(row => row.map(cell => cell.toLatex()))
                },
                {
                    label: "B",
                    matrix: symbolicB.map(row => row.map(() => 0)),
                    customLabels: symbolicB.map(row => row.map(cell => cell.toLatex()))
                }
            ],
        });

        const equations = symbolicA.map((row, i) => {
            const terms = row.map((coef, j) => {
                if (coef.isZero()) return '';
                return `${coef.toLatex()}x_{${j + 1}}`;
            }).filter(term => term !== '').join(' + ');
            return `${terms} = ${symbolicB[i][0].toLatex()}`;
        }).join('\\\\');

        steps.push({
            stepNumber: 2,
            title: "Ecuaciones del sistema",
            description: "Sistema en forma de ecuaciones:",
            formula: `\\begin{cases} ${equations} \\end{cases}`
        });

        const hasParameters = checkForParameters(symbolicA, symbolicB);

        if (hasParameters) {
            steps.push({
                stepNumber: 3,
                title: "Sistema con parámetros detectado",
                description: "Analizando casos especiales para diferentes valores de los parámetros",
            });

            const result = analyzeParametricSystem(symbolicA, symbolicB, method, steps);
            return result;
        }

        if (method === 'cramer') {
            return solveByCramer(symbolicA, symbolicB, steps);
        } else {
            return solveByGauss(symbolicA, symbolicB, steps);
        }
    } catch (error) {
        return {
            solution: null,
            compatibility: "ERROR: " + (error instanceof Error ? error.message : "Error desconocido"),
            steps: [...steps, {
                stepNumber: steps.length + 1,
                title: "Error en el cálculo",
                description: "No se pudo resolver el sistema simbólicamente.",
            }]
        };
    }
}

function checkForParameters(A: SymbolicMatrix, B: SymbolicMatrix): boolean {
    const allExpressions = [...A.flat(), ...B.flat()];
    return allExpressions.some(expr => {
        const vars = expr.getVariables();
        return vars.some(v => !v.startsWith('x'));
    });
}

function analyzeParametricSystem(
    A: SymbolicMatrix,
    B: SymbolicMatrix,
    method: 'gauss' | 'cramer',
    steps: CalculationStep[]
): SymbolicSystemResult {
    const n = A.length;
    const m = A[0].length;

    if (n === m && n <= 3) {
        const det = calculateDeterminant(A);

        steps.push({
            stepNumber: steps.length + 1,
            title: "Cálculo del determinante",
            description: "Encontramos el determinante del sistema:",
            formula: `\\det(A) = ${det.toLatex()}`
        });

        const criticalValues = solveCriticalValues(det);

        if (criticalValues.length > 0) {
            steps.push({
                stepNumber: steps.length + 1,
                title: "Valores críticos encontrados",
                description: `El determinante se anula para:`,
                formula: criticalValues.map(val => val.condition).join(', ')
            });

            const specialCases: SymbolicSpecialCase[] = [];

            let generalResult: SymbolicSystemResult;
            if (method === 'cramer') {
                generalResult = solveByCramer(A, B, [...steps]);
            } else {
                generalResult = solveByGauss(A, B, [...steps]);
            }

            generalResult.compatibility = `COMPATIBLE DETERMINADO (caso general - det(A) ≠ 0)`;

            for (const critical of criticalValues) {
                const caseSteps: CalculationStep[] = [{
                    stepNumber: 1,
                    title: `CASO ESPECIAL: ${critical.condition}`,
                    description: `Resolviendo el sistema cuando ${critical.condition}`,
                    formula: `\\text{Sustituyendo } ${critical.condition} \\text{ en el sistema}`
                }];

                try {
                    const substitutedA = substituteParameterSimple(A, critical.parameter, critical.value);
                    const substitutedB = substituteParameterSimple(B, critical.parameter, critical.value);

                    const substitutedEquations = substitutedA.map((row, i) => {
                        const terms = row.map((coef, j) => {
                            if (coef.isZero()) return '';
                            return `${coef.toLatex()}x_{${j + 1}}`;
                        }).filter(term => term !== '').join(' + ');
                        return `${terms} = ${substitutedB[i][0].toLatex()}`;
                    }).join('\\\\');

                    caseSteps.push({
                        stepNumber: 2,
                        title: "Sistema sustituido",
                        description: `Sistema después de sustituir ${critical.condition}:`,
                        formula: `\\begin{cases} ${substitutedEquations} \\end{cases}`
                    });

                    const specialResult = solveByGauss(substitutedA, substitutedB, caseSteps);
                    specialResult.compatibility = `CASO ESPECIAL: ${critical.condition} - ${specialResult.compatibility}`;

                    specialCases.push({
                        condition: critical.condition,
                        solution: specialResult
                    });
                } catch (error) {
                    caseSteps.push({
                        stepNumber: 2,
                        title: "Error en sustitución",
                        description: `No se pudo sustituir ${critical.condition} en el sistema`,
                    });

                    specialCases.push({
                        condition: critical.condition,
                        solution: {
                            solution: null,
                            compatibility: "ERROR EN SUSTITUCIÓN",
                            steps: caseSteps
                        }
                    });
                }
            }

            if (specialCases.length > 0) {
                steps.push({
                    stepNumber: steps.length + 1,
                    title: "Casos especiales identificados",
                    description: `Se encontraron ${specialCases.length} caso(s) especial(es) que requieren análisis por separado:`,
                    formula: specialCases.map((sc, i) => `\\text{Caso ${i + 1}: } ${sc.condition}`).join('\\\\')
                });
            }

            return {
                solution: generalResult.solution,
                compatibility: generalResult.compatibility,
                steps: generalResult.steps,
                specialCases
            };
        }
    }

    if (method === 'cramer') {
        return solveByCramer(A, B, steps);
    } else {
        return solveByGauss(A, B, steps);
    }
}

function solveCriticalValues(det: SymbolicExpression): Array<{ parameter: string, value: number, condition: string }> {
    const results: Array<{ parameter: string, value: number, condition: string }> = [];
    const parameters = det.getVariables().filter(v => !v.startsWith('x'));

    for (const param of parameters) {
        try {
            const solutions = det.solveFor(param);
            for (const solution of solutions) {
                if (solution.isConstant()) {
                    const value = solution.toNumber();
                    const exists = results.some(r => r.parameter === param && Math.abs(r.value - value) < 1e-10);
                    if (!exists) {
                        results.push({
                            parameter: param,
                            value: value,
                            condition: `${param} = ${value}`
                        });
                    }
                }
            }
        } catch (error) {
            // Continuar si no se puede resolver
        }
    }

    return results;
}

function substituteParameterSimple(matrix: SymbolicMatrix, param: string, value: number): SymbolicMatrix {
    return matrix.map(row =>
        row.map(cell => {
            const exprString = cell.toString();

            let expr;
            try {
                expr = math.parse(exprString);
            } catch (e) {
                return SymbolicExpression.parse(exprString);
            }

            const substituted = expr.evaluate({ [param]: value });

            if (typeof substituted === 'number') {
                return SymbolicExpression.fromNumber(substituted);
            }

            return SymbolicExpression.parse(substituted.toString());
        })
    );
}

function solveByCramer(
    A: SymbolicMatrix,
    B: SymbolicMatrix,
    steps: CalculationStep[]
): SymbolicSystemResult {
    const n = A.length;
    const m = A[0].length;

    if (n !== m) {
        steps.push({
            stepNumber: steps.length + 1,
            title: "Método de Cramer no aplicable",
            description: "El sistema no es cuadrado, usando eliminación gaussiana",
        });
        return solveByGauss(A, B, steps);
    }

    steps.push({
        stepNumber: steps.length + 1,
        title: "APLICANDO MÉTODO DE CRAMER",
        description: "Resolviendo por determinantes usando la regla de Cramer",
    });

    const detA = calculateDeterminant(A);

    steps.push({
        stepNumber: steps.length + 1,
        title: "Determinante principal del sistema",
        description: "Calculamos el determinante de la matriz de coeficientes:",
        formula: `\\det(A) = ${detA.toLatex()}`
    });

    const criticalValues = solveCriticalValues(detA);

    if (criticalValues.length > 0) {
        const specialCases: SymbolicSpecialCase[] = [];

        for (const critical of criticalValues) {
            const caseSteps: CalculationStep[] = [{
                stepNumber: 1,
                title: `CASO ESPECIAL: ${critical.condition}`,
                description: `Resolviendo el sistema cuando ${critical.condition}`,
                formula: `\\text{Sustituyendo } ${critical.condition} \\text{ en el sistema}`
            }];

            try {
                const substitutedA = substituteParameterSimple(A, critical.parameter, critical.value);
                const substitutedB = substituteParameterSimple(B, critical.parameter, critical.value);

                const substitutedEquations = substitutedA.map((row, i) => {
                    const terms = row.map((coef, j) => {
                        if (coef.isZero()) return '';
                        return `${coef.toLatex()}x_{${j + 1}}`;
                    }).filter(term => term !== '').join(' + ');
                    return `${terms} = ${substitutedB[i][0].toLatex()}`;
                }).join('\\\\');

                caseSteps.push({
                    stepNumber: 2,
                    title: "Sistema sustituido",
                    description: `Sistema después de sustituir ${critical.condition}:`,
                    formula: `\\begin{cases} ${substitutedEquations} \\end{cases}`
                });

                const specialResult = solveByGauss(substitutedA, substitutedB, caseSteps);
                specialResult.compatibility = `CASO ESPECIAL: ${critical.condition} - ${specialResult.compatibility}`;

                specialCases.push({
                    condition: critical.condition,
                    solution: specialResult
                });
            } catch (error) {
                caseSteps.push({
                    stepNumber: 2,
                    title: "Error en sustitución",
                    description: `No se pudo sustituir ${critical.condition} en el sistema`,
                });

                specialCases.push({
                    condition: critical.condition,
                    solution: {
                        solution: null,
                        compatibility: "ERROR EN SUSTITUCIÓN",
                        steps: caseSteps
                    }
                });
            }
        }

        if (detA.isZero()) {
            steps.push({
                stepNumber: steps.length + 1,
                title: "SISTEMA SINGULAR - DETERMINANTE CERO",
                description: "El determinante es cero, mostrando análisis de casos especiales",
            });

            return {
                solution: null,
                compatibility: "SISTEMA SINGULAR - ver casos especiales",
                steps,
                specialCases
            };
        }

        const generalResult = continueCramerSolution(A, B, detA, criticalValues, steps);
        generalResult.specialCases = specialCases;

        return generalResult;
    }

    if (detA.isZero()) {
        steps.push({
            stepNumber: steps.length + 1,
            title: "SISTEMA SINGULAR - NO APLICABLE CRAMER",
            description: "El determinante es cero, el sistema puede ser incompatible o indeterminado",
            formula: `\\det(A) = 0 \\Rightarrow \\text{No existe solución única}`
        });
        return solveByGauss(A, B, steps);
    }

    return continueCramerSolution(A, B, detA, criticalValues, steps);
}

function continueCramerSolution(
    A: SymbolicMatrix,
    B: SymbolicMatrix,
    detA: SymbolicExpression,
    criticalValues: Array<{ parameter: string, value: number, condition: string }>,
    steps: CalculationStep[]
): SymbolicSystemResult {
    const n = A.length;

    steps.push({
        stepNumber: steps.length + 1,
        title: "REGLA DE CRAMER - EXPLICACIÓN",
        description: "Para cada variable, sustituimos la columna correspondiente por el vector B y calculamos el determinante:",
        formula: `x_i = \\frac{\\det(A_i)}{\\det(A)}`
    });

    const solution: SymbolicMatrix = [];
    const detValues: SymbolicExpression[] = [];

    for (let i = 0; i < n; i++) {
        const Ai: SymbolicMatrix = A.map((row, rowIdx) =>
            row.map((cell, colIdx) => colIdx === i ? B[rowIdx][0] : cell)
        );

        const detAi = calculateDeterminant(Ai);
        detValues.push(detAi);

        steps.push({
            stepNumber: steps.length + 1,
            title: `CÁLCULO DE x${i + 1} - Paso ${i + 1}`,
            description: `Creamos la matriz A${i + 1} sustituyendo la COLUMNA ${i + 1} de A por el vector B:`,
            matrices: [{
                label: `A_{${i + 1}}`,
                matrix: Ai.map(row => row.map(() => 0)),
                customLabels: Ai.map(row => row.map(cell => cell.toLatex()))
            }]
        });

        steps.push({
            stepNumber: steps.length + 1,
            title: `Determinante de A${i + 1}`,
            description: `Calculamos el determinante de la matriz A${i + 1}:`,
            formula: `\\det(A_{${i + 1}}) = ${detAi.toLatex()}`
        });

        solution.push([detAi]);
    }

    steps.push({
        stepNumber: steps.length + 1,
        title: "SOLUCIÓN GENERAL DEL SISTEMA",
        description: "Aplicando la regla de Cramer, obtenemos la solución general:",
        formula: `
      \\begin{cases}
        ${solution.map((row, i) => `x_{${i + 1}} = \\frac{${row[0].toLatex()}}{${detA.toLatex()}}`).join(' \\\\ ')}
      \\end{cases}
    `
    });

    steps.push({
        stepNumber: steps.length + 1,
        title: "SIMPLIFICACIÓN DE LAS SOLUCIONES",
        description: "Simplificando las expresiones:",
    });

    const simplifiedSolution: SymbolicMatrix = [];
    let simplificationShown = false;

    for (let i = 0; i < n; i++) {
        const simplified = trySimplifyFractionBetter(solution[i][0], detA);
        simplifiedSolution.push([simplified]);

        if (!simplified.equals(solution[i][0])) {
            steps.push({
                stepNumber: steps.length + 1,
                title: `Simplificación de x${i + 1}`,
                description: `La solución para x${i + 1} se simplifica:`,
                formula: `x_{${i + 1}} = \\frac{${solution[i][0].toLatex()}}{${detA.toLatex()}} = ${simplified.toLatex()}`
            });
            simplificationShown = true;
        }
    }

    if (!simplificationShown) {
        steps.push({
            stepNumber: steps.length + 1,
            title: "Simplificación de las soluciones",
            description: "Las soluciones no se pueden simplificar más algebraicamente.",
            formula: `\\text{Las fracciones } \\frac{\\det(A_i)}{\\det(A)} \\text{ están en su forma más simple}`
        });
    }

    return {
        solution: simplifiedSolution,
        compatibility: `COMPATIBLE DETERMINADO${criticalValues.length > 0 ? ` (para ${criticalValues.map(cv => `${cv.parameter} ≠ ${cv.value}`).join(' y ')})` : ''}`,
        steps
    };
}

function trySimplifyFractionBetter(
    numerator: SymbolicExpression,
    denominator: SymbolicExpression
): SymbolicExpression {
    try {
        if (numerator.isConstant() && denominator.isConstant()) {
            const numVal = numerator.toNumber();
            const denVal = denominator.toNumber();
            if (Math.abs(denVal) > 1e-10) {
                const result = numVal / denVal;
                if (Number.isInteger(result) || Math.abs(result - Math.round(result)) < 1e-10) {
                    return SymbolicExpression.fromNumber(result);
                }
            }
        }

        const simplified = numerator.divide(denominator);
        if (simplified && !simplified.equals(numerator)) {
            return simplified;
        }

        const commonFactor = findCommonFactor(numerator, denominator);
        if (commonFactor && !(commonFactor.isConstant() && Math.abs(commonFactor.toNumber() - 1) < 1e-10)) {
            const simplifiedNum = numerator.divide(commonFactor);
            const simplifiedDen = denominator.divide(commonFactor);
            if (simplifiedNum && simplifiedDen) {
                if (simplifiedDen.isConstant() && Math.abs(simplifiedDen.toNumber() - 1) < 1e-10) {
                    return simplifiedNum;
                }
                return SymbolicExpression.parse(
                    `\\frac{${simplifiedNum.toLatex()}}{${simplifiedDen.toLatex()}}`
                );
            }
        }

        return SymbolicExpression.parse(
            `\\frac{${numerator.toLatex()}}{${denominator.toLatex()}}`
        );

    } catch (error) {
        return numerator;
    }
}

function findCommonFactor(expr1: SymbolicExpression, expr2: SymbolicExpression): SymbolicExpression | null {
    try {
        const terms1 = expr1.getTerms();
        const terms2 = expr2.getTerms();

        for (const term1 of terms1) {
            for (const term2 of terms2) {
                if (term1.equals(term2)) {
                    return term1;
                }
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}

function solveByGauss(
    A: SymbolicMatrix,
    B: SymbolicMatrix,
    steps: CalculationStep[]
): SymbolicSystemResult {
    const n = A.length;
    const m = A[0].length;

    let augmented: SymbolicMatrix = A.map((row, i) => [...row, B[i][0]]);

    steps.push({
        stepNumber: steps.length + 1,
        title: "APLICANDO ELIMINACIÓN GAUSSIANA",
        description: "Matriz aumentada [A|B] - Iniciando eliminación",
        matrices: [{
            label: "[A|B] inicial",
            matrix: augmented.map(row => row.map(() => 0)),
            customLabels: augmented.map(row => row.map(cell => cell.toLatex()))
        }]
    });

    let currentRow = 0;
    const pivotColumns: number[] = [];
    let stepCount = steps.length + 1;

    for (let col = 0; col < m && currentRow < n; col++) {
        let pivotRow = -1;
        for (let row = currentRow; row < n; row++) {
            if (!augmented[row][col].isZero()) {
                pivotRow = row;
                break;
            }
        }

        if (pivotRow === -1) {
            steps.push({
                stepNumber: stepCount++,
                title: `Columna ${col + 1} sin pivote`,
                description: `Variable x${col + 1} será libre (si el sistema es indeterminado)`,
            });
            continue;
        }

        if (pivotRow !== currentRow) {
            [augmented[currentRow], augmented[pivotRow]] = [augmented[pivotRow], augmented[currentRow]];
        }

        pivotColumns.push(col);
        const pivot = augmented[currentRow][col];

        for (let row = currentRow + 1; row < n; row++) {
            if (!augmented[row][col].isZero()) {
                for (let j = col + 1; j <= m; j++) {
                    const term1 = symbolicMultiply(pivot, augmented[row][j]);
                    const term2 = symbolicMultiply(augmented[row][col], augmented[currentRow][j]);
                    augmented[row][j] = symbolicSubtract(term1, term2);
                }
                augmented[row][col] = SymbolicExpression.fromNumber(0);
            }
        }

        currentRow++;
    }

    steps.push({
        stepNumber: stepCount++,
        title: "MATRIZ ESCALONADA FINAL",
        description: "Fin de la eliminación hacia adelante",
        matrices: [{
            label: "\\text{Forma escalonada}",
            matrix: augmented.map(row => row.map(() => 0)),
            customLabels: augmented.map(row => row.map(cell => cell.toLatex()))
        }]
    });

    const rankA = pivotColumns.length;

    for (let i = rankA; i < n; i++) {
        if (!augmented[i][m].isZero()) {
            let allZero = true;
            for (let j = 0; j < m; j++) {
                if (!augmented[i][j].isZero()) {
                    allZero = false;
                    break;
                }
            }
            if (allZero) {
                steps.push({
                    stepNumber: stepCount++,
                    title: "SISTEMA INCOMPATIBLE",
                    description: `Ecuación inconsistente encontrada: 0 = ${augmented[i][m].toLatex()} ≠ 0`,
                });
                return {
                    solution: null,
                    compatibility: "INCOMPATIBLE",
                    steps
                };
            }
        }
    }

    if (rankA === m) {
        const solution: SymbolicMatrix = Array(m).fill(0).map(() => [SymbolicExpression.fromNumber(0)]);

        steps.push({
            stepNumber: stepCount++,
            title: "SUSTITUCIÓN HACIA ATRÁS",
            description: "Resolviendo el sistema triangular",
        });


        for (let i = rankA - 1; i >= 0; i--) {
            const col = pivotColumns[i];
            let sum = SymbolicExpression.fromNumber(0);

            for (let j = col + 1; j < m; j++) {
                sum = symbolicAdd(sum, symbolicMultiply(augmented[i][j], solution[j][0]));
            }

            const pivot = augmented[i][col];
            const numerator = symbolicSubtract(augmented[i][m], sum);
            solution[col][0] = symbolicDivide(numerator, pivot);

            steps.push({
                stepNumber: stepCount++,
                title: `Variable x${col + 1}`,
                description: `Expresión obtenida:`,
                formula: `x_{${col + 1}} = ${solution[col][0].toLatex()}`
            });
        }

        const solutionText = solution.map((row, i) =>
            `x_{${i + 1}} = ${row[0].toLatex()}`
        ).join('\\\\ ');

        steps.push({
            stepNumber: stepCount++,
            title: "SOLUCIÓN FINAL POR GAUSS",
            description: "Sistema Compatible Determinado",
            formula: `\\begin{cases} ${solutionText} \\end{cases}`
        });

        return {
            solution,
            compatibility: "COMPATIBLE DETERMINADO",
            steps
        };
    } else {
        return solveIndeterminateSystem(augmented, pivotColumns, steps, stepCount);
    }
}

function calculateDeterminant(A: SymbolicMatrix): SymbolicExpression {
    const n = A.length;
    if (n === 2) {
        const [[a, b], [c, d]] = A;
        return symbolicSubtract(symbolicMultiply(a, d), symbolicMultiply(b, c));
    } else if (n === 3) {
        const [[a, b, c], [d, e, f], [g, h, i]] = A;
        const aei = symbolicMultiply(a, symbolicMultiply(e, i));
        const bfg = symbolicMultiply(b, symbolicMultiply(f, g));
        const cdh = symbolicMultiply(c, symbolicMultiply(d, h));
        const ceg = symbolicMultiply(c, symbolicMultiply(e, g));
        const bdi = symbolicMultiply(b, symbolicMultiply(d, i));
        const afh = symbolicMultiply(a, symbolicMultiply(f, h));

        return symbolicSubtract(
            symbolicAdd(symbolicAdd(aei, bfg), cdh),
            symbolicAdd(symbolicAdd(ceg, bdi), afh)
        );
    }
    return SymbolicExpression.fromNumber(0);
}

function solveIndeterminateSystem(
    augmented: SymbolicMatrix,
    pivotColumns: number[],
    steps: CalculationStep[],
    stepCount: number
): SymbolicSystemResult {
    const n = augmented.length;
    const m = augmented[0].length - 1;

    const freeVars: number[] = [];
    for (let i = 0; i < m; i++) {
        if (!pivotColumns.includes(i)) {
            freeVars.push(i);
        }
    }

    steps.push({
        stepNumber: stepCount++,
        title: "SISTEMA COMPATIBLE INDETERMINADO",
        description: `Infinitas soluciones - ${freeVars.length} grado(s) de libertad`,
        formula: `\\text{Variables libres: } ${freeVars.map(v => `x_{${v + 1}}`).join(', ')}`
    });

    steps.push({
        stepNumber: stepCount++,
        title: "BUSCANDO SOLUCIÓN PARTICULAR",
        description: "Asignando valores a las variables libres para encontrar una solución particular",
    });

    const particularSolution: SymbolicMatrix = Array(m).fill(0).map(() => [SymbolicExpression.fromNumber(0)]);

    for (const freeVar of freeVars) {
        particularSolution[freeVar][0] = SymbolicExpression.fromNumber(0);
    }

    for (let i = pivotColumns.length - 1; i >= 0; i--) {
        const col = pivotColumns[i];
        let sum = SymbolicExpression.fromNumber(0);

        for (let j = col + 1; j < m; j++) {
            sum = symbolicAdd(sum, symbolicMultiply(augmented[i][j], particularSolution[j][0]));
        }

        const pivot = augmented[i][col];
        const numerator = symbolicSubtract(augmented[i][m], sum);
        particularSolution[col][0] = symbolicDivide(numerator, pivot);
    }

    steps.push({
        stepNumber: stepCount++,
        title: "SOLUCIÓN PARTICULAR ENCONTRADA",
        description: "Asignando 0 a las variables libres:",
        formula: `\\text{Particular: } ${particularSolution.map((row, i) => `x_{${i + 1}} = ${row[0].toLatex()}`).join('\\\\ ')}`
    });

    steps.push({
        stepNumber: stepCount++,
        title: "BASE DEL SISTEMA HOMOGÉNEO",
        description: `Encontrando ${freeVars.length} vector(es) para el espacio solución`,
    });

    const homogeneousBasis: SymbolicMatrix[] = [];

    for (const freeVar of freeVars) {
        const basisVector: SymbolicMatrix = Array(m).fill(0).map(() => [SymbolicExpression.fromNumber(0)]);

        for (const fv of freeVars) {
            basisVector[fv][0] = SymbolicExpression.fromNumber(fv === freeVar ? 1 : 0);
        }

        for (let i = pivotColumns.length - 1; i >= 0; i--) {
            const col = pivotColumns[i];
            let sum = SymbolicExpression.fromNumber(0);

            for (let j = col + 1; j < m; j++) {
                sum = symbolicAdd(sum, symbolicMultiply(augmented[i][j], basisVector[j][0]));
            }

            const pivot = augmented[i][col];
            const homogeneousNumerator = symbolicMultiply(SymbolicExpression.fromNumber(-1), sum);
            basisVector[col][0] = symbolicDivide(homogeneousNumerator, pivot);
        }

        homogeneousBasis.push(basisVector);

        steps.push({
            stepNumber: stepCount++,
            title: `Vector de la base para x${freeVar + 1}`,
            description: `Solución del sistema homogéneo cuando x${freeVar + 1} = 1:`,
            formula: `\\mathbf{v}_{${freeVar + 1}} = \\begin{pmatrix} ${basisVector.map(row => row[0].toLatex()).join('\\\\ ')} \\end{pmatrix}`
        });
    }

    const parametricForm = `\\mathbf{x} = \\begin{pmatrix} ${particularSolution.map(row => row[0].toLatex()).join('\\\\ ')} \\end{pmatrix} + ${freeVars.map((fv, idx) => `t_{${idx + 1}} \\begin{pmatrix} ${homogeneousBasis[idx].map(row => row[0].toLatex()).join('\\\\ ')} \\end{pmatrix}`).join(' + ')}`;

    steps.push({
        stepNumber: stepCount++,
        title: "SOLUCIÓN GENERAL PARAMÉTRICA",
        description: "La solución completa del sistema:",
        formula: parametricForm
    });

    return {
        solution: null,
        compatibility: "COMPATIBLE INDETERMINADO",
        steps,
        parametricSolution: {
            particularSolution,
            homogeneousBasis,
            freeVariables: freeVars,
            degreesOfFreedom: freeVars.length,
            parametricForm
        }
    };
}