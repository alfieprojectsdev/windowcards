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

    /** Rule rows as produced by RuleBuilder.readRows(): [{ field, operator, valueType, value }] */
    saveRules(rows) {
        localStorage.setItem(RULES_KEY, JSON.stringify(rows));
    },

    loadRules() {
        try {
            const rows = JSON.parse(localStorage.getItem(RULES_KEY));
            return Array.isArray(rows) ? rows : [];
        } catch {
            return [];
        }
    }
};
