import { parseAnswer } from './PracticeSession.js';

const COLUMN_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands', 'millions'];

const digitAt = (n, i) => Math.floor(n / 10 ** i) % 10;
const columnName = i => COLUMN_NAMES[i] ?? 'next';

// 1 if adding columns 0..i-1 carries into column i
function carryInto(a, b, i) {
    let carry = 0;
    for (let k = 0; k < i; k++) carry = digitAt(a, k) + digitAt(b, k) + carry >= 10 ? 1 : 0;
    return carry;
}

// 1 if subtracting columns 0..i-1 borrows from column i
function borrowFrom(a, b, i) {
    let borrow = 0;
    for (let k = 0; k < i; k++) borrow = digitAt(a, k) - borrow < digitAt(b, k) ? 1 : 0;
    return borrow;
}

/**
 * A hint for a wrong answer to an addition or subtraction problem, pointing at the first
 * column (from the right) where the answer goes wrong. Never gives the answer away.
 * Returns '' for a correct answer and a plain "Try again." when there's nothing specific to say.
 */
export function columnHint(a, b, operator, answerText) {
    const fallback = 'Try again.';
    if (operator !== '+' && operator !== '-') return fallback;

    const typed = parseAnswer(answerText);
    if (typed === null) return fallback;
    const correct = operator === '+' ? a + b : a - b;
    if (typed === correct) return '';

    let i = 0;
    while (digitAt(typed, i) === digitAt(correct, i)) i++;
    const name = columnName(i);
    const typedDigit = digitAt(typed, i);
    const correctDigit = digitAt(correct, i);

    if (operator === '+') {
        // One less than it should be: the carry from the column to the right was dropped
        if (i > 0 && carryInto(a, b, i) && typedDigit === (correctDigit + 9) % 10) {
            const x = digitAt(a, i - 1);
            const y = digitAt(b, i - 1);
            const sum = x + y >= 10
                ? `${x} + ${y} is ${x + y === 10 ? '10' : 'more than 10'}`
                : `${x} + ${y} and the 1 you carried make 10`;
            return `Check the ${columnName(i - 1)} column — ${sum}. Try again.`;
        }
        return `Check the ${name} column. Try again.`;
    }

    const top = digitAt(a, i) - borrowFrom(a, b, i);
    const bottom = digitAt(b, i);
    if (top < bottom) {
        const what = top === digitAt(a, i) ? `${top}` : `after lending 1, ${top}`;
        return `Check the ${name} column — ${what} is less than ${bottom}, so you need to borrow. Try again.`;
    }
    // One more than it should be: this column lent 1 to the right and didn't take it off
    if (borrowFrom(a, b, i) && typedDigit === (correctDigit + 1) % 10) {
        return `Check the ${name} column — it lent 1 to the ${columnName(i - 1)} column. Try again.`;
    }
    return `Check the ${name} column. Try again.`;
}
