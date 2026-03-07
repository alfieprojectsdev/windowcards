export class RuleEngine {
    static evaluate(node, context) {
        if (!node) return true;

        switch (node.type) {
            // Logical Operators
            case "AND":
                return this.evaluate(node.left, context) && this.evaluate(node.right, context);
            case "OR":
                return this.evaluate(node.left, context) || this.evaluate(node.right, context);
            case "NOT":
                return !this.evaluate(node.operand, context);

            // Comparators
            case "EQUALS":
                return context[node.field] === (node.fieldRef ? context[node.fieldRef] : node.value);
            case "NOT_EQUALS":
                return context[node.field] !== (node.fieldRef ? context[node.fieldRef] : node.value);
            case "GREATER_THAN":
                return context[node.field] > (node.fieldRef ? context[node.fieldRef] : node.value);
            case "LESS_THAN":
                return context[node.field] < (node.fieldRef ? context[node.fieldRef] : node.value);
            case "GREATER_THAN_OR_EQUAL":
                return context[node.field] >= (node.fieldRef ? context[node.fieldRef] : node.value);
            case "LESS_THAN_OR_EQUAL":
                return context[node.field] <= (node.fieldRef ? context[node.fieldRef] : node.value);

            // Domain-Specific Math Constraints
            case "NO_CARRY":
                return !this.checkCarry(context.a, context.b);
            case "NO_BORROW":
                return !this.checkBorrow(context.a, context.b);
            case "NO_REMAINDER":
                return context.a % context.b === 0;

            default:
                console.warn(`Unknown node type: ${node.type}`);
                return true;
        }
    }

    static checkCarry(a, b) {
        const aStr = a.toString().padStart(b.toString().length, '0');
        const bStr = b.toString().padStart(aStr.length, '0');
        for (let i = aStr.length - 1; i >= 0; i--) {
            if (parseInt(aStr[i]) + parseInt(bStr[i]) >= 10) return true;
        }
        return false;
    }

    static checkBorrow(a, b) {
        const aStr = a.toString().padStart(b.toString().length, '0');
        const bStr = b.toString().padStart(aStr.length, '0');
        for (let i = aStr.length - 1; i >= 0; i--) {
            if (parseInt(aStr[i]) < parseInt(bStr[i])) return true;
        }
        return false;
    }
}
