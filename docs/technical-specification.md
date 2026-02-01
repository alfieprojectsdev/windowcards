# Technical Specification: Math Window Cards Generator

## 1. Introduction

The **Math Window Cards Generator** is a client-side web application designed to generate printable arithmetic worksheets and precise practice drills. It emphasizes high-fidelity print layouts (A4) and offers an interactive "Practice Mode" for students.

## 2. System Architecture

The application checks the "Vanilla Stack" architecture (see `ADR-001`). It follows a monolithic client-side pattern where state and logic are tightly coupled with the DOM.

### 2.1 File Structure
-   `index.html`: Entry point. Contains the Control Panel (Inputs/Buttons) and the Output Grid (`#cardContainer`).
-   `styles.css`: Handles all visual presentation, including complex Print logic using `@media print` and CSS Variables for dynamic resizing.
-   `script.js`: Contains all application logic, event handlers, and generation algorithms.

## 3. Data Structures & State Management

### 3.1 Runtime State
State is managed via global variables (implicit module scope) and DOM attributes.

-   `practiceMode (boolean)`: Toggles between Worksheet view (answers hidden/shown) and Practice view (input fields).
-   `currentProblems (Array<Object>)`: Stores the generated dataset to persist across re-renders (e.g., when toggling Practice Mode).
    ```javascript
    {
      num1: number,
      num2: number,
      result: number,
      obeyedConstraint: boolean // false if constraints were violated (marked with ⚠)
    }
    ```

### 3.2 Key Algorithms

#### Random Operand Generation
The core logic resides in `getRandomOperands(digits, operator)`.
-   **Strategy**: Rejection Sampling.
-   **Flow**:
    1.  Generate random `a` and `b` within the digit range ($10^{d-1}$ to $10^d - 1$).
    2.  Check operator-specific validity:
        -   **Subtraction**: Ensure $a \ge b$ (swap if needed).
        -   **Division**: Ensure $a \% b == 0$ and $a \ne b$ (non-trivial).
    3.  Check User Constraints (Carrying/Borrowing):
        -   If `avoidCarrying` is true, reject pairs where `causesCarrying(a, b)` returns true.
        -   Loop until valid or constraints satisfied.

#### Constraint Checking
-   **Carrying**: Iterates from least significant digit to most significant. If $digit_a + digit_b \ge 10$, return true.
-   **Borrowing**: Iterates digits. If $digit_a < digit_b$, return true.

### 3.3 Persistence
`localStorage` is used to persist user preferences between sessions.
-   **Keys**: `numRows`, `numCols`, `numDigits`, `fontSize`, `operator`, `avoidCarrying`, `avoidBorrowing`.
-   **Pattern**: Settings are saved on every generation event and loaded on `window.onload`.

## 4. UI/UX Design

### 4.1 Responsive Grid Output
-   The grid uses `CSS Grid` with `repeat(var(--card-cols), var(--card-width))`.
-   CSS Variables (`--card-font-size`, `--card-width`) are calculated in JS based on user preferences to ensure fit.

### 4.2 Print Optimization
-   Context: Teachers print these on A4 paper.
-   `@media print`:
    -   Hides controls (`.controls`).
    -   Reveals header (`Name`, `Grade`, `Date`).
    -   Removes gaps and shadows for ink economy.
    -   Enforces `page-break-inside: avoid` on cards.

## 5. Future Considerations (v4.1+)
-   **Custom Constraints**: The current hardcoded rejection sampling will be replaced by a rules engine (as designed in `constraint_rules_design.md`).
-   **Performance**: Heavy rejection sampling (e.g., finding non-carrying 6-digit sums) may block the main thread. Future versions may need Web Workers or optimized generation strategies.
