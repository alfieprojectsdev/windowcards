# ADR 002: Implement AST Rules Engine for Math Problem Constraints

**Status:** Proposed / Planned  
**Context:** `windowcards` (Vanilla JS Math Grid Generator)  
**Date:** March 2026  

## 1. Context and Problem Statement
Currently, mathematical constraints (e.g., "no borrowing in subtraction", "no remainders in division") are hardcoded into the problem generation loop within `src/model/Generator.js`. 

As we move toward **v4.1** (Custom constraint rules defined by teachers via a UI dropdown), continuing to hardcode constraints will lead to deeply nested, unmaintainable `if/else` logic. We need a way to decouple the *generation* of a candidate math problem from the *validation* of that problem, while maintaining our zero-dependency Vanilla JS architecture.

## 2. Decision
We will implement a lightweight, JSON-based **Abstract Syntax Tree (AST) Rules Engine**. 

Instead of writing procedural validation logic, the UI will construct a JSON object representing the active rules. `Generator.js` will rapidly generate candidate problems and pass them as a "Context" object to a generic `RuleEngine` evaluator. The engine will traverse the AST and return a boolean indicating if the problem is valid.

## 3. Technical Specification

### 3.1 The Context Object
Every generated problem will be packaged into a standardized context dictionary before validation.

```javascript
// Example: Candidate problem for 55 ÷ 55
const context = {
  a: 55,
  b: 55,
  op: "÷",
  result: 1,
  digits_a: 2,
  digits_b: 2
};

```

### 3.2 The AST Rule Schema (JSON)

Rules are defined as node objects. Because it is pure JSON, a frontend UI (like dropdown menus) can easily construct these without needing a string parser.

```javascript
// Rule: "If the operation is division, Operand A cannot equal Operand B"
const noTrivialDivisionAST = {
  type: "AND",
  left: { type: "EQUALS", field: "op", value: "÷" },
  right: { type: "NOT_EQUALS", field: "a", fieldRef: "b" } // fieldRef compares two variables in context
};

```

### 3.3 The Evaluator (`src/model/RuleEngine.js`)

A recursive evaluator will process the AST against the provided context.

```javascript
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
      
      // Domain-Specific Math Constraints
      case "NO_CARRY":
         return !this.checkCarry(context.a, context.b);
      case "NO_BORROW":
         return !this.checkBorrow(context.a, context.b);

      default:
        console.warn(`Unknown node type: ${node.type}`);
        return true;
    }
  }

  static checkCarry(a, b) {
     // Mathematical logic to detect carry-over
  }
  
  static checkBorrow(a, b) {
     // Mathematical logic to detect borrowing
  }
}

```

### 3.4 Integration with Generator Loop

The generator becomes a simple `do/while` loop, offloading all complex logic to the Rule Engine.

```javascript
import { RuleEngine } from './RuleEngine.js';

function generateValidProblem(operation, digits, activeRulesAST) {
  let candidateContext;
  let isValid = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  do {
    const a = generateNumber(digits);
    const b = generateNumber(digits);
    
    candidateContext = { 
      a, b, op: operation, 
      result: calculate(a, b, operation),
      digits_a: digits, digits_b: digits
    };

    isValid = RuleEngine.evaluate(activeRulesAST, candidateContext);
    
    attempts++;
    if (attempts > MAX_ATTEMPTS) {
      throw new Error("Constraints are too strict; cannot generate valid problem.");
    }
    
  } while (!isValid);

  return candidateContext;
}

```

## 4. Consequences

* **Highly Extensible:** Adding a new constraint (e.g., "No multiplying by 0 or 1") requires zero changes to the core `Generator.js` logic. We just add a new JSON node to the active AST.
* **UI Integration:** Maps perfectly to UI dropdowns (`[Operand A] [Not Equal To] [Operand B]`), allowing teachers to define custom patterns easily.
* **Architectural Purity:** Maintains the project's zero-dependency Vanilla JS constraint-solving philosophy.
