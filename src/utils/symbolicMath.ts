export type SymbolicValue = number | SymbolicExpression;

export interface SymbolicTerm {
    coefficient: number;
    variables: Record<string, number>;
}

export class SymbolicExpression {
    terms: SymbolicTerm[];

    constructor(terms: SymbolicTerm[] = []) {
        this.terms = this.simplifyTerms(terms);
    }

    static fromNumber(n: number): SymbolicExpression {
        return new SymbolicExpression([{ coefficient: n, variables: {} }]);
    }

    static fromVariable(name: string, coefficient = 1): SymbolicExpression {
        return new SymbolicExpression([{ coefficient, variables: { [name]: 1 } }]);
    }

    static parse(str: string): SymbolicExpression {
        str = str.trim();

        if (!str || str === "-" || str === ".") {
            return SymbolicExpression.fromNumber(0);
        }

        const numMatch = /^-?\d*\.?\d+$/.test(str);
        if (numMatch) {
            return SymbolicExpression.fromNumber(parseFloat(str));
        }

        if (/^[a-zA-Z]\w*$/.test(str)) {
            return SymbolicExpression.fromVariable(str, 1);
        }

        if (/^-[a-zA-Z]\w*$/.test(str)) {
            return SymbolicExpression.fromVariable(str.substring(1), -1);
        }

        const coefMatch = str.match(/^(-?)(\d*\.?\d*)([a-zA-Z]\w*)$/);
        if (coefMatch) {
            const [_, sign, numStr, variable] = coefMatch;
            let num = numStr === '' || numStr === '.' ? 1 : parseFloat(numStr);
            if (sign === '-') num = -num;
            return SymbolicExpression.fromVariable(variable, num);
        }

        const explicitMultMatch = str.match(/^(-?)(\d*\.?\d*)\s*\*\s*([a-zA-Z]\w*)$/);
        if (explicitMultMatch) {
            const [_, sign, numStr, variable] = explicitMultMatch;
            let num = numStr === '' ? 1 : parseFloat(numStr);
            if (sign === '-') num = -num;
            return SymbolicExpression.fromVariable(variable, num);
        }

        const terms: SymbolicTerm[] = [];
        const parts = str.split(/([+-])/).filter(p => p.trim());

        let currentSign = 1;
        for (const part of parts) {
            if (part === '+') {
                currentSign = 1;
            } else if (part === '-') {
                currentSign = -1;
            } else {
                const trimmed = part.trim();
                if (/^\d*\.?\d+$/.test(trimmed)) {
                    terms.push({ coefficient: currentSign * parseFloat(trimmed), variables: {} });
                } else if (/^[a-zA-Z]\w*$/.test(trimmed)) {
                    terms.push({ coefficient: currentSign, variables: { [trimmed]: 1 } });
                } else {
                    const match = trimmed.match(/^(\d*\.?\d*)([a-zA-Z]\w*)$/);
                    if (match) {
                        const [_, numStr, variable] = match;
                        const num = numStr === '' ? 1 : parseFloat(numStr);
                        terms.push({ coefficient: currentSign * num, variables: { [variable]: 1 } });
                    }
                }
            }
        }

        return new SymbolicExpression(terms);
    }

    private simplifyTerms(terms: SymbolicTerm[]): SymbolicTerm[] {
        const grouped = new Map<string, number>();

        for (const term of terms) {
            const key = this.getTermKey(term.variables);
            const current = grouped.get(key) || 0;
            grouped.set(key, current + term.coefficient);
        }

        const result: SymbolicTerm[] = [];
        for (const [key, coefficient] of grouped.entries()) {
            if (Math.abs(coefficient) > 1e-10) {
                const variables = this.parseTermKey(key);
                result.push({ coefficient, variables });
            }
        }

        return result.sort((a, b) => {
            const aVars = Object.keys(a.variables).length;
            const bVars = Object.keys(b.variables).length;
            if (aVars !== bVars) return bVars - aVars;
            return 0;
        });
    }

    private getTermKey(variables: Record<string, number>): string {
        const entries = Object.entries(variables).sort(([a], [b]) => a.localeCompare(b));
        return entries.map(([v, p]) => `${v}^${p}`).join('*') || '1';
    }

    private parseTermKey(key: string): Record<string, number> {
        if (key === '1') return {};
        const variables: Record<string, number> = {};
        const parts = key.split('*');
        for (const part of parts) {
            const [v, p] = part.split('^');
            variables[v] = parseInt(p);
        }
        return variables;
    }

    add(other: SymbolicExpression): SymbolicExpression {
        return new SymbolicExpression([...this.terms, ...other.terms]);
    }

    subtract(other: SymbolicExpression): SymbolicExpression {
        const negatedTerms = other.terms.map(t => ({
            coefficient: -t.coefficient,
            variables: { ...t.variables }
        }));
        return new SymbolicExpression([...this.terms, ...negatedTerms]);
    }

    multiply(other: SymbolicExpression): SymbolicExpression {
        const newTerms: SymbolicTerm[] = [];

        for (const t1 of this.terms) {
            for (const t2 of other.terms) {
                const newCoef = t1.coefficient * t2.coefficient;
                const newVars = { ...t1.variables };

                for (const [v, p] of Object.entries(t2.variables)) {
                    newVars[v] = (newVars[v] || 0) + p;
                }

                newTerms.push({ coefficient: newCoef, variables: newVars });
            }
        }

        return new SymbolicExpression(newTerms);
    }

    divide(divisor: SymbolicExpression): SymbolicExpression {
        if (divisor.isConstant()) {
            const constant = divisor.toNumber();
            if (Math.abs(constant) < 1e-10) {
                throw new Error("División por cero");
            }
            const newTerms = this.terms.map(t => ({
                coefficient: t.coefficient / constant,
                variables: { ...t.variables }
            }));
            return new SymbolicExpression(newTerms);
        }

        return this.multiply(divisor.reciprocal());
    }

    reciprocal(): SymbolicExpression {
        if (this.isConstant()) {
            const constant = this.toNumber();
            if (Math.abs(constant) < 1e-10) {
                throw new Error("División por cero");
            }
            return SymbolicExpression.fromNumber(1 / constant);
        }

        return SymbolicExpression.fromNumber(1);
    }

    equals(other: SymbolicExpression): boolean {
        if (this.terms.length !== other.terms.length) {
            return false;
        }

        const thisSorted = [...this.terms].sort((a, b) =>
            this.getTermKey(a.variables).localeCompare(this.getTermKey(b.variables))
        );
        const otherSorted = [...other.terms].sort((a, b) =>
            this.getTermKey(a.variables).localeCompare(this.getTermKey(b.variables))
        );

        for (let i = 0; i < thisSorted.length; i++) {
            const t1 = thisSorted[i];
            const t2 = otherSorted[i];

            if (Math.abs(t1.coefficient - t2.coefficient) > 1e-10) {
                return false;
            }

            const key1 = this.getTermKey(t1.variables);
            const key2 = this.getTermKey(t2.variables);
            if (key1 !== key2) {
                return false;
            }
        }

        return true;
    }

    isNumeric(): boolean {
        return this.terms.every(term => Object.keys(term.variables).length === 0);
    }

    negate(): SymbolicExpression {
        return new SymbolicExpression(
            this.terms.map(t => ({ coefficient: -t.coefficient, variables: { ...t.variables } }))
        );
    }

    isZero(): boolean {
        return this.terms.length === 0 || this.terms.every(t => Math.abs(t.coefficient) < 1e-10);
    }

    isConstant(): boolean {
        return this.terms.length === 0 ||
            (this.terms.length === 1 && Object.keys(this.terms[0].variables).length === 0);
    }

    toNumber(): number {
        if (!this.isConstant()) {
            throw new Error("No se puede convertir expresión simbólica a número");
        }
        return this.terms.length === 0 ? 0 : this.terms[0].coefficient;
    }

    toString(): string {
        if (this.terms.length === 0) return "0";

        const parts: string[] = [];

        for (let i = 0; i < this.terms.length; i++) {
            const term = this.terms[i];
            const vars = Object.entries(term.variables)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([v, p]) => p === 1 ? v : `${v}^${p}`)
                .join('');

            const absCoef = Math.abs(term.coefficient);
            const sign = term.coefficient < 0 ? '-' : '+';

            let termStr = '';
            if (vars === '') {
                termStr = absCoef.toString();
            } else if (Math.abs(absCoef - 1) < 1e-10) {
                termStr = vars;
            } else {
                termStr = `${absCoef}${vars}`;
            }

            if (i === 0) {
                parts.push(term.coefficient < 0 ? `-${termStr}` : termStr);
            } else {
                parts.push(` ${sign} ${termStr}`);
            }
        }

        return parts.join('');
    }

    getVariables(): string[] {
        const vars = new Set<string>();
        for (const term of this.terms) {
            for (const v of Object.keys(term.variables)) {
                vars.add(v);
            }
        }
        return Array.from(vars);
    }

    isPolynomial(): boolean {
        return this.getVariables().length === 1;
    }

    solveFor(variable: string): SymbolicExpression[] {
        const degreeMap: Record<number, number> = {};
        for (const term of this.terms) {
            const exp = term.variables[variable] || 0;
            degreeMap[exp] = (degreeMap[exp] || 0) + term.coefficient;
        }

        const a = degreeMap[2] || 0;
        const b = degreeMap[1] || 0;
        const c = degreeMap[0] || 0;

        if (a !== 0) {
            const discriminant = b * b - 4 * a * c;
            if (discriminant < 0) return [];
            const sqrtD = Math.sqrt(discriminant);
            return [
                SymbolicExpression.fromNumber((-b + sqrtD) / (2 * a)),
                SymbolicExpression.fromNumber((-b - sqrtD) / (2 * a))
            ];
        } else if (b !== 0) {
            return [SymbolicExpression.fromNumber(-c / b)];
        }

        return [];
    }

    expand(): SymbolicExpression {
        return new SymbolicExpression([...this.terms]);
    }

    isOne(): boolean {
        return this.isConstant() && Math.abs(this.toNumber() - 1) < 1e-10;
    }

    toLatex(): string {
        if (this.terms.length === 0) return "0";

        const parts: string[] = [];

        for (let i = 0; i < this.terms.length; i++) {
            const term = this.terms[i];
            const vars = Object.entries(term.variables)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([v, p]) => p === 1 ? v : `${v}^{${p}}`)
                .join('');

            const absCoef = Math.abs(term.coefficient);
            const sign = term.coefficient < 0 ? '-' : '+';

            let termStr = '';
            if (vars === '') {
                termStr = absCoef.toString();
            } else if (Math.abs(absCoef - 1) < 1e-10) {
                termStr = vars;
            } else {
                const coefStr = Number.isInteger(absCoef) ? absCoef.toString() : absCoef.toFixed(2);
                termStr = `${coefStr}${vars}`;
            }

            if (i === 0) {
                parts.push(term.coefficient < 0 ? `-${termStr}` : termStr);
            } else {
                parts.push(` ${sign} ${termStr}`);
            }
        }

        return parts.join('');
    }
}

export function symbolicAdd(a: SymbolicValue, b: SymbolicValue): SymbolicExpression {
    const aExpr = typeof a === 'number' ? SymbolicExpression.fromNumber(a) : a;
    const bExpr = typeof b === 'number' ? SymbolicExpression.fromNumber(b) : b;
    return aExpr.add(bExpr);
}

export function symbolicSubtract(a: SymbolicValue, b: SymbolicValue): SymbolicExpression {
    const aExpr = typeof a === 'number' ? SymbolicExpression.fromNumber(a) : a;
    const bExpr = typeof b === 'number' ? SymbolicExpression.fromNumber(b) : b;
    return aExpr.subtract(bExpr);
}

export function symbolicMultiply(a: SymbolicValue, b: SymbolicValue): SymbolicExpression {
    const aExpr = typeof a === 'number' ? SymbolicExpression.fromNumber(a) : a;
    const bExpr = typeof b === 'number' ? SymbolicExpression.fromNumber(b) : b;
    return aExpr.multiply(bExpr);
}

export function symbolicDivide(a: SymbolicValue, b: SymbolicValue): SymbolicExpression {
    const aExpr = typeof a === 'number' ? SymbolicExpression.fromNumber(a) : a;
    const bExpr = typeof b === 'number' ? SymbolicExpression.fromNumber(b) : b;
    return aExpr.divide(bExpr);
}
