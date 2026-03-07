# ADR 003: Vanilla JS AST Rule Builder UI

**Status:** Proposed  
**Context:** `windowcards` (v4.2 Feature)  
**Date:** March 2026  

## 1. Context and Problem Statement
In ADR-002, we successfully decoupled the math problem generation from validation by introducing an Abstract Syntax Tree (AST) Rules Engine. Currently, the AST is constructed programmatically under the hood. 

We need a user interface that allows teachers to define custom constraint patterns (e.g., "Operand A must be greater than Operand B"). Furthermore, this UI component serves as an architectural proof-of-concept for broader platform extensibility. 

The core challenge is translating flat, human-readable UI rows (dropdowns and inputs) into a recursive, nested JSON object without relying on heavy frontend frameworks or external parsers.

## 2. Decision
We will implement a zero-dependency, Vanilla JS `RuleBuilder` class. 

The UI will consist of flat, repeatable rows representing individual leaf nodes. The serialization logic will read the DOM state and "fold" these flat rows into a nested AST using `Array.prototype.reduce()`, implicitly chaining all active rules with `AND` nodes for the MVP.

## 3. Technical Specification

### 3.1 Architecture: Flat-to-Tree Serialization
The Rule Builder operates on a strict boundary: it knows nothing about mathematical logic. Its only responsibility is DOM manipulation (adding/removing rows) and state serialization (DOM $\rightarrow$ JSON).

**Mapping logic:**
`[Field] [Operator] [Value/Field]` $\rightarrow$ `{ type: "OPERATOR", field: "field", value?: "X", fieldRef?: "Y" }`

### 3.2 Reference Implementation: HTML DOM Structure
We utilize the HTML `<template>` tag to keep the DOM clean and avoid messy JavaScript string literals for HTML generation.

```html
<div class="rule-builder-container">
  <h4>Custom Constraints</h4>
  
  <div id="rule-list" class="flex-column gap-2">
    </div>

  <button id="btn-add-rule" class="btn-secondary mt-2">+ Add Rule</button>
</div>

<template id="rule-row-template">
  <div class="rule-row flex-row gap-2 align-center">
    <select class="rule-field">
      <option value="a">Operand A</option>
      <option value="b">Operand B</option>
      <option value="result">Result</option>
    </select>

    <select class="rule-operator">
      <option value="EQUALS">Equals (=)</option>
      <option value="NOT_EQUALS">Not Equals (≠)</option>
      <option value="GREATER_THAN">Greater Than (>)</option>
      <option value="LESS_THAN">Less Than (<)</option>
    </select>

    <select class="rule-value-type">
      <option value="literal">Number</option>
      <option value="reference">Field</option>
    </select>

    <input type="text" class="rule-value" placeholder="e.g., 5 or 'b'">
    
    <button class="btn-remove-rule text-red">✕</button>
  </div>
</template>

```

### 3.3 Reference Implementation: The Serializer (`RuleBuilder.js`)

This class handles event delegation for dynamic elements and the core folding algorithm.

```javascript
// src/view/RuleBuilder.js

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

```

### 3.4 Integration Point (`main.js`)

Connecting the UI output to the existing generator loop.

```javascript
// src/main.js
import { RuleBuilder } from './view/RuleBuilder.js';
import { generateValidProblem } from './model/Generator.js';

// Initialize the builder
const builder = new RuleBuilder('rule-list', 'rule-row-template', 'btn-add-rule');

document.getElementById('generate-btn').addEventListener('click', () => {
  const operation = document.getElementById('operation').value;
  const digits = parseInt(document.getElementById('digits').value, 10);
  
  // 1. Serialize custom rules from DOM
  const customAST = builder.generateAST();

  // 2. Fetch hardcoded checkbox rules (e.g., No Borrowing)
  const hardcodedAST = getCheckboxRulesAST(); 

  // 3. Combine rules safely
  let combinedAST = null;
  if (customAST && hardcodedAST) {
    combinedAST = { type: "AND", left: hardcodedAST, right: customAST };
  } else {
    combinedAST = customAST || hardcodedAST;
  }

  // 4. Pass to the generation engine
  try {
    const problemSet = [];
    for(let i=0; i<10; i++) {
        problemSet.push(generateValidProblem(operation, digits, combinedAST));
    }
    renderGrid(problemSet);
  } catch (error) {
    window.alert(error.message); // Catch MAX_ATTEMPTS from strict constraints
  }
});

```

## 4. Consequences & Extensibility

* **Zero Dependencies:** Maintains strict adherence to the project's vanilla stack constraints.
* **Proof-of-Concept Prototype:** If future requirements dictate logical `OR` grouping (e.g., `(A AND B) OR C`), the DOM structure can be updated to wrap rows in grouping containers (`<div class="rule-group">`). The `generateAST` method would recursively parse each group, reducing the rows within the group via `AND`, and reducing the groups themselves via `OR`.