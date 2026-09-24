import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateProblemSet, OPERATOR_MAP } from '../src/model/Generator.js';
import { RuleEngine } from '../src/model/RuleEngine.js';

// Generation is random, so each test draws enough problems that a broken rule would show up
const SAMPLE = 300;
const digitCount = n => String(n).length;

test('every operator returns the correct answer', () => {
    for (const [operator, { op }] of Object.entries(OPERATOR_MAP)) {
        for (const p of generateProblemSet(SAMPLE, { numDigits: 3, operator })) {
            assert.equal(p.result, op(p.num1, p.num2), `${p.num1} ${operator} ${p.num2}`);
        }
    }
});

test('problems contain only operands and result (the unused ⚠ flag is gone)', () => {
    const [p] = generateProblemSet(1, { numDigits: 2, operator: '+', avoidCarrying: true });
    assert.deepEqual(Object.keys(p).sort(), ['num1', 'num2', 'result']);
});

test('custom rules on Result are applied to the real result', () => {
    const below = generateProblemSet(SAMPLE, {
        numDigits: 2, operator: '+',
        customRules: { type: 'LESS_THAN', field: 'result', value: 100 }
    });
    below.forEach(p => assert.ok(p.result < 100, `${p.num1} + ${p.num2} = ${p.result}`));

    const above = generateProblemSet(SAMPLE, {
        numDigits: 2, operator: '+',
        customRules: { type: 'GREATER_THAN', field: 'result', value: 150 }
    });
    above.forEach(p => assert.ok(p.result > 150, `${p.num1} + ${p.num2} = ${p.result}`));
});

test('N-digit division has an N-digit dividend and no remainder', () => {
    for (let digits = 1; digits <= 6; digits++) {
        for (const { num1, num2, result } of generateProblemSet(SAMPLE, { numDigits: digits, operator: '÷' })) {
            const label = `${num1} ÷ ${num2}`;
            assert.equal(digitCount(num1), digits, label);
            assert.ok(digitCount(num2) <= Math.ceil(digits / 2), label);
            assert.equal(num1 % num2, 0, label);
            assert.ok(num2 >= 2, `${label}: no dividing by 1`);
            assert.ok(result >= 2, `${label}: no dividing a number by itself`);
        }
    }
});

test('subtraction never goes negative and respects Avoid Borrowing', () => {
    for (const p of generateProblemSet(SAMPLE, { numDigits: 4, operator: '-', avoidBorrowing: true })) {
        assert.ok(p.result >= 0);
        assert.equal(RuleEngine.checkBorrow(p.num1, p.num2), false, `${p.num1} − ${p.num2}`);
    }
});

test('addition respects Avoid Carrying', () => {
    for (const p of generateProblemSet(SAMPLE, { numDigits: 4, operator: '+', avoidCarrying: true })) {
        assert.equal(RuleEngine.checkCarry(p.num1, p.num2), false, `${p.num1} + ${p.num2}`);
    }
});

test('6-digit multiplication stays within exact integer range', () => {
    for (const p of generateProblemSet(SAMPLE, { numDigits: 6, operator: '×' })) {
        assert.ok(Number.isSafeInteger(p.result));
    }
});

test('out-of-range digits throw instead of hanging', () => {
    // Digits = 0 with division used to loop forever looking for a non-zero divisor
    for (const numDigits of [0, 7, NaN, 2.5]) {
        assert.throws(() => generateProblemSet(1, { numDigits, operator: '÷' }), RangeError, `digits=${numDigits}`);
    }
});

test('impossible constraints throw a "too strict" error', () => {
    assert.throws(
        () => generateProblemSet(1, { numDigits: 1, operator: '+', customRules: { type: 'GREATER_THAN', field: 'result', value: 100 } }),
        /too strict/
    );
});
