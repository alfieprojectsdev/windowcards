# Changelog

All notable changes to Math Window Cards Generator will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Redesign (from the Claude Design handoff "Math Window Cards Redesign")

#### Added
- **Teacher builder**: five numbered settings groups (Operation, Digits per number, Grid size, Printing, Custom rules) beside a live A4 preview. There's no Generate step; every change redraws the page. On phones the settings stack above a 12-card preview with a sticky New set / Print bar.
- **Answer key as page 2**: a separate A4 page with a forced page break, on by default ("Print the answer key as page 2"). The preview switches between Worksheet and Answer key.
- Name, Grade & Section, Date and Score lines on every sheet, and a small problem number in each cell to match the key.
- **Fit check**: when a grid won't fit on one A4 page at the chosen number size, the Printing group says so and suggests a size or column count.
- **Too-strict rules** show an inline message with the real answer range (for example "answers run from about 0 to 85") and a "Remove last rule" button, instead of `alert()`. The preview keeps the last set that worked.
- **Practice**: uses the first 20 problems of the worksheet. Answers are checked on Enter or when leaving the box, never mid-typing. Feedback is an icon plus "Correct" / "Not yet". A score screen shows correct, not yet and right-first-try counts, the missed problems, and "Practise the N I missed".
- **Phone practice**: one problem at a time with a 64px answer box and the number keypad (`inputmode="numeric"`), Skip / Check / Next, and a column hint for wrong addition and subtraction answers, e.g. "Check the ones column — 7 + 8 is more than 10."
- Archivo font, self-hosted in `fonts/` (Latin subset, weights 400–800, 35 KB) with a system-font fallback.

#### Changed
- Grid rows and columns are limited to 1–10, the most that fits on one A4 page (was 1–20).
- Custom rules read as sentences: "Answer · is less than · the number… · 100". "Compare with" lists the number box and the three fields in one dropdown; rules saved in the old format are converted on load.
- "Generate" and "New Problems" are merged into **New set**. "Toggle Answers" is replaced by the Worksheet / Answer key preview switch.
- `worksheet-generated` analytics now fire only when New set is clicked, not on every setting change. New event: `practice-started`.
- Numbers always use `1,234` separators, whatever the device's locale.

---

### Added
- **Custom Constraints panel** (`da3c86e`): teachers add rows such as "Result less than 100" or "Operand A greater than Operand B". Rules are saved in `localStorage` and the grid regenerates when a rule changes.
- Unit tests in `tests/`, run with `npm test` (Node's built-in runner, no dependencies).
- `LICENSE` file (MIT, as the README already stated).

### Changed
- An N-digit division problem now has an N-digit dividend and a divisor of at most ceil(N/2) digits. Before, a 4-digit division sheet produced 8-digit dividends such as `53,645,568 ÷ 9,111`.
- Grid rows and columns are limited to 1–20 (was 1–100).
- The "Field" option in a custom rule is now a dropdown of Operand A / Operand B / Result instead of a text box.
- Card width is computed from the longest number on the sheet instead of from the column count.
- ADR 0002 moved from the repo root to `docs/architecture/decisions/`; ADRs 0002 and 0003 marked Accepted.

### Fixed
- Custom rules on **Result** always compared against `null`, so "Result < 10" let everything through and "Result > 10" always failed.
- Typing 0 in Digits with Division froze the tab.
- Clearing a number box saved `NaN` to `localStorage` and left the page blank, even after a reload. All settings are now clamped to their limits and invalid values reset to the default.
- Cards clipped digits at larger font sizes because the column width was measured in the page font, not the card font.
- Every card started with an empty line.
- The screen tip and README said to toggle answers off before printing, but answers start hidden.

### Removed
- The ⚠ "constraint violated" marker. Every problem passes all rules before it's shown, so the marker could never appear.
- `notes.md` (early requirements notes, now covered by this changelog) and `docs/WEB_CLAUDE_INSTRUCTIONS.md` (an agent handoff note describing features this app doesn't have).

### Planned
- Progress tracking across sessions (problems solved, accuracy %)

---

## Unversioned changes between 3.0.0 and 4.1.0

These shipped without a changelog entry:
- Interactive practice mode: students type answers and see green/red feedback (`0b3955c`, 2025-10-30)
- GoatCounter pageview analytics (`fddae07`, 2025-10-30)
- Refactor from a single `script.js` into ES modules under `src/` (`6d9866b`, 2026-02-01)

---

## [4.1.0] - 2026-03-07

### Added
- **AST Rules Engine**: Decoupled validation logic from generation logic via a JSON-based rule engine.
- Math constraints are now dynamically evaluated based on UI properties.
- **Teacher Guide**: Added `docs/teacher-guide.md` covering the new constraints system.

### Changed
- Refactored `src/model/Generator.js` to utilize the new abstract syntax tree rules mapping instead of procedural logic.
- Optimized the pseudo-random generation loop by factoring in division and subtraction clamping bounds prior to executing the AST condition testing.

### Fixed
- Re-seeded Division operands to securely exclude zeros and prevent infinite remainders loops.
- Re-ordered Subtraction random bounds to correctly force Operand A as maximum natively, eliminating 50% candidate waste.
- Added firm upper limit bounds on max-attempts loops with manual visual `alert()` triggers instead of silent hanging.

---

## [3.0.0] - 2025-07-12

### Added
- **Multi-operation support**: Addition, Subtraction, Multiplication, Division
- **Operation-specific constraints**:
  - "Avoid Carrying" toggle (addition only)
  - "Avoid Borrowing" toggle (subtraction only)
- Dynamic page title updates based on operation (e.g., "4-Digit Multiplication Window Cards")
- Visual warning markers (⚠) when generated problems violate active constraints
- Disabled state styling for irrelevant constraint checkboxes
- GitHub Pages deployment link in README

### Changed
- Reorganized controls into two rows: inputs (top) + action buttons (bottom)
- Improved constraint validation logic for subtraction (ensures positive results)
- Division now avoids some trivial cases (e.g., `a ÷ a`)

### Fixed
- Layout shift when switching between operators
- Print alignment issues with answer overlay

**Commits:**
- `8a7d548` - Update README.md (included deployment link)
- `932952e` - Add full operator support with constraint toggles and responsive UI layout

---

## [1.0.0] - 2025-06-25

### Added
- Initial release: 4-Digit Addition Window Cards Generator
- Adjustable number of problems (grid size)
- Adjustable operand size (1–4 digits)
- Comma separators for numbers ≥ 1,000
- Toggle show/hide answers (screen only, hidden in print)
- Printer-friendly A4 layout
- Addition operation only
- LocalStorage integration (remembers last-used settings)
- Dynamic `<h1>` title generation (e.g., "3-Digit Addition Window Cards")
- Adjustable font size control (8pt minimum for 10×10 grids on A4)
- Extended digit range: supports 1–6 digits (up to 999,999)
- Print-only header: `Name: ____ Grade: ____ Date: ____`
- Horizontal equals line under operands for clearer visual alignment
- Modular codebase split into: `index.html`, `styles.css`, `script.js`
- Font size adapts for both screen and A4 print layouts

**Commits:**
- `9751fa0` - Add initial implementation with features, usage instructions, and styling

---

## Context

**Built for:** San Vicente Elementary School, Quezon City, Philippines  
**Purpose:** Support classrooms with limited device access through printable worksheets  
**Development Stage:** Learning project during career transition (geodetic data analysis → web development)