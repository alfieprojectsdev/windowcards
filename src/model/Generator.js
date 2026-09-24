import { RuleEngine } from './RuleEngine.js';
import { LIMITS } from './State.js';

// word: label on the operation tile; spoken: used in screen-reader labels ("47 plus 38")
export const OPERATOR_MAP = {
    '+': { symbol: '+', title: 'Addition', word: 'Add', spoken: 'plus', op: (a, b) => a + b },
    '-': { symbol: '−', title: 'Subtraction', word: 'Subtract', spoken: 'minus', op: (a, b) => a - b },
    '×': { symbol: '×', title: 'Multiplication', word: 'Multiply', spoken: 'times', op: (a, b) => a * b },
    '÷': { symbol: '÷', title: 'Division', word: 'Divide', spoken: 'divided by', op: (a, b) => a / b },
};

const MAX_ATTEMPTS = 1000;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function digitRange(digits) {
    return [digits > 1 ? 10 ** (digits - 1) : 0, 10 ** digits - 1];
}

function generateNumber(digits) {
    return randomInt(...digitRange(digits));
}

/**
 * Division is built backwards from divisor × quotient so it never has a remainder.
 * The dividend has exactly `digits` digits (it is the number the title refers to),
 * the divisor has at most ceil(digits / 2) digits, and divisor and quotient are both >= 2.
 * Returns null when the chosen divisor leaves no valid quotient; the caller retries.
 */
function generateDivision(digits) {
    const [minA, maxA] = digitRange(digits);
    const b = randomInt(2, 10 ** Math.ceil(digits / 2) - 1);
    const minQuotient = Math.max(2, Math.ceil(minA / b));
    const maxQuotient = Math.floor(maxA / b);
    if (minQuotient > maxQuotient) return null;
    return { a: randomInt(minQuotient, maxQuotient) * b, b };
}

function generateOperands(digits, operator) {
    if (operator === '÷') return generateDivision(digits);

    const a = generateNumber(digits);
    const b = generateNumber(digits);
    // Subtraction: put the larger number on top so results are never negative
    if (operator === '-') return { a: Math.max(a, b), b: Math.min(a, b) };
    return { a, b };
}

export function buildASTFromSettings(settings) {
    const { operator, avoidCarrying, avoidBorrowing, customRules } = settings;
    let rules = [];

    // Base rules for all problems
    rules.push({ type: "EQUALS", field: "op", value: operator });

    if (operator === '+') {
        if (avoidCarrying) rules.push({ type: "NO_CARRY" });
    } else if (operator === '-') {
        // Operand A must be >= Operand B to ensure a positive result
        rules.push({ type: "GREATER_THAN_OR_EQUAL", field: "a", fieldRef: "b" });
        if (avoidBorrowing) rules.push({ type: "NO_BORROW" });
    } else if (operator === '÷') {
        // No remainders, divisor > 1, dividend != divisor
        rules.push({ type: "NO_REMAINDER" });
        rules.push({ type: "GREATER_THAN", field: "b", value: 1 });
        rules.push({ type: "NOT_EQUALS", field: "a", fieldRef: "b" });
    }

    if (customRules) {
        rules.push(customRules);
    }

    if (rules.length === 0) return null;
    if (rules.length === 1) return rules[0];

    // Combine rules with AND
    let combined = rules[0];
    for (let i = 1; i < rules.length; i++) {
        combined = {
            type: "AND",
            left: combined,
            right: rules[i]
        };
    }
    return combined;
}

export function generateValidProblem(digits, activeRulesAST, operator) {
    const [minDigits, maxDigits] = LIMITS.numDigits;
    if (!Number.isInteger(digits) || digits < minDigits || digits > maxDigits) {
        throw new RangeError(`Digits must be a whole number from ${minDigits} to ${maxDigits}; got ${digits}.`);
    }
    const opInfo = OPERATOR_MAP[operator];
    if (!opInfo) throw new RangeError(`Unknown operator: ${operator}`);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const operands = generateOperands(digits, operator);
        if (!operands) continue;

        const { a, b } = operands;
        // The result is computed before validation so custom rules can test it
        const context = {
            a, b,
            op: operator,
            result: opInfo.op(a, b),
            digits_a: String(a).length,
            digits_b: String(b).length
        };

        if (RuleEngine.evaluate(activeRulesAST, context)) {
            return { num1: a, num2: b, result: context.result };
        }
    }

    // Caught by the UI instead of looping forever or returning an invalid problem
    throw new Error(`Constraints are too strict; cannot generate valid problem after ${MAX_ATTEMPTS} attempts.`);
}

/**
 * Smallest and largest answer seen in a sample of problems with no custom rules.
 * Used to tell the teacher what range a "too strict" rule has to fit in.
 */
export function answerRange(digits, operator, samples = 400) {
    const { op } = OPERATOR_MAP[operator];
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < samples; i++) {
        const operands = generateOperands(digits, operator);
        if (!operands) continue;
        const result = op(operands.a, operands.b);
        min = Math.min(min, result);
        max = Math.max(max, result);
    }
    return [min, max];
}

export function generateProblemSet(count, settings) {
    const { numDigits, operator } = settings;
    const activeRulesAST = buildASTFromSettings(settings);
    const problems = [];

    for (let i = 0; i < count; i++) {
        const problem = generateValidProblem(numDigits, activeRulesAST, operator);
        problems.push(problem);
    }

    return problems;
}
