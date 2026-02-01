export const OPERATOR_MAP = {
    '+': { symbol: '+', title: 'Addition', op: (a, b) => a + b },
    '-': { symbol: '−', title: 'Subtraction', op: (a, b) => a - b },
    '×': { symbol: '×', title: 'Multiplication', op: (a, b) => a * b },
    '÷': { symbol: '÷', title: 'Division', op: (a, b) => a / b },
};

export function causesCarrying(a, b) {
    const aStr = a.toString().padStart(b.toString().length, '0');
    const bStr = b.toString().padStart(aStr.length, '0');
    for (let i = aStr.length - 1; i >= 0; i--) {
        if (parseInt(aStr[i]) + parseInt(bStr[i]) >= 10) return true;
    }
    return false;
}

export function causesBorrowing(a, b) {
    const aStr = a.toString().padStart(b.toString().length, '0');
    const bStr = b.toString().padStart(aStr.length, '0');
    for (let i = aStr.length - 1; i >= 0; i--) {
        if (parseInt(aStr[i]) < parseInt(bStr[i])) return true;
    }
    return false;
}

export function getRandomOperands(digits, operator, avoidCarrying, avoidBorrowing) {
    const max = Math.pow(10, digits) - 1;
    const min = digits > 1 ? Math.pow(10, digits - 1) : 0;
    let a, b;

    while (true) {
        a = Math.floor(Math.random() * (max - min + 1)) + min;
        b = Math.floor(Math.random() * (max - min + 1)) + min;

        if (operator === '+') {
            if (avoidCarrying && causesCarrying(a, b)) continue;
            return [a, b, avoidCarrying ? !causesCarrying(a, b) : null];
        }

        if (operator === '-') {
            if (a < b) [a, b] = [b, a]; // Ensure positive result
            if (avoidBorrowing && causesBorrowing(a, b)) continue;
            return [a, b, avoidBorrowing ? !causesBorrowing(a, b) : null];
        }

        if (operator === '×') {
            return [a, b, null];
        }

        if (operator === '÷') {
            if (b > 1 && a % b === 0 && a / b <= max && a !== b) return [a, b, null];
        }
    }
}

export function generateProblemSet(count, settings) {
    const { numDigits, operator, avoidCarrying, avoidBorrowing } = settings;
    const opInfo = OPERATOR_MAP[operator];
    const problems = [];

    for (let i = 0; i < count; i++) {
        const [num1, num2, obeyedConstraint] = getRandomOperands(numDigits, operator, avoidCarrying, avoidBorrowing);
        const result = opInfo.op(num1, num2);
        problems.push({ num1, num2, result, obeyedConstraint });
    }

    return problems;
}
