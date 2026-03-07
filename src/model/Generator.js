import { RuleEngine } from './RuleEngine.js';

export const OPERATOR_MAP = {
    '+': { symbol: '+', title: 'Addition', op: (a, b) => a + b },
    '-': { symbol: '−', title: 'Subtraction', op: (a, b) => a - b },
    '×': { symbol: '×', title: 'Multiplication', op: (a, b) => a * b },
    '÷': { symbol: '÷', title: 'Division', op: (a, b) => a / b },
};

function generateNumber(digits) {
    const max = Math.pow(10, digits) - 1;
    const min = digits > 1 ? Math.pow(10, digits - 1) : 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function buildASTFromSettings(settings) {
    const { operator, avoidCarrying, avoidBorrowing } = settings;
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
        // No remainders, divisor > 1, dividend != divisor, quotient <= max digits
        rules.push({ type: "NO_REMAINDER" });
        rules.push({ type: "GREATER_THAN", field: "b", value: 1 });
        rules.push({ type: "NOT_EQUALS", field: "a", fieldRef: "b" });
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
    let candidateContext;
    let isValid = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;
    const opInfo = OPERATOR_MAP[operator];

    do {
        const a = generateNumber(digits);
        const b = generateNumber(digits);

        candidateContext = {
            a, b,
            op: operator,
            result: null, // Will calculate this if valid
            digits_a: digits,
            digits_b: digits
        };

        isValid = RuleEngine.evaluate(activeRulesAST, candidateContext);

        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.error(`Constraints are too strict; cannot generate valid problem after ${MAX_ATTEMPTS} attempts. rules:`, activeRulesAST);
            // Fallback: return any generated operands rather than breaking the UI, just not guaranteed to match rules
            break;
        }

    } while (!isValid);

    candidateContext.result = opInfo.op(candidateContext.a, candidateContext.b);

    // Check if a constraint was actively applied and obeyed.
    // For UI purposes, we might want to flag if constraints were used.
    // Since AST validation handles everything, we'll map `obeyedConstraint` to true if constraints existed.
    // But honestly we just need to return the problem format.
    const hasSpecialConstraints = activeRulesAST && (activeRulesAST.type === "AND" && (JSON.stringify(activeRulesAST).includes("NO_CARRY") || JSON.stringify(activeRulesAST).includes("NO_BORROW")));

    return {
        num1: candidateContext.a,
        num2: candidateContext.b,
        result: candidateContext.result,
        obeyedConstraint: hasSpecialConstraints ? isValid : null
    };
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
