import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PracticeSession, parseAnswer } from '../src/model/PracticeSession.js';
import { columnHint } from '../src/model/Hints.js';

const problems = [
    { num1: 47, num2: 38, result: 85, n: 1 },
    { num1: 12, num2: 30, result: 42, n: 2 },
    { num1: 5, num2: 5, result: 10, n: 3 }
];

test('answers may contain commas and spaces, nothing else', () => {
    assert.equal(parseAnswer('1,234'), 1234);
    assert.equal(parseAnswer(' 12 345 '), 12345);
    assert.equal(parseAnswer('12a'), null);
    assert.equal(parseAnswer('-3'), null);
    assert.equal(parseAnswer(''), null);
});

test('an answer is only marked once it is checked, and editing it clears the mark', () => {
    const s = new PracticeSession(problems);
    s.setValue(0, '8');
    assert.equal(s.items[0].status, 'unchecked'); // half-typed, not wrong yet

    s.check(0);
    assert.equal(s.items[0].status, 'wrong');
    s.setValue(0, '85');
    assert.equal(s.items[0].status, 'unchecked');
    s.check(0);
    assert.equal(s.items[0].status, 'correct');
});

test('checking an empty box does nothing', () => {
    const s = new PracticeSession(problems);
    s.check(1);
    assert.equal(s.items[1].status, 'unchecked');
    assert.equal(s.items[1].firstTry, null);
});

test('checking twice without editing counts as one attempt', () => {
    // Enter checks and moves focus, which also fires blur; that must not count again
    const s = new PracticeSession(problems);
    s.setValue(0, '75');
    s.check(0);
    s.check(0);
    s.setValue(0, '85');
    s.check(0);
    assert.equal(s.items[0].firstTry, false);
});

test('the summary counts correct, not yet and right first try', () => {
    const s = new PracticeSession(problems);
    s.setValue(0, '85'); s.check(0);            // right first try
    s.setValue(1, '41'); s.check(1);            // wrong...
    s.setValue(1, '42'); s.check(1);            // ...then right
    // problem 3 left blank

    const summary = s.summary();
    assert.equal(summary.total, 3);
    assert.equal(summary.correct, 2);
    assert.equal(summary.notYet, 1);
    assert.equal(summary.firstTry, 1);
    assert.deepEqual(summary.missed.map(item => item.problem.n), [3]);
});

test('hint for a dropped carry points at the column it came from', () => {
    // The example from the design: 47 + 38, student wrote 75
    assert.equal(columnHint(47, 38, '+', '75'), 'Check the ones column — 7 + 8 is more than 10. Try again.');
    assert.equal(columnHint(5, 5, '+', '0'), 'Check the ones column — 5 + 5 is 10. Try again.');
    assert.equal(columnHint(55, 45, '+', '90'), 'Check the ones column — 5 + 5 is 10. Try again.');
    // 195 + 5 = 200: the tens column is 9 + 0 plus a carry, which carries again into the hundreds
    assert.equal(columnHint(195, 5, '+', '100'), 'Check the tens column — 9 + 0 and the 1 you carried make 10. Try again.');
});

test('hint for a wrong column without a carry names that column', () => {
    assert.equal(columnHint(1234, 1111, '+', '2355'), 'Check the tens column. Try again.');
});

test('subtraction hints point at borrowing', () => {
    // 52 − 17 = 35. A wrong ones digit, where 2 − 7 needs a borrow
    assert.equal(columnHint(52, 17, '-', '30'), 'Check the ones column — 2 is less than 7, so you need to borrow. Try again.');
    // 45: ones right, but the tens didn't drop by the 1 it lent
    assert.equal(columnHint(52, 17, '-', '45'), 'Check the tens column — it lent 1 to the ones column. Try again.');
    // 62 − 17 = 45; ones right (5), tens left at 5 instead of 4
    assert.equal(columnHint(62, 17, '-', '55'), 'Check the tens column — it lent 1 to the ones column. Try again.');
});

test('hints are plain for other operations, unreadable answers and correct answers', () => {
    assert.equal(columnHint(6, 7, '×', '40'), 'Try again.');
    assert.equal(columnHint(47, 38, '+', 'abc'), 'Try again.');
    assert.equal(columnHint(47, 38, '+', '85'), '');
});
