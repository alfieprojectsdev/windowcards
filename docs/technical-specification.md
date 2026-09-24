# Technical Specification: Math Window Cards Generator

## 1. Introduction

The **Math Window Cards Generator** is a client-side web application that generates printable arithmetic worksheets and on-screen practice drills. It targets A4 print layouts and offers an interactive "Practice Mode" for students.

## 2. System Architecture

The application uses a **Modular MVC** architecture based on ES Modules with no build step (see `docs/architecture/decisions/0001-use-vanilla-stack.md`). It must be served over HTTP; opening `index.html` from disk does not load the modules.

### 2.1 File Structure
-   `index.html`: Entry point. Imports `src/main.js` as a module. Holds the `<template>` for custom rule rows.
-   `styles.css`: Screen and print presentation.
-   `src/model/`:
    -   `State.js`: Runtime state, default settings, setting limits and `normalizeSettings()`.
    -   `Generator.js`: Builds candidate problems and the rule AST for the current settings.
    -   `RuleEngine.js`: Evaluates a rule AST against one candidate problem.
-   `src/view/`:
    -   `GridRenderer.js`: Builds the card DOM, sets CSS variables and the page title.
    -   `RuleBuilder.js`: The Custom Constraints panel. `rowsToAST()` turns rule rows into an AST.
-   `src/services/`:
    -   `Storage.js`: `localStorage` access for settings and custom rule rows.
-   `src/analytics.js`: GoatCounter event wrapper.
-   `src/main.js`: Controller that wires inputs to state, generation and rendering.
-   `tests/`: `node --test` suites for the model, storage and the pure parts of the views.

## 3. Data Structures & State Management

### 3.1 Runtime State
`State` in `src/model/State.js` holds:

-   `settings`: `numRows`, `numCols`, `numDigits`, `fontSize`, `operator`, `avoidCarrying`, `avoidBorrowing`, plus `customRules` (the AST from the rule builder) while generating.
-   `practiceMode (boolean)`: Worksheet view (answers hidden/shown) or Practice view (input boxes).
-   `currentProblems (Array<Object>)`: The generated set, kept so toggling Practice Mode doesn't regenerate.
    ```javascript
    { num1: number, num2: number, result: number }
    ```

Every settings change goes through `normalizeSettings()`, which parses strings, clamps numbers to `LIMITS` and replaces anything unparseable with the default:

| Setting | Range |
| --- | --- |
| `numRows`, `numCols` | 1–20 |
| `numDigits` | 1–6 |
| `fontSize` | 8–36 pt |

### 3.2 Key Algorithms

#### Problem generation
`generateValidProblem(digits, ast, operator)` uses rejection sampling, up to 1,000 attempts per problem:
1.  Build a candidate:
    -   **Addition, multiplication:** two random `digits`-digit numbers.
    -   **Subtraction:** two random numbers, larger one on top.
    -   **Division:** built backwards. Pick a divisor `b` from 2 to 10^ceil(digits/2) − 1, then a quotient `q ≥ 2` that makes `q × b` a `digits`-digit number. The dividend is `q × b`, so there is never a remainder.
2.  Compute the result and put `{ a, b, op, result, digits_a, digits_b }` in a context object.
3.  Evaluate the rule AST against the context. Return the problem if it passes.

If no candidate passes after 1,000 attempts it throws, and `main.js` shows an alert and keeps the previous worksheet. Digits outside 1–6 throw a `RangeError` immediately.

#### Rule AST
`buildASTFromSettings()` ANDs together the operator's built-in rules (subtraction: `a ≥ b`; division: no remainder, `b > 1`, `a ≠ b`), the carry/borrow checkboxes and the custom rules. Node types are listed in `RuleEngine.evaluate()`.

#### Constraint checking
-   **Carrying:** Pads both numbers to the same length and checks each column. If any column's digits sum to 10 or more, there is a carry.
-   **Borrowing:** Same padding. If any column's top digit is smaller than its bottom digit, there is a borrow.

### 3.3 Persistence
`localStorage` keeps preferences between sessions.
-   **Settings:** one key per setting (`numRows`, `numCols`, `numDigits`, `fontSize`, `operator`, `avoidCarrying`, `avoidBorrowing`). Values are normalized on both save and load, so a bad stored value (such as `"NaN"` from older versions) loads as the default.
-   **Custom rules:** key `customRules`, a JSON array of `{ field, operator, valueType, value }` rows. Unreadable JSON loads as no rules; invalid rows are skipped by `rowsToAST()`.
-   Settings are saved on every input change; rules are saved on every rule edit or removal.

## 4. UI/UX Design

### 4.1 Grid Output
-   The grid uses `CSS Grid` with `repeat(var(--card-cols), var(--card-width))`.
-   `--card-width` is set in `ch` from the longest line on any card (operands, rule line or answer) plus 1ch. `.cards` has the same font size as the cards, so `ch` is measured in the card font and digits don't clip at any font size.
-   A grid wider than the screen scrolls inside its own box instead of widening the page.

### 4.2 Print Optimization
-   Context: Teachers print these on A4 paper.
-   `@media print`:
    -   Hides controls (`.controls`) and the tip.
    -   Reveals header (`Name`, `Grade`, `Date`).
    -   Removes gaps for ink economy.
    -   Enforces `page-break-inside: avoid` on cards.

## 5. Future Considerations
-   **Performance:** Rejection sampling with strict custom rules (for example, a narrow Result range on 6-digit problems) can hit the 1,000-attempt limit. Constructive generation for common rules, or a Web Worker, would avoid blocking the main thread.
-   **Error display:** The "too strict" message is a browser `alert()`; an inline message would be clearer.
