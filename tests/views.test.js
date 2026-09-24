import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rowsToAST } from '../src/view/RuleBuilder.js';
import { cellHTML, sheetTitle } from '../src/view/GridRenderer.js';

test('rule rows become an AND tree of comparator nodes', () => {
    const ast = rowsToAST([
        { field: 'a', operator: 'GREATER_THAN', valueType: 'b', value: '' },
        { field: 'result', operator: 'LESS_THAN', valueType: 'literal', value: '100' }
    ]);
    assert.deepEqual(ast, {
        type: 'AND',
        left: { type: 'GREATER_THAN', field: 'a', fieldRef: 'b' },
        right: { type: 'LESS_THAN', field: 'result', value: 100 }
    });
});

test('incomplete or invalid rule rows are skipped', () => {
    assert.equal(rowsToAST([
        { field: 'a', operator: 'EQUALS', valueType: 'literal', value: '' },
        { field: 'a', operator: 'EQUALS', valueType: 'literal', value: 'abc' },
        { field: 'a', operator: 'EQUALS', valueType: "'b'", value: '' },
        { field: 'x', operator: 'EQUALS', valueType: 'literal', value: '1' },
        { field: 'a', operator: 'BETWEEN', valueType: 'literal', value: '1' },
        null
    ]), null);
});

test('zero is a valid rule value', () => {
    assert.deepEqual(
        rowsToAST([{ field: 'b', operator: 'NOT_EQUALS', valueType: 'literal', value: '0' }]),
        { type: 'NOT_EQUALS', field: 'b', value: 0 }
    );
});

test('worksheet cells keep an empty answer row; answer-key cells fill it', () => {
    const problem = { num1: 1234, num2: 5678, result: 6912 };
    const worksheet = cellHTML(problem, 7, '+', false);
    const key = cellHTML(problem, 7, '+', true);

    assert.match(worksheet, /<span class="cell-n">7<\/span>/);
    assert.match(worksheet, /1,234/);
    assert.match(worksheet, /<span class="wc-answer"><\/span>/);
    assert.match(key, /<span class="wc-answer">6,912<\/span>/);
});

test('sheet titles name the digits and operation', () => {
    assert.equal(sheetTitle({ numDigits: 4, operator: '÷' }), '4-Digit Division Window Cards');
});
