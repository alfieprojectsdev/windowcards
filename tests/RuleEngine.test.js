import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleEngine } from '../src/model/RuleEngine.js';

const ctx = { a: 12, b: 5, result: 17 };

test('comparators accept a literal value or a field reference', () => {
    assert.equal(RuleEngine.evaluate({ type: 'GREATER_THAN', field: 'a', value: 10 }, ctx), true);
    assert.equal(RuleEngine.evaluate({ type: 'LESS_THAN', field: 'a', value: 10 }, ctx), false);
    assert.equal(RuleEngine.evaluate({ type: 'GREATER_THAN', field: 'a', fieldRef: 'b' }, ctx), true);
    assert.equal(RuleEngine.evaluate({ type: 'EQUALS', field: 'result', value: 17 }, ctx), true);
    assert.equal(RuleEngine.evaluate({ type: 'NOT_EQUALS', field: 'a', fieldRef: 'b' }, ctx), true);
    assert.equal(RuleEngine.evaluate({ type: 'GREATER_THAN_OR_EQUAL', field: 'b', value: 5 }, ctx), true);
    assert.equal(RuleEngine.evaluate({ type: 'LESS_THAN_OR_EQUAL', field: 'b', value: 4 }, ctx), false);
});

test('AND, OR and NOT combine child rules', () => {
    const yes = { type: 'EQUALS', field: 'a', value: 12 };
    const no = { type: 'EQUALS', field: 'a', value: 0 };
    assert.equal(RuleEngine.evaluate({ type: 'AND', left: yes, right: no }, ctx), false);
    assert.equal(RuleEngine.evaluate({ type: 'OR', left: yes, right: no }, ctx), true);
    assert.equal(RuleEngine.evaluate({ type: 'NOT', operand: no }, ctx), true);
});

test('an empty rule set accepts everything', () => {
    assert.equal(RuleEngine.evaluate(null, ctx), true);
});

test('carrying is detected in any column, including numbers of different lengths', () => {
    // Examples from docs/teacher-guide.md
    assert.equal(RuleEngine.checkCarry(23, 45), false);
    assert.equal(RuleEngine.checkCarry(28, 45), true);
    assert.equal(RuleEngine.checkCarry(5, 95), true);
    assert.equal(RuleEngine.checkCarry(4, 1995), false);
});

test('borrowing is detected in any column', () => {
    assert.equal(RuleEngine.checkBorrow(87, 52), false);
    assert.equal(RuleEngine.checkBorrow(82, 57), true);
    assert.equal(RuleEngine.checkBorrow(100, 1), true);
});

test('NO_REMAINDER checks exact division', () => {
    assert.equal(RuleEngine.evaluate({ type: 'NO_REMAINDER' }, { a: 12, b: 4 }), true);
    assert.equal(RuleEngine.evaluate({ type: 'NO_REMAINDER' }, { a: 13, b: 4 }), false);
});
