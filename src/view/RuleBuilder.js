export const RULE_FIELDS = ['a', 'b', 'result'];
export const RULE_OPERATORS = ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN'];

/**
 * Translates flat rule rows into a recursive JSON AST.
 * Rows that are incomplete or invalid (empty number, unknown field) are skipped.
 * @param {Array<{field: string, operator: string, valueType: 'literal'|'reference', value: string}>} rows
 * @returns {Object|null} The root AST node
 */
export function rowsToAST(rows) {
    const nodes = [];

    rows.forEach(row => {
        const { field, operator, valueType, value } = row ?? {};
        if (!RULE_FIELDS.includes(field) || !RULE_OPERATORS.includes(operator)) return;

        if (valueType === 'reference') {
            if (!RULE_FIELDS.includes(value)) return;
            nodes.push({ type: operator, field, fieldRef: value });
        } else {
            if (value === '' || value == null) return;
            const number = Number(value);
            if (!Number.isFinite(number)) return;
            nodes.push({ type: operator, field, value: number });
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

export class RuleBuilder {
    /**
     * @param {Function} onChange Called after a rule is edited or removed.
     */
    constructor(containerId, templateId, addBtnId, onChange = () => {}) {
        this.container = document.getElementById(containerId);
        this.template = document.getElementById(templateId);
        this.onChange = onChange;

        this.bindEvents(addBtnId);
    }

    bindEvents(addBtnId) {
        // A new row starts empty, so it doesn't change the AST until it's filled in
        document.getElementById(addBtnId).addEventListener('click', () => this.addRuleRow());

        // Event delegation for dynamically added rows
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-rule')) {
                e.target.closest('.rule-row').remove();
                this.onChange();
            }
        });

        this.container.addEventListener('change', (e) => {
            const row = e.target.closest('.rule-row');
            if (e.target.classList.contains('rule-value-type')) this.syncValueInput(row);
            this.onChange();
        });
    }

    addRuleRow(data) {
        const clone = this.template.content.cloneNode(true);
        const row = clone.querySelector('.rule-row');

        if (data) {
            row.querySelector('.rule-field').value = data.field;
            row.querySelector('.rule-operator').value = data.operator;
            row.querySelector('.rule-value-type').value = data.valueType;
            if (data.valueType === 'reference') {
                row.querySelector('.rule-value-field').value = data.value;
            } else {
                row.querySelector('.rule-value').value = data.value;
            }
        }

        this.syncValueInput(row);
        this.container.appendChild(clone);
    }

    // Show the number box for "Number" and the field dropdown for "Field"
    syncValueInput(row) {
        const isReference = row.querySelector('.rule-value-type').value === 'reference';
        row.querySelector('.rule-value').hidden = isReference;
        row.querySelector('.rule-value-field').hidden = !isReference;
    }

    readRows() {
        return [...this.container.querySelectorAll('.rule-row')].map(row => {
            const valueType = row.querySelector('.rule-value-type').value;
            return {
                field: row.querySelector('.rule-field').value,
                operator: row.querySelector('.rule-operator').value,
                valueType,
                value: valueType === 'reference'
                    ? row.querySelector('.rule-value-field').value
                    : row.querySelector('.rule-value').value
            };
        });
    }

    setRows(rows) {
        this.container.innerHTML = '';
        rows.forEach(row => this.addRuleRow(row));
    }

    generateAST() {
        return rowsToAST(this.readRows());
    }
}
