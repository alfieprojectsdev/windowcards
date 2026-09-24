import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rowsToAST } from '../src/view/RuleBuilder.js';
import { GridRenderer } from '../src/view/GridRenderer.js';

test('rule rows become an AND tree of comparator nodes', () => {
    const ast = rowsToAST([
        { field: 'a', operator: 'GREATER_THAN', valueType: 'reference', value: 'b' },
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
        // The old placeholder suggested typing 'b' with quotes, which matched no field
        { field: 'a', operator: 'EQUALS', valueType: 'reference', value: "'b'" },
        { field: 'x', operator: 'EQUALS', valueType: 'literal', value: '1' },
        null
    ]), null);
});

test('zero is a valid rule value', () => {
    assert.deepEqual(
        rowsToAST([{ field: 'b', operator: 'NOT_EQUALS', valueType: 'literal', value: '0' }]),
        { type: 'NOT_EQUALS', field: 'b', value: 0 }
    );
});

test('card text has no blank first line', () => {
    const text = GridRenderer.cardText({ num1: 12, num2: 7 }, '+');
    assert.equal(text.split('\n').length, 3);
    assert.notEqual(text[0], '\n');
    assert.ok(!text.endsWith('\n'));
});

test('column width fits the longest line on any card, including the answer', () => {
    const problems = [
        { num1: 9999, num2: 9999, result: 99980001 },
        { num1: 1, num2: 1, result: 1 }
    ];
    const answerLength = GridRenderer.formatNumber(99980001).length;
    assert.ok(GridRenderer.cardWidthCh(problems, '×') > answerLength);

    const widest = Math.max(...GridRenderer.cardText(problems[0], '×').split('\n').map(l => l.length));
    assert.ok(GridRenderer.cardWidthCh(problems, '×') > widest);
});
