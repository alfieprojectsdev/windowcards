export const RULE_FIELDS = ['a', 'b', 'result'];
export const RULE_OPERATORS = ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN'];

// What "Add rule" creates: "Answer is less than 100"
const NEW_RULE = { field: 'result', operator: 'LESS_THAN', valueType: 'literal', value: '100' };

/**
 * Translates flat rule rows into a recursive JSON AST.
 * valueType is 'literal' (compare with `value`) or a field name (compare with that field).
 * Rows that are incomplete or invalid (empty number, unknown field) are skipped.
 * @param {Array<{field: string, operator: string, valueType: string, value: string}>} rows
 * @returns {Object|null} The root AST node
 */
export function rowsToAST(rows) {
    const nodes = [];

    rows.forEach(row => {
        const { field, operator, valueType, value } = row ?? {};
        if (!RULE_FIELDS.includes(field) || !RULE_OPERATORS.includes(operator)) return;

        if (valueType === 'literal') {
            if (value === '' || value == null) return;
            const number = Number(value);
            if (!Number.isFinite(number)) return;
            nodes.push({ type: operator, field, value: number });
        } else if (RULE_FIELDS.includes(valueType)) {
            nodes.push({ type: operator, field, fieldRef: valueType });
        }
    });

    if (nodes.length === 0) return null;
    if (nodes.length === 1) return nodes[0];

    // Fold array into a left-heavy recursive AND tree
    return nodes.reduce((acc, curr) => ({
        type: "AND",
        left: acc,
        right: curr
    }));
}

/**
 * The "05 Custom rules" group: a list of sentence-style rule rows, its empty state,
 * and the "too strict" error.
 */
export class RuleBuilder {
    /**
     * @param {Object} els { list, template, addButton, empty, intro, error, errorText, removeLastButton }
     * @param {Function} onChange Called after a rule is added, edited or removed.
     */
    constructor(els, onChange = () => {}) {
        this.els = els;
        this.onChange = onChange;
        this.nextId = 1;
        this.bindEvents();
        this.refresh();
    }

    bindEvents() {
        const { list, addButton, removeLastButton } = this.els;

        addButton.addEventListener('click', () => {
            const row = this.addRuleRow(NEW_RULE);
            row.querySelector('.rule-value').focus();
            this.changed();
        });

        removeLastButton.addEventListener('click', () => {
            list.lastElementChild?.remove();
            this.changed();
        });

        list.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-remove-rule');
            if (!button) return;
            button.closest('.rule-row').remove();
            this.changed();
        });

        // Numbers only; the value box is text so phones show the number pad without spinner arrows
        list.addEventListener('input', (e) => {
            if (!e.target.classList.contains('rule-value')) return;
            const digits = e.target.value.replace(/[^0-9]/g, '');
            if (digits !== e.target.value) e.target.value = digits;
        });

        list.addEventListener('change', (e) => {
            if (e.target.classList.contains('rule-value-type')) this.syncValueInput(e.target.closest('.rule-row'));
            this.changed();
        });
    }

    changed() {
        this.refresh();
        this.onChange();
    }

    addRuleRow(data) {
        const clone = this.els.template.content.cloneNode(true);
        const row = clone.querySelector('.rule-row');
        const id = `rule-${this.nextId++}`;

        // Give every control a unique id so its visually hidden label points at it
        row.querySelectorAll('[data-part]').forEach(control => {
            control.id = `${id}-${control.dataset.part}`;
        });
        row.querySelectorAll('label[data-for]').forEach(label => {
            label.htmlFor = `${id}-${label.dataset.for}`;
        });

        row.querySelector('.rule-field').value = data.field;
        row.querySelector('.rule-operator').value = data.operator;
        row.querySelector('.rule-value-type').value = data.valueType;
        row.querySelector('.rule-value').value = data.valueType === 'literal' ? (data.value ?? '') : '';

        this.syncValueInput(row);
        this.els.list.appendChild(clone);
        return row;
    }

    // The number box only shows for "the number…"
    syncValueInput(row) {
        const isLiteral = row.querySelector('.rule-value-type').value === 'literal';
        row.querySelector('.rule-value').hidden = !isLiteral;
    }

    /** Numbers the rows, joins them with "and", and shows the empty state when there are none. */
    refresh() {
        const rows = [...this.els.list.querySelectorAll('.rule-row')];
        rows.forEach((row, i) => {
            const n = i + 1;
            row.querySelector('.lead').textContent = i === 0 ? '' : 'and';
            row.querySelectorAll('label[data-for]').forEach(label => {
                label.textContent = `Rule ${n}: ${label.dataset.text}`;
            });
            row.querySelector('.btn-remove-rule').setAttribute('aria-label', `Remove rule ${n}`);
        });
        this.els.empty.hidden = rows.length > 0;
        this.els.intro.hidden = rows.length === 0;
    }

    /** Shows the "too strict" message, or hides it when `message` is empty. */
    setError(message) {
        const { error, errorText, list } = this.els;
        error.hidden = !message;
        errorText.textContent = message || '';
        list.querySelectorAll('.rule-row').forEach(row => {
            if (message) row.setAttribute('aria-invalid', 'true');
            else row.removeAttribute('aria-invalid');
        });
    }

    readRows() {
        return [...this.els.list.querySelectorAll('.rule-row')].map(row => ({
            field: row.querySelector('.rule-field').value,
            operator: row.querySelector('.rule-operator').value,
            valueType: row.querySelector('.rule-value-type').value,
            value: row.querySelector('.rule-value').value
        }));
    }

    setRows(rows) {
        this.els.list.innerHTML = '';
        rows.forEach(row => { if (row) this.addRuleRow(row); });
        this.refresh();
    }

    generateAST() {
        return rowsToAST(this.readRows());
    }
}
