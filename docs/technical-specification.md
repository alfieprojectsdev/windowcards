# Technical Specification: Math Window Cards Generator

## 1. Introduction

The **Math Window Cards Generator** is a client-side web application that generates printable arithmetic worksheets and on-screen practice drills. It targets A4 print layouts and offers an interactive "Practice Mode" for students.

## 2. System Architecture

The application uses a **Modular MVC** architecture based on ES Modules with no build step (see `docs/architecture/decisions/0001-use-vanilla-stack.md`). It must be served over HTTP; opening `index.html` from disk does not load the modules.

### 2.1 File Structure
-   `index.html`: Entry point. The builder (settings form, preview, both A4 sheets), the practice section, and the `<template>` for rule rows. Imports `src/main.js` as a module.
-   `styles.css`: Design tokens on `:root` (`--wc-*`), components, the phone layout and the print layer.
-   `fonts/archivo-latin-var.woff2`: Archivo, Latin subset, variable weight 400–800, with the `tnum` feature for tabular digits.
-   `src/model/`:
    -   `State.js`: Runtime state, default settings, setting limits and `normalizeSettings()`.
    -   `Generator.js`: Builds candidate problems and the rule AST for the current settings.
    -   `RuleEngine.js`: Evaluates a rule AST against one candidate problem.
    -   `Layout.js`: `formatNumber()` (always en-US separators), `largestNumbers()` and `fitCheck()` for the one-page warning.
    -   `PracticeSession.js`: Answer parsing and scoring for one practice run.
    -   `Hints.js`: `columnHint()` for wrong addition and subtraction answers.
-   `src/view/`:
    -   `GridRenderer.js`: Fills both A4 sheets (worksheet and answer key), sets `--rows`, `--cols`, `--wc-card-size` and the titles.
    -   `RuleBuilder.js`: The "05 Custom rules" group, including its empty state and "too strict" message. `rowsToAST()` turns rule rows into an AST.
    -   `PracticeView.js`: The practice grid, the one-at-a-time phone view and the score screen.
    -   `icons.js`: Lucide icons as inline SVG strings.
-   `src/services/`:
    -   `Storage.js`: `localStorage` access for settings and custom rule rows.
-   `src/analytics.js`: GoatCounter event wrapper.
-   `src/main.js`: Controller that wires inputs to state, generation and rendering.
-   `tests/`: `node --test` suites for the model, storage and the pure parts of the views.

## 3. Data Structures & State Management

### 3.1 Runtime State
`State` in `src/model/State.js` holds:

-   `settings`: `numRows`, `numCols`, `numDigits`, `fontSize`, `operator`, `avoidCarrying`, `avoidBorrowing`, `includeKey`.
-   `previewMode`: `'worksheet'` or `'key'`, which sheet the screen preview shows.
-   `generationFailed`: the latest settings couldn't produce a full set; the rules group shows the "too strict" message.
-   `currentProblems (Array<Object>)`: The generated set, shared by both sheets and by practice.
    ```javascript
    { num1: number, num2: number, result: number }
    ```
-   `currentSettings`: A copy of the settings that produced `currentProblems`. Rendering uses its operator, digits and grid size, so if a later generation fails, the old problems keep their own operator and title. Number size and `includeKey` always come from the current settings, because they don't change the problems.

Every settings change goes through `normalizeSettings()`, which parses strings, clamps numbers to `LIMITS` and replaces anything unparseable with the default:

| Setting | Range |
| --- | --- |
| `numRows`, `numCols` | 1–10 |
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

If no candidate passes after 1,000 attempts it throws. `main.js` then keeps the previous worksheet, dims the preview, and the rules group shows the answer range from `answerRange()` (400 unfiltered samples) so the teacher can see why the rules can't be met. Digits outside 1–6 throw a `RangeError` immediately.

#### Rule AST
`buildASTFromSettings()` ANDs together the operator's built-in rules (subtraction: `a ≥ b`; division: no remainder, `b > 1`, `a ≠ b`), the carry/borrow checkboxes and the custom rules. Node types are listed in `RuleEngine.evaluate()`.

#### Fit check
`fitCheck()` estimates a card as the widest line in characters × 0.6 em (tabular digits) + 10px, and 4.3 lines × 1.2 line height + 18px tall, then compares that with a cell of the 756 × 1015 px printable area (A4 at 96 dpi, 0.5 cm margins, minus the header). If it doesn't fit, the message suggests the largest point size that does, or fewer columns.

#### Practice and hints
`PracticeSession` keeps each item's typed value and status (`unchecked`, `correct`, `wrong`). Editing an answer sets it back to `unchecked`, and checking an unchanged answer again does nothing, so Enter followed by the blur it causes counts once. The first check sets "right first try".

`columnHint()` finds the first column from the right where the typed answer differs from the correct one. For addition, if that digit is one short and a carry came into the column, the hint names the column the carry came from. For subtraction it points at a column that needed a borrow, or one that lent 1 and wasn't reduced. Otherwise it names the column.

#### Constraint checking
-   **Carrying:** Pads both numbers to the same length and checks each column. If any column's digits sum to 10 or more, there is a carry.
-   **Borrowing:** Same padding. If any column's top digit is smaller than its bottom digit, there is a borrow.

### 3.3 Persistence
`localStorage` keeps preferences between sessions.
-   **Settings:** one key per setting (`numRows`, `numCols`, `numDigits`, `fontSize`, `operator`, `avoidCarrying`, `avoidBorrowing`, `includeKey`). Values are normalized on both save and load, so a bad stored value (such as `"NaN"` from older versions) loads as the default.
-   **Custom rules:** key `customRules`, a JSON array of `{ field, operator, valueType, value }` rows, where `valueType` is `literal` or a field name (`a`, `b`, `result`). Rows saved before the redesign as `{ valueType: 'reference', value: 'b' }` are converted on load. Unreadable JSON loads as no rules; invalid rows are skipped by `rowsToAST()`.
-   Practice progress is not saved.
-   Settings are saved on every input change; rules are saved on every rule edit or removal.

## 4. UI/UX Design

The look follows the "Modernist" system from the Claude Design handoff: Archivo, flat ink on a light ground (`--wc-ground` #f3f2f2), 2px rules between groups, zero radius, and one red accent (`--wc-accent-strong` #dd2b0f) for the single primary button per screen. Accent text uses #ae1800 (6.4:1). Every practice state has an icon and a word, so nothing depends on red alone.

### 4.1 Layout
-   **960px and wider:** a 380px settings column beside the preview, which shows one A4 sheet at real size (210 × 297 mm).
-   **Under 960px:** settings stack above a preview that reflows into cards of at least 96px, showing the first 12, with a sticky New set / Print bar.
-   **Practice under 600px:** one problem per screen; the top bar is hidden.
-   Screen-only layout rules are wrapped in `@media screen`, because a printed A4 page is narrower than 960px and would otherwise pick up the phone layout.

### 4.2 Sheets and print
-   Each sheet is a flex column: the name/grade/date/score header, the title row, then `.sheet-grid` with `repeat(var(--cols), minmax(0, 1fr))` columns and `repeat(var(--rows), minmax(0, 1fr))` rows, so rows stretch to fill the page and leave room to write.
-   A window card (`.wc`) is a two-column inline grid (operator, digits) with the rule and answer spanning both, right-aligned with tabular digits.
-   `@media print` hides everything except the sheets, gives each sheet a fixed 286 mm height and `break-after: page`, and hides the answer-key sheet unless `body.print-key` is set.
-   The preview shows one sheet at a time (`.is-shown`); print ignores that and prints both.

## 5. Future Considerations
-   **Performance:** Rejection sampling with strict custom rules (for example, a narrow Answer range on 6-digit problems) can hit the 1,000-attempt limit. Constructive generation for common rules, or a Web Worker, would avoid blocking the main thread.
-   **Practice history:** sessions aren't saved; progress tracking across sessions would need a storage format.
