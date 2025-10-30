# Changelog

All notable changes to Math Window Cards Generator will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Planned
- Interactive practice mode (students answer online with instant feedback)
- Custom constraint rules (teacher-defined "trivial problem" patterns via dropdown UI)
- Smarter division problem generation (avoid more trivial cases)
- Separate answer key page option
- Mobile-optimized touch input
- Progress tracking (problems solved, accuracy %)

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