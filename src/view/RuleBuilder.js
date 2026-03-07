export class RuleBuilder {
    constructor(containerId, templateId, addBtnId) {
        this.container = document.getElementById(containerId);
        this.template = document.getElementById(templateId);

        this.bindEvents(addBtnId);
    }

    bindEvents(addBtnId) {
        document.getElementById(addBtnId).addEventListener('click', () => this.addRuleRow());

        // Event delegation for dynamically added remove buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-rule')) {
                e.target.closest('.rule-row').remove();
            }
        });
    }

    addRuleRow() {
        const clone = this.template.content.cloneNode(true);
        this.container.appendChild(clone);
    }

    /**
     * Translates the flat DOM rows into a recursive JSON AST.
     * @returns {Object|null} The root AST node
     */
    generateAST() {
        const rows = this.container.querySelectorAll('.rule-row');
        const nodes = [];

        rows.forEach(row => {
            const field = row.querySelector('.rule-field').value;
            const operator = row.querySelector('.rule-operator').value;
            const valueType = row.querySelector('.rule-value-type').value;
            const rawValue = row.querySelector('.rule-value').value;

            // Skip empty or incomplete rows
            if (!rawValue && rawValue !== '0') return;

            const node = {
                type: operator,
                field: field
            };

            if (valueType === 'reference') {
                node.fieldRef = rawValue;
            } else {
                node.value = Number(rawValue);
            }

            nodes.push(node);
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
}
