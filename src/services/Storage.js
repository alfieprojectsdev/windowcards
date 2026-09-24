import { DEFAULT_SETTINGS, normalizeSettings } from '../model/State.js';

const RULES_KEY = 'customRules';

export const Storage = {
    // One localStorage key per setting, kept from v1 so existing users keep their preferences
    IDS: Object.keys(DEFAULT_SETTINGS),

    saveSettings(settings) {
        const valid = normalizeSettings(settings);
        this.IDS.forEach(id => localStorage.setItem(id, valid[id]));
    },

    loadSettings() {
        const saved = {};
        this.IDS.forEach(id => {
            const val = localStorage.getItem(id);
            if (val !== null) saved[id] = val;
        });
        return normalizeSettings(saved);
    },

    /** Rule rows as produced by RuleBuilder.readRows(): [{ field, operator, valueType: 'literal'|'a'|'b'|'result', value }] */
    saveRules(rows) {
        localStorage.setItem(RULES_KEY, JSON.stringify(rows));
    },

    loadRules() {
        let rows;
        try {
            rows = JSON.parse(localStorage.getItem(RULES_KEY));
        } catch {
            return [];
        }
        if (!Array.isArray(rows)) return [];

        // Before the redesign, "compare with a field" was saved as { valueType: 'reference', value: 'b' }.
        // It's now { valueType: 'b' }.
        return rows.map(row => (row && row.valueType === 'reference')
            ? { ...row, valueType: row.value, value: '' }
            : row);
    }
};
