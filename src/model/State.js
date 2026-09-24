export const OPERATORS = ['+', '-', '×', '÷'];

export const DEFAULT_SETTINGS = {
    numRows: 10,
    numCols: 10,
    numDigits: 4,
    fontSize: 10,
    operator: '+',
    avoidCarrying: false,
    avoidBorrowing: false
};

// [min, max] for each numeric setting. Must match the min/max attributes in index.html.
export const LIMITS = {
    numRows: [1, 20],
    numCols: [1, 20],
    numDigits: [1, 6],
    fontSize: [8, 36]
};

/**
 * Returns a complete, valid settings object. Numeric values are parsed and clamped to LIMITS;
 * anything missing or unparseable (empty input, "NaN" from old localStorage) falls back to the default.
 */
export function normalizeSettings(input = {}) {
    const settings = { ...DEFAULT_SETTINGS };

    for (const [key, [min, max]] of Object.entries(LIMITS)) {
        const n = Number.parseInt(input[key], 10);
        if (Number.isFinite(n)) settings[key] = Math.min(max, Math.max(min, n));
    }

    if (OPERATORS.includes(input.operator)) settings.operator = input.operator;
    settings.avoidCarrying = input.avoidCarrying === true || input.avoidCarrying === 'true';
    settings.avoidBorrowing = input.avoidBorrowing === true || input.avoidBorrowing === 'true';

    return settings;
}

export const State = {
    currentProblems: [],
    practiceMode: false,
    settings: { ...DEFAULT_SETTINGS }
};
