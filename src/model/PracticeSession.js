/** Reads a typed answer: digits with optional commas or spaces. Returns null for anything else. */
export function parseAnswer(text) {
    const cleaned = String(text ?? '').replace(/[,\s]/g, '');
    return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

/**
 * One practice run over a list of problems.
 * An item is 'unchecked' until checked, and goes back to 'unchecked' when its answer is edited,
 * so a half-typed answer is never marked wrong.
 */
export class PracticeSession {
    /** @param {Array<{num1: number, num2: number, result: number, n: number}>} problems n = problem number on the worksheet */
    constructor(problems) {
        this.items = problems.map(problem => ({
            problem,
            value: '',
            status: 'unchecked', // 'unchecked' | 'correct' | 'wrong'
            firstTry: null // true/false after the first check
        }));
        this.current = 0;
    }

    get total() {
        return this.items.length;
    }

    setValue(i, value) {
        const item = this.items[i];
        if (item.value === value) return;
        item.value = value;
        item.status = 'unchecked';
    }

    /** Checks item i. Does nothing if it's empty or already checked with this answer. */
    check(i) {
        const item = this.items[i];
        if (item.value.trim() === '' || item.status !== 'unchecked') return;
        const correct = parseAnswer(item.value) === item.problem.result;
        item.status = correct ? 'correct' : 'wrong';
        if (item.firstTry === null) item.firstTry = correct;
    }

    get checkedCount() {
        return this.items.filter(item => item.status !== 'unchecked').length;
    }

    get correctCount() {
        return this.items.filter(item => item.status === 'correct').length;
    }

    /** Totals for the score screen. Anything not answered correctly, including blanks, is "not yet". */
    summary() {
        const correct = this.correctCount;
        return {
            total: this.total,
            correct,
            notYet: this.total - correct,
            firstTry: this.items.filter(item => item.firstTry === true).length,
            missed: this.items.filter(item => item.status !== 'correct')
        };
    }
}
