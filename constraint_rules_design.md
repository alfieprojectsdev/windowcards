# Custom Constraint Rules - Design Document

**Feature:** Teacher-defined rules to exclude specific problem patterns from generated worksheets

**Target Users:** Elementary teachers who understand which problem types are "too easy" or pedagogically unhelpful

**Design Goal:** Simple text-based syntax that non-programmers can write and understand

---

## 1. Core Syntax Design

### Basic Pattern Structure

```
[operand_pattern] [operator] [operand_pattern]
```

**Operand patterns:**
- `n` = any number in the current digit range
- `0`, `1`, `5`, etc. = specific numbers
- `1-10` = range (future enhancement)

**Operators:**
- `+` (addition)
- `−` or `-` (subtraction, accept both)
- `×` or `*` (multiplication, accept both)
- `÷` or `/` (division, accept both)

---

## 2. Pattern Examples by Operation

### Addition
```
n+0        # Avoid adding zero (e.g., 234 + 0)
0+n        # Avoid zero as first operand (auto-generated if n+0 is used)
n+1        # Avoid adding one
1+n        # Auto-generated from n+1
```

**Auto-symmetry rule:** Any commutative operation (+ or ×) automatically generates the swapped version unless explicitly disabled.

---

### Subtraction
```
n-0        # Avoid subtracting zero (e.g., 567 - 0)
n-1        # Avoid subtracting one
n-n        # Avoid same number (e.g., 45 - 45 = 0) [advanced]
```

**Note:** `0-n` is already prevented by the "ensure positive result" constraint in current code.

---

### Multiplication
```
1×n        # Avoid multiplying by one (e.g., 1 × 789)
n×1        # Auto-generated from 1×n
0×n        # Avoid multiplying by zero
10×n       # Avoid multiplying by 10 (trivial place value shift)
n×10       # Auto-generated from 10×n
```

---

### Division
```
n÷1        # Avoid dividing by one (e.g., 456 ÷ 1)
n÷n        # Avoid same number (e.g., 78 ÷ 78 = 1)
1÷n        # Avoid one as dividend [rare but valid]
n÷10       # Avoid dividing by 10 (trivial place value shift)
```

---

## 3. Advanced Patterns (Phase 2)

### Range-Based Constraints
```
1-10×n     # Avoid multipliers between 1 and 10
n×1-10     # Same as above (auto-generated)
n÷2-5      # Avoid divisors between 2 and 5
```

### Relational Constraints
```
a<10×b     # Only allow problems where first operand < 10 × second
a÷b<5      # Only allow division where quotient < 5
```

### Composite Rules (Phase 3)
```
(n÷10 OR n÷100)    # Avoid dividing by any power of 10
n×[2,5,10]         # Avoid specific set of multipliers
```

---

## 4. Parsing Strategy

### Step 1: Tokenization
Break each line into components:
```javascript
"1×n" → { left: "1", op: "×", right: "n" }
"n÷10" → { left: "n", op: "÷", right: "10" }
```

### Step 2: Pattern Type Classification
```javascript
const patternTypes = {
  LITERAL_LEFT: /^\d+[×÷+−]\s*n$/,     // "5×n"
  LITERAL_RIGHT: /^n\s*[×÷+−]\d+$/,    // "n÷10"
  BOTH_LITERAL: /^\d+\s*[×÷+−]\d+$/,   // "1÷1" (rare)
  BOTH_VARIABLE: /^n\s*[×÷+−]n$/,      // "n÷n"
};
```

### Step 3: Rule Generation
```javascript
function createRule(left, op, right) {
  return {
    operation: normalizeOp(op), // Convert *, / to ×, ÷
    checkFn: (a, b) => {
      if (left !== 'n' && a === parseInt(left)) return true;
      if (right !== 'n' && b === parseInt(right)) return true;
      if (left === 'n' && right === 'n' && a === b) return true;
      return false;
    },
    description: `${left} ${op} ${right}`
  };
}
```

### Step 4: Auto-Symmetry for Commutative Ops
```javascript
function expandSymmetric(rule) {
  if (!['+', '×'].includes(rule.operation)) return [rule];
  
  // If pattern is "1×n", also create "n×1"
  const swapped = { ...rule };
  swapped.checkFn = (a, b) => rule.checkFn(b, a);
  swapped.description = `${rule.right} ${rule.operation} ${rule.left}`;
  
  return [rule, swapped];
}
```

---

## 5. User Interface Design (Revised - Keyboard-Friendly)

### Layout - Single Rule Builder
```
┌─────────────────────────────────────────────────────┐
│ ⚙ Advanced: Custom Rules                            │ ← <details> collapsible
├─────────────────────────────────────────────────────┤
│ Avoid Trivial Problems                              │
│                                                      │
│ ┌───────┐  ┌────────┐  ┌───────┐                   │
│ │ n  ▾  │  │  *  ▾  │  │ 1     │  [+ Add Rule]     │
│ └───────┘  └────────┘  └───────┘                   │
│  Left      Operator    Right                        │
│  operand               operand                      │
│                                                      │
│ Active Rules:                                       │
│  • n * 1   (auto-includes: 1 * n)      [Remove]    │
│  • n / 1                                [Remove]    │
│  • n / n                                [Remove]    │
│                                                      │
│ Tip: Use * and / on your keyboard (they'll convert  │
│      to × and ÷ when you add the rule)              │
└─────────────────────────────────────────────────────┘
```

### Dropdown Options

**Left/Right Operand Dropdown:**
```html
<select id="leftOperand">
  <option value="n">n (any number)</option>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="5">5</option>
  <option value="10">10</option>
  <option value="custom">Custom number...</option>
</select>
```

**Operator Dropdown:**
```html
<select id="operator">
  <option value="+">+ (addition)</option>
  <option value="-">− (subtraction)</option>
  <option value="*">× (multiplication)</option>
  <option value="/"÷ (division)</option>
</select>
```

**Custom Number Input (appears when "Custom number..." selected):**
```html
<input type="number" id="customValue" 
       placeholder="Enter number" 
       style="display: none;" />
```

---

## 5a. HTML Implementation

```html
<details class="advanced-options">
  <summary>⚙ Advanced: Custom Rules</summary>
  
  <p class="section-label">Avoid Trivial Problems</p>
  
  <div class="rule-builder">
    <select id="leftOperand" class="operand-select">
      <option value="n">n (any number)</option>
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="custom">Custom number...</option>
    </select>
    
    <select id="ruleOperator" class="operator-select">
      <option value="+">+ (addition)</option>
      <option value="-">− (subtraction)</option>
      <option value="*">× (multiplication)</option>
      <option value="/">÷ (division)</option>
    </select>
    
    <select id="rightOperand" class="operand-select">
      <option value="n">n (any number)</option>
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="custom">Custom number...</option>
    </select>
    
    <input type="number" id="customLeft" class="custom-input" 
           placeholder="number" style="display: none;" />
    <input type="number" id="customRight" class="custom-input" 
           placeholder="number" style="display: none;" />
    
    <button onclick="addRule()">+ Add Rule</button>
  </div>
  
  <div id="activeRules" class="active-rules">
    <p class="rules-label">Active Rules:</p>
    <div id="rulesList"></div>
  </div>
  
  <p class="keyboard-tip">
    💡 Tip: Dropdowns convert * → × and / → ÷ automatically
  </p>
</details>
```

---

## 5b. JavaScript Implementation

```javascript
// Store active rules
let customRules = [];

// Symbol mapping for display
const SYMBOL_MAP = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};

// Handle custom number input visibility
document.getElementById('leftOperand').addEventListener('change', (e) => {
  const customInput = document.getElementById('customLeft');
  customInput.style.display = e.target.value === 'custom' ? 'inline-block' : 'none';
});

document.getElementById('rightOperand').addEventListener('change', (e) => {
  const customInput = document.getElementById('customRight');
  customInput.style.display = e.target.value === 'custom' ? 'inline-block' : 'none';
});

// Add a new rule
function addRule() {
  const leftSelect = document.getElementById('leftOperand');
  const rightSelect = document.getElementById('rightOperand');
  const opSelect = document.getElementById('ruleOperator');
  
  // Get operand values (handle custom inputs)
  let leftValue = leftSelect.value;
  if (leftValue === 'custom') {
    leftValue = document.getElementById('customLeft').value;
    if (!leftValue) {
      alert('Please enter a custom number for the left operand');
      return;
    }
  }
  
  let rightValue = rightSelect.value;
  if (rightValue === 'custom') {
    rightValue = document.getElementById('customRight').value;
    if (!rightValue) {
      alert('Please enter a custom number for the right operand');
      return;
    }
  }
  
  const operator = opSelect.value;
  
  // Create rule object
  const rule = {
    left: leftValue,
    operator: operator,
    right: rightValue,
    displayOp: SYMBOL_MAP[operator]
  };
  
  // Check for duplicates
  const ruleString = `${leftValue}${operator}${rightValue}`;
  if (customRules.some(r => `${r.left}${r.operator}${r.right}` === ruleString)) {
    alert('This rule already exists');
    return;
  }
  
  // Add to active rules
  customRules.push(rule);
  
  // Add symmetric rule for commutative operations
  if (operator === '+' || operator === '*') {
    const symmetricString = `${rightValue}${operator}${leftValue}`;
    if (!customRules.some(r => `${r.left}${r.operator}${r.right}` === symmetricString)) {
      customRules.push({
        left: rightValue,
        operator: operator,
        right: leftValue,
        displayOp: SYMBOL_MAP[operator],
        isAutoGenerated: true
      });
    }
  }
  
  // Update UI and save
  updateRulesList();
  saveRulesToStorage();
  
  // Reset form
  leftSelect.value = 'n';
  rightSelect.value = '1';
  document.getElementById('customLeft').style.display = 'none';
  document.getElementById('customRight').style.display = 'none';
}

// Remove a rule
function removeRule(index) {
  const removedRule = customRules[index];
  customRules.splice(index, 1);
  
  // Also remove auto-generated symmetric rule if it exists
  if (!removedRule.isAutoGenerated && (removedRule.operator === '+' || removedRule.operator === '*')) {
    const symmetricIndex = customRules.findIndex(r => 
      r.left === removedRule.right && 
      r.right === removedRule.left && 
      r.operator === removedRule.operator &&
      r.isAutoGenerated
    );
    if (symmetricIndex !== -1) {
      customRules.splice(symmetricIndex, 1);
    }
  }
  
  updateRulesList();
  saveRulesToStorage();
}

// Update the rules display
function updateRulesList() {
  const container = document.getElementById('rulesList');
  
  if (customRules.length === 0) {
    container.innerHTML = '<p class="no-rules">No rules added yet</p>';
    return;
  }
  
  container.innerHTML = customRules.map((rule, index) => {
    const autoNote = rule.isAutoGenerated ? ' <span class="auto-note">(auto)</span>' : '';
    return `
      <div class="rule-item">
        <span class="rule-text">
          ${rule.left} ${rule.displayOp} ${rule.right}${autoNote}
        </span>
        <button onclick="removeRule(${index})" class="remove-btn">Remove</button>
      </div>
    `;
  }).join('');
}

// Check if operands violate custom rules
function violatesCustomRules(a, b, operator) {
  // Convert operator to internal format
  const opMap = { '+': '+', '−': '-', '×': '*', '÷': '/' };
  const normalizedOp = opMap[operator] || operator;
  
  return customRules.some(rule => {
    // Only check rules for the current operation
    if (rule.operator !== normalizedOp) return false;
    
    // Check left operand
    const leftMatch = rule.left === 'n' || parseInt(rule.left) === a;
    // Check right operand
    const rightMatch = rule.right === 'n' || parseInt(rule.right) === b;
    
    return leftMatch && rightMatch;
  });
}

// Save rules to localStorage
function saveRulesToStorage() {
  localStorage.setItem('customRules', JSON.stringify(customRules));
}

// Load rules from localStorage
function loadRulesFromStorage() {
  const saved = localStorage.getItem('customRules');
  if (saved) {
    customRules = JSON.parse(saved);
    updateRulesList();
  }
}

// Call on page load
window.addEventListener('DOMContentLoaded', () => {
  loadRulesFromStorage();
});
```

### 🎨 CSS Additions

```css
.advanced-options {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.advanced-options summary {
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  margin-bottom: 1rem;
}

.section-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rule-builder {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.operand-select,
.operator-select {
  padding: 0.4rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.operand-select {
  min-width: 140px;
}

.operator-select {
  min-width: 160px;
}

.custom-input {
  width: 80px;
  padding: 0.4rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.rule-builder button {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.rule-builder button:hover {
  background: #45a049;
}

.active-rules {
  margin-top: 1rem;
}

.rules-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.rule-text {
  font-family: monospace;
  font-size: 1rem;
}

.auto-note {
  font-size: 0.75rem;
  color: #666;
  font-style: italic;
}

.remove-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #da190b;
}

.no-rules {
  font-style: italic;
  color: #666;
  font-size: 0.9rem;
}

.keyboard-tip {
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: #e3f2fd;
  border-radius: 3px;
  border-left: 3px solid #2196F3;
}

/* Print: hide custom rules UI */
@media print {
  .advanced-options {
    display: none;
  }
}
```

---

## 7. Validation & Error Handling

### Syntax Validation Rules
1. Each line must contain exactly one operator
2. Operands must be either `n` or a valid number
3. Operator must be one of: `+ - − × * ÷ /`
4. No whitespace-only lines (auto-skip)
5. Maximum 20 rules per worksheet (performance limit)

### Runtime Constraints
```javascript
const MAX_RULES = 20;
const MAX_GENERATION_ATTEMPTS = 1000;

function validateRuleSet(rules) {
  if (rules.length > MAX_RULES) {
    return { 
      valid: false, 
      error: `Too many rules (${rules.length}). Maximum is ${MAX_RULES}.` 
    };
  }
  
  // Check if rules are too restrictive
  const testSet = generateTestProblems(10, rules);
  if (testSet.failures > 5) {
    return {
      valid: false,
      error: "Rules are too restrictive. Try fewer constraints."
    };
  }
  
  return { valid: true };
}
```

---

## 8. Storage & Persistence

### LocalStorage Schema
```javascript
{
  "trivialPatterns": "1×n\nn÷1\nn÷n",
  "trivialPatternsEnabled": true,
  "lastPresetUsed": "elementary"
}
```

### Load/Save Flow
```javascript
// On page load
function loadSettings() {
  const savedPatterns = localStorage.getItem('trivialPatterns');
  if (savedPatterns) {
    document.getElementById('trivialPatterns').value = savedPatterns;
    validatePatterns(); // Auto-parse on load
  }
}

// On pattern change
document.getElementById('trivialPatterns').addEventListener('blur', () => {
  const patterns = document.getElementById('trivialPatterns').value;
  localStorage.setItem('trivialPatterns', patterns);
});
```

---

## 9. Performance Considerations

### Problem Generation Impact
- Each rule adds one conditional check per generation attempt
- Worst case: 20 rules × 1000 attempts = 20,000 checks
- Mitigation: Cache parsed rules, short-circuit evaluation

### Optimization Strategy
```javascript
// Cache parsed rules to avoid re-parsing on every problem
let cachedRules = null;
let cachedPatternsText = null;

function getParsedRules() {
  const currentText = document.getElementById('trivialPatterns').value;
  
  if (currentText === cachedPatternsText) {
    return cachedRules; // Return cached version
  }
  
  // Re-parse only if text changed
  cachedRules = parseConstraintPatterns(currentText);
  cachedPatternsText = currentText;
  return cachedRules;
}
```

---

## 10. Testing Plan

### Unit Tests (Priority Order)
1. **Pattern parsing:**
   - `"1×n"` → correct rule object
   - `"n÷1"` → correct rule object
   - Invalid syntax → empty rules array

2. **Auto-symmetry:**
   - `"1×n"` generates both `"1×n"` and `"n×1"`
   - `"n÷1"` does NOT generate `"1÷n"` (division not commutative)

3. **Rule application:**
   - Rule `"1×n"` rejects `(1, 5)` and `(5, 1)`
   - Rule `"n÷n"` rejects `(7, 7)`
   - Rule `"n+0"` rejects `(123, 0)` and `(0, 123)`

4. **Edge cases:**
   - Empty textarea → no rules, no errors
   - 100 rules → validation error
   - Conflicting rules → last rule wins (or flag warning)

### Integration Tests
1. Generate 100 problems with rule `"1×n"` → verify none have operand = 1
2. Generate 100 problems with rules `"1×n", "n÷1", "n÷n"` → verify all constraints respected
3. Measure generation time with 0, 5, 10, 20 rules

### User Acceptance Tests
1. Teacher enters `"1×n"` → sees "✓ 2 rules (multiplication: 1×n, n×1)"
2. Teacher enters invalid syntax → sees helpful error
3. Teacher generates worksheet → no flagged problems violate rules

---

## 11. Documentation for Teachers

### In-App Help Text
```
📘 Pattern Examples:

• 1×n    Avoids problems like "1 × 456" (too easy)
• n÷1    Avoids problems like "789 ÷ 1" (no work needed)
• n÷n    Avoids problems like "23 ÷ 23 = 1" (always equals 1)
• 10×n   Avoids problems like "10 × 34" (just add a zero)

Tips:
- Use 'n' to mean "any number"
- One pattern per line
- Patterns for + and × automatically apply both ways
```

### README Section
```markdown
## Custom Constraint Rules

Teachers can define patterns to exclude from worksheets:

**Examples:**
- `1×n` — Avoid multiplying by 1
- `n÷1` — Avoid dividing by 1
- `n÷n` — Avoid same-number division

Patterns use `n` to represent "any number" in your chosen digit range.
Addition and multiplication patterns automatically apply in both orders
(e.g., `1×n` also prevents `n×1`).
```

---

## 12. Future Enhancements (Phase 3+)

### Export/Import Rule Sets
```javascript
// Export as JSON
function exportRules() {
  const rules = {
    name: "My Custom Rules",
    created: new Date().toISOString(),
    patterns: document.getElementById('trivialPatterns').value.split('\n')
  };
  downloadJSON(rules, 'math-rules.json');
}

// Import from JSON
function importRules(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const rules = JSON.parse(e.target.result);
    document.getElementById('trivialPatterns').value = rules.patterns.join('\n');
    validatePatterns();
  };
  reader.readAsText(file);
}
```

### Rule Impact Preview
```
Your rules will exclude approximately:
  • 12% of possible multiplication problems
  • 8% of possible division problems

Estimated valid problems: ~880 out of 1000
```

### Collaborative Rule Library
- Teacher-submitted rule sets (via GitHub Issues or form)
- Curated collection: "Grade 3 Basics", "Intermediate Challenge", etc.
- Voting/rating system for community presets

---

## 13. Implementation Checklist (Revised for Dropdown UI)

### Phase 1: MVP (Week 1)
- [ ] Add collapsible `<details>` section to HTML
- [ ] Create three-dropdown rule builder (left operand, operator, right operand)
- [ ] Add "Custom number..." option with conditional text input
- [ ] Implement `addRule()` function with duplicate checking
- [ ] Implement auto-symmetry for `+` and `*` operators
- [ ] Create active rules list display with remove buttons
- [ ] Integrate `violatesCustomRules()` check into `getRandomOperands()`
- [ ] Add localStorage save/load for rules
- [ ] Add CSS styling for rule builder and active rules list
- [ ] Test with 5 common rule patterns

### Phase 2: Polish (Week 2)
- [ ] Add preset rule buttons (e.g., "Elementary Friendly" adds common rules)
- [ ] Improve visual feedback when rule is added
- [ ] Add confirmation dialog for "Remove All Rules" button
- [ ] Show rule count in collapsed summary (e.g., "⚙ Custom Rules (3 active)")
- [ ] Add keyboard shortcuts (Enter to add rule, Escape to cancel)
- [ ] Performance test with 20 active rules
- [ ] Update README with screenshots of new UI
- [ ] Mobile responsive testing

### Phase 3: Advanced (Week 3+)
- [ ] Export/import rules as JSON file
- [ ] "Copy rules as text" button (for sharing via email)
- [ ] Rule impact preview: "~12% of problems excluded"
- [ ] Highlight generated problems that barely passed constraints
- [ ] Add "Edit rule" functionality (currently only add/remove)
- [ ] Batch operations: "Remove all multiplication rules"

---

## 14. Open Questions for Teacher Feedback

1. **Syntax preference:** Is `1×n` intuitive, or would `avoid 1 as multiplier` be clearer?
2. **Preset usefulness:** Which preset rule sets would be most helpful?
3. **Visual feedback:** Should violated rules show a count (e.g., "2 problems flagged")?
4. **Rule strictness:** What should happen if constraints are impossible to satisfy?

---

## 15. Success Metrics

**Adoption:**
- % of teachers who use custom rules (track via localStorage flag)
- Average number of rules per user

**Usability:**
- % of rule sets with syntax errors (lower is better)
- Time to first successful rule creation

**Impact:**
- Teacher feedback: "Does this feature save you time?"
- Problem quality: "Are generated worksheets more pedagogically useful?"

---

## Appendix A: Complete Regex Reference

```javascript
const PATTERN_REGEX = {
  // Basic patterns
  literalLeft: /^(\d+)\s*([×÷+−*\/])\s*n$/,       // "5×n"
  literalRight: /^n\s*([×÷+−*\/])\s*(\d+)$/,      // "n÷10"
  bothLiteral: /^(\d+)\s*([×÷+−*\/])\s*(\d+)$/,   // "1×1"
  bothVariable: /^n\s*([×÷+−*\/])\s*n$/,          // "n÷n"
  
  // Normalize operators
  operators: {
    '×': /[×*]/g,
    '÷': /[÷\/]/g,
    '−': /[-−]/g,  // Both hyphen and minus sign
    '+': /\+/g
  }
};
```

---

## Appendix B: Example Teacher Workflows

**Workflow 1: First-Time User**
1. Expand "Advanced: Custom Rules"
2. Click "Examples ▾" dropdown
3. Select "Elementary Friendly" preset
4. Click "Generate" → worksheet excludes identity operations

**Workflow 2: Experienced User**
1. Open saved worksheet from last week
2. Add new rule: `10×n` (avoid place value shortcuts)
3. Generate 5 different worksheet versions
4. Print best version for class

**Workflow 3: Sharing Between Teachers**
1. Teacher A creates custom rule set
2. Exports as `grade4-multiplication.json`
3. Shares file via email/drive
4. Teacher B imports and adapts for their class