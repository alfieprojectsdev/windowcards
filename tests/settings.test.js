import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSettings, DEFAULT_SETTINGS } from '../src/model/State.js';
import { Storage } from '../src/services/Storage.js';

// Minimal in-memory localStorage, installed fresh before each test
beforeEach(() => {
    const data = new Map();
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        writable: true,
        value: {
            getItem: key => (data.has(key) ? data.get(key) : null),
            setItem: (key, value) => data.set(key, String(value)),
            removeItem: key => data.delete(key)
        }
    });
});

test('numeric settings are clamped to their limits', () => {
    const s = normalizeSettings({ numRows: 500, numCols: 0, numDigits: 9, fontSize: 2 });
    assert.equal(s.numRows, 20);
    assert.equal(s.numCols, 1);
    assert.equal(s.numDigits, 6);
    assert.equal(s.fontSize, 8);
});

test('empty or unparseable values fall back to the defaults', () => {
    const s = normalizeSettings({ numRows: '', numCols: 'NaN', numDigits: undefined, operator: '%' });
    assert.equal(s.numRows, DEFAULT_SETTINGS.numRows);
    assert.equal(s.numCols, DEFAULT_SETTINGS.numCols);
    assert.equal(s.numDigits, DEFAULT_SETTINGS.numDigits);
    assert.equal(s.operator, DEFAULT_SETTINGS.operator);
});

test('string values from inputs and localStorage are parsed', () => {
    const s = normalizeSettings({ numRows: '7', operator: '÷', avoidCarrying: 'true', avoidBorrowing: 'false' });
    assert.equal(s.numRows, 7);
    assert.equal(s.operator, '÷');
    assert.equal(s.avoidCarrying, true);
    assert.equal(s.avoidBorrowing, false);
});

test('a "NaN" saved by older versions loads as the default', () => {
    localStorage.setItem('numRows', 'NaN');
    localStorage.setItem('numDigits', '3');
    const s = Storage.loadSettings();
    assert.equal(s.numRows, DEFAULT_SETTINGS.numRows);
    assert.equal(s.numDigits, 3);
});

test('saveSettings never writes an invalid value', () => {
    Storage.saveSettings({ ...DEFAULT_SETTINGS, numRows: NaN, numDigits: 0 });
    assert.equal(localStorage.getItem('numRows'), String(DEFAULT_SETTINGS.numRows));
    assert.equal(localStorage.getItem('numDigits'), '1');
});

test('custom rule rows survive a save and load, and bad data loads as no rules', () => {
    const rows = [{ field: 'result', operator: 'LESS_THAN', valueType: 'literal', value: '50' }];
    Storage.saveRules(rows);
    assert.deepEqual(Storage.loadRules(), rows);

    localStorage.setItem('customRules', '{not json');
    assert.deepEqual(Storage.loadRules(), []);
});
