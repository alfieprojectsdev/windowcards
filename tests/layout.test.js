import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitCheck, formatNumber, largestNumbers } from '../src/model/Layout.js';
import { generateProblemSet } from '../src/model/Generator.js';

const base = { numDigits: 4, operator: '+', numRows: 10, numCols: 10, fontSize: 10 };

test('numbers use en-US separators regardless of the machine locale', () => {
    assert.equal(formatNumber(1234567), '1,234,567');
});

test('4-digit addition, 10 × 10 at 10 pt fits one A4 page (the design\'s reference case)', () => {
    assert.deepEqual(fitCheck(base), { fits: true, message: '' });
});

test('a size that does not fit suggests the largest point size that does', () => {
    const { fits, message } = fitCheck({ ...base, operator: '×' });
    assert.equal(fits, false);
    assert.match(message, /^At 10 pt, a 10 × 10 grid won’t fit on one A4 page\. Try 8 pt/);
});

test('when no point size fits, it suggests fewer columns', () => {
    const { fits, message } = fitCheck({ ...base, numDigits: 6, operator: '×', fontSize: 9 });
    assert.equal(fits, false);
    assert.match(message, /Try fewer columns\.$/);
});

test('small grids fit at large sizes', () => {
    assert.equal(fitCheck({ ...base, numRows: 3, numCols: 3, fontSize: 36 }).fits, true);
});

test('largestNumbers bounds every generated problem', () => {
    for (const operator of ['+', '-', '×', '÷']) {
        for (const numDigits of [1, 3, 6]) {
            const max = largestNumbers(numDigits, operator);
            for (const p of generateProblemSet(200, { numDigits, operator })) {
                const label = `${operator} ${numDigits}: ${p.num1}, ${p.num2}, ${p.result}`;
                assert.ok(p.num1 <= max.a && p.num2 <= max.b && p.result <= max.result, label);
            }
        }
    }
});
