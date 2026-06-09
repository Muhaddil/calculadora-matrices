import { CalculationStep } from "@/components/StepDisplay";
import { SymbolicExpression, symbolicMultiply, symbolicAdd, symbolicSubtract, symbolicDivide } from "./symbolicMath";
import { SymbolicMatrix, parseSymbolicMatrix } from "./symbolicMatrixOperations";
import { create, all, MathJsInstance } from 'mathjs';
import i18n from "@/i18n/config";

const t = (key: string, params?: Record<string, any>) => {
  return i18n.t(key, params);
};

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
            title: t("symbolicSystemOperations.originalSystemTitle"),
            description: t("symbolicSystemOperations.originalSystemDescription", { n, m, method: method.toUpperCase() }),
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
            title: t("symbolicSystemOperations.equationsTitle"),
            description: t("symbolicSystemOperations.equationsDescription"),
            formula: `\\begin{cases} ${equations} \\end{cases}`
        });

        const hasParameters = checkForParameters(symbolicA, symbolicB);

        if (hasParameters) {
            steps.push({
                stepNumber: 3,
                title: t("symbolicSystemOperations.parametricDetectedTitle"),
                description: t("symbolicSystemOperations.parametricDetectedDescription"),
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
            compatibility: t("symbolicSystemOperations.errorInCalc", { message: error instanceof Error ? error.message : t("symbolicSystemOperations.errorUnknown") }),
            steps: [...steps, {
                stepNumber: steps.length + 1,
                title: t("symbolicSystemOperations.errorCalcTitle"),
                description: t("symbolicSystemOperations.errorCalcDescription"),
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
            title: t("symbolicSystemOperations.determinantCalcTitle"),
            description: t("symbolicSystemOperations.determinantCalcDescription"),
            formula: `\\det(A) = ${det.toLatex()}`
        });

        const criticalValues = solveCriticalValues(det);

        if (criticalValues.length > 0) {
            steps.push({
                stepNumber: steps.length + 1,
                title: t("symbolicSystemOperations.criticalValuesTitle"),
                description: t("symbolicSystemOperations.criticalValuesDescription"),
                formula: criticalValues.map(val => val.condition).join(', ')
            });

            const specialCases: SymbolicSpecialCase[] = [];

            let generalResult: SymbolicSystemResult;
            if (method === 'cramer') {
                generalResult = solveByCramer(A, B, [...steps]);
            } else {
                generalResult = solveByGauss(A, B, [...steps]);
            }

            generalResult.compatibility = t("symbolicSystemOperations.compatibleDeterminedGeneral");

            for (const critical of criticalValues) {
                const caseSteps: CalculationStep[] = [{
                    stepNumber: 1,
                    title: t("symbolicSystemOperations.caseSpecialTitle", { condition: critical.condition }),
                    description: t("symbolicSystemOperations.caseSpecialDescription", { condition: critical.condition }),
                    formula: t("symbolicSystemOperations.substitutingFormula", { condition: critical.condition })
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
                        title: t("symbolicSystemOperations.substitutedSystemTitle"),
                        description: t("symbolicSystemOperations.substitutedSystemDescription", { condition: critical.condition }),
                        formula: `\\begin{cases} ${substitutedEquations} \\end{cases}`
                    });

                    const specialResult = solveByGauss(substitutedA, substitutedB, caseSteps);
                    specialResult.compatibility = `${t("symbolicSystemOperations.caseSpecialTitle", { condition: critical.condition })} - ${specialResult.compatibility}`;

                    specialCases.push({
                        condition: critical.condition,
                        solution: specialResult
                    });
                } catch (error) {
                    caseSteps.push({
                        stepNumber: 2,
                        title: t("symbolicSystemOperations.substitutionErrorTitle"),
                        description: t("symbolicSystemOperations.substitutionErrorDescription", { condition: critical.condition }),
                    });

                    specialCases.push({
                        condition: critical.condition,
                        solution: {
                            solution: null,
                            compatibility: t("symbolicSystemOperations.errorSubstitution"),
                            steps: caseSteps
                        }
                    });
                }
            }

            if (specialCases.length > 0) {
                steps.push({
                    stepNumber: steps.length + 1,
                    title: t("symbolicSystemOperations.casesIdentifiedTitle"),
                    description: t("symbolicSystemOperations.casesIdentifiedDescription", { count: specialCases.length }),
                    formula: specialCases.map((sc, i) => `\\text{${t("symbolicSystemOperations.caseNumber", { i: i + 1 })}: } ${sc.condition}`).join('\\\\')
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
            title: t("symbolicSystemOperations.cramerNotApplicableTitle"),
            description: t("symbolicSystemOperations.cramerNotApplicableDescription"),
        });
        return solveByGauss(A, B, steps);
    }

    steps.push({
        stepNumber: steps.length + 1,
        title: t("symbolicSystemOperations.applyingCramerTitle"),
        description: t("symbolicSystemOperations.applyingCramerDescription"),
    });

    const detA = calculateDeterminant(A);

    steps.push({
        stepNumber: steps.length + 1,
        title: t("symbolicSystemOperations.mainDeterminantTitle"),
        description: t("symbolicSystemOperations.mainDeterminantDescription"),
        formula: `\\det(A) = ${detA.toLatex()}`
    });

    const criticalValues = solveCriticalValues(detA);

    if (criticalValues.length > 0) {
        const specialCases: SymbolicSpecialCase[] = [];

        for (const critical of criticalValues) {
            const caseSteps: CalculationStep[] = [{
                    stepNumber: 1,
                    title: t("symbolicSystemOperations.caseSpecialTitle", { condition: critical.condition }),
                    description: t("symbolicSystemOperations.caseSpecialDescription", { condition: critical.condition }),
                    formula: t("symbolicSystemOperations.substitutingFormula", { condition: critical.condition })
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
                    title: t("symbolicSystemOperations.substitutedSystemTitle"),
                    description: t("symbolicSystemOperations.substitutedSystemDescription", { condition: critical.condition }),
                    formula: `\\begin{cases} ${substitutedEquations} \\end{cases}`
                });

                const specialResult = solveByGauss(substitutedA, substitutedB, caseSteps);
                specialResult.compatibility = `${t("symbolicSystemOperations.caseSpecialTitle", { condition: critical.condition })} - ${specialResult.compatibility}`;

                specialCases.push({
                    condition: critical.condition,
                    solution: specialResult
                });
            } catch (error) {
                caseSteps.push({
                    stepNumber: 2,
                    title: t("symbolicSystemOperations.substitutionErrorTitle"),
                    description: t("symbolicSystemOperations.substitutionErrorDescription", { condition: critical.condition }),
                });

                specialCases.push({
                    condition: critical.condition,
                    solution: {
                        solution: null,
                        compatibility: t("symbolicSystemOperations.errorSubstitution"),
                        steps: caseSteps
                    }
                });
            }
        }

        if (detA.isZero()) {
            steps.push({
                stepNumber: steps.length + 1,
                title: t("symbolicSystemOperations.singularSystemTitle"),
                description: t("symbolicSystemOperations.singularSystemDescription"),
            });

            return {
                solution: null,
                compatibility: t("symbolicSystemOperations.singularSeeCases"),
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
            title: t("symbolicSystemOperations.singularNotApplicableTitle"),
            description: t("symbolicSystemOperations.singularNotApplicableDescription"),
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
        title: t("symbolicSystemOperations.cramerRuleTitle"),
        description: t("symbolicSystemOperations.cramerRuleDescription"),
        formula: t("symbolicSystemOperations.cramerFormula")
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
            title: t("symbolicSystemOperations.calculatingXTitle", { i: i + 1, step: i + 1 }),
            description: t("symbolicSystemOperations.calculatingXDescription", { i: i + 1, col: i + 1 }),
            matrices: [{
                label: `A_{${i + 1}}`,
                matrix: Ai.map(row => row.map(() => 0)),
                customLabels: Ai.map(row => row.map(cell => cell.toLatex()))
            }]
        });

        steps.push({
            stepNumber: steps.length + 1,
            title: t("symbolicSystemOperations.detAiTitle", { i: i + 1 }),
            description: t("symbolicSystemOperations.detAiDescription", { i: i + 1 }),
            formula: `\\det(A_{${i + 1}}) = ${detAi.toLatex()}`
        });

        solution.push([detAi]);
    }

    steps.push({
        stepNumber: steps.length + 1,
        title: t("symbolicSystemOperations.generalSolutionTitle"),
        description: t("symbolicSystemOperations.generalSolutionDescription"),
        formula: `
      \\begin{cases}
        ${solution.map((row, i) => `x_{${i + 1}} = \\frac{${row[0].toLatex()}}{${detA.toLatex()}}`).join(' \\\\ ')}
      \\end{cases}
    `
    });

    steps.push({
        stepNumber: steps.length + 1,
        title: t("symbolicSystemOperations.simplificationTitle"),
        description: t("symbolicSystemOperations.simplificationDescription"),
    });

    const simplifiedSolution: SymbolicMatrix = [];
    let simplificationShown = false;

    for (let i = 0; i < n; i++) {
        const simplified = trySimplifyFractionBetter(solution[i][0], detA);
        simplifiedSolution.push([simplified]);

        if (!simplified.equals(solution[i][0])) {
            steps.push({
                stepNumber: steps.length + 1,
                title: t("symbolicSystemOperations.simplifyXiTitle", { i: i + 1 }),
                description: t("symbolicSystemOperations.simplifyXiDescription", { i: i + 1 }),
                formula: `x_{${i + 1}} = \\frac{${solution[i][0].toLatex()}}{${detA.toLatex()}} = ${simplified.toLatex()}`
            });
            simplificationShown = true;
        }
    }

    if (!simplificationShown) {
        steps.push({
            stepNumber: steps.length + 1,
            title: t("symbolicSystemOperations.noSimplifyTitle"),
            description: t("symbolicSystemOperations.noSimplifyDescription"),
            formula: t("symbolicSystemOperations.noSimplifyFormula")
        });
    }

    return {
        solution: simplifiedSolution,
        compatibility: criticalValues.length > 0
            ? t("symbolicSystemOperations.compatibleDeterminedCritical", { conditions: criticalValues.map(cv => `${cv.parameter} ≠ ${cv.value}`).join(' y ') })
            : t("symbolicSystemOperations.compatibleDeterminedGeneral"),
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
        title: t("symbolicSystemOperations.gaussApplyingTitle"),
        description: t("symbolicSystemOperations.gaussApplyingDescription"),
        matrices: [{
            label: "[A|B]",
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
                title: t("symbolicSystemOperations.columnNoPivotTitle", { col: col + 1 }),
                description: t("symbolicSystemOperations.columnNoPivotDescription", { col: col + 1 }),
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
        title: t("symbolicSystemOperations.echelonMatrixTitle"),
        description: t("symbolicSystemOperations.echelonMatrixDescription"),
        matrices: [{
            label: "\\text{" + t("symbolicSystemOperations.echelonMatrixTitle") + "}",
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
                    title: t("symbolicSystemOperations.incompatibleTitle"),
                    description: t("symbolicSystemOperations.incompatibleDescription", { value: augmented[i][m].toLatex() }),
                });
                return {
                    solution: null,
                    compatibility: t("matrixOperations.incompatible"),
                    steps
                };
            }
        }
    }

    if (rankA === m) {
        const solution: SymbolicMatrix = Array(m).fill(0).map(() => [SymbolicExpression.fromNumber(0)]);

        steps.push({
            stepNumber: stepCount++,
            title: t("symbolicSystemOperations.backSubstitutionTitle"),
            description: t("symbolicSystemOperations.backSubstitutionDescription"),
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
                title: t("symbolicSystemOperations.variableXiTitle", { i: col + 1 }),
                description: t("symbolicSystemOperations.variableXiDescription"),
                formula: `x_{${col + 1}} = ${solution[col][0].toLatex()}`
            });
        }

        const solutionText = solution.map((row, i) =>
            `x_{${i + 1}} = ${row[0].toLatex()}`
        ).join('\\\\ ');

        steps.push({
            stepNumber: stepCount++,
            title: t("symbolicSystemOperations.gaussSolutionTitle"),
            description: t("symbolicSystemOperations.gaussSolutionDescription"),
            formula: `\\begin{cases} ${solutionText} \\end{cases}`
        });

        return {
            solution,
            compatibility: t("matrixOperations.compatibleDetermined"),
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
        title: t("symbolicSystemOperations.indeterminateTitle"),
        description: t("symbolicSystemOperations.indeterminateDescription", { count: freeVars.length }),
        formula: t("symbolicSystemOperations.indeterminateFreeVars", { vars: freeVars.map(v => `x_{${v + 1}}`).join(', ') })
    });

    steps.push({
        stepNumber: stepCount++,
        title: t("symbolicSystemOperations.searchParticularTitle"),
        description: t("symbolicSystemOperations.searchParticularDescription"),
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
        title: t("symbolicSystemOperations.particularFoundTitle"),
        description: t("symbolicSystemOperations.particularFoundDescription"),
        formula: t("symbolicSystemOperations.particularFoundFormula", { solution: particularSolution.map((row, i) => `x_{${i + 1}} = ${row[0].toLatex()}`).join('\\\\ ') })
    });

    steps.push({
        stepNumber: stepCount++,
        title: t("symbolicSystemOperations.homogeneousBaseTitle"),
        description: t("symbolicSystemOperations.homogeneousBaseDescription", { count: freeVars.length }),
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
            title: t("symbolicSystemOperations.basisVectorTitle", { i: freeVar + 1 }),
            description: t("symbolicSystemOperations.basisVectorDescription", { i: freeVar + 1 }),
            formula: t("symbolicSystemOperations.basisVectorFormula", { i: freeVar + 1, vector: basisVector.map(row => row[0].toLatex()).join('\\\\ ') })
        });
    }

    const parametricForm = `\\mathbf{x} = \\begin{pmatrix} ${particularSolution.map(row => row[0].toLatex()).join('\\\\ ')} \\end{pmatrix} + ${freeVars.map((fv, idx) => `t_{${idx + 1}} \\begin{pmatrix} ${homogeneousBasis[idx].map(row => row[0].toLatex()).join('\\\\ ')} \\end{pmatrix}`).join(' + ')}`;

    steps.push({
        stepNumber: stepCount++,
        title: t("symbolicSystemOperations.parametricFormTitle"),
        description: t("symbolicSystemOperations.parametricFormDescription"),
        formula: parametricForm
    });

    return {
        solution: null,
        compatibility: t("matrixOperations.compatibleIndeterminate"),
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