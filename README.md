# Math Window Cards Generator

A web-based worksheet generator for elementary math practice (addition, subtraction, multiplication, division). Designed for teachers who need printable worksheets and students who want online practice.

**Live Demo:** [alfieprojectsdev.github.io/windowcards](https://alfieprojectsdev.github.io/windowcards/)

---

## What It Does

- Generates customizable math problem grids (up to 20×20; a 10×10 grid fits one A4 page at 8–10pt)
- Supports four operations: `+  −  ×  ÷`
- Optional constraints: avoid carrying (addition) or borrowing (subtraction)
- Custom rules such as "Result less than 100" or "Operand A greater than Operand B"
- **Interactive practice mode** — students can type answers online with instant feedback
- Print-friendly A4 layout with answer key toggle
- Remembers your last-used settings

---

## Quick Start
 
### For Worksheets (Print)
1. Open the app in your browser (Live Demo)
2. Choose operation, grid size, and digit count
3. Click **Generate** to create problems
4. Click **Print** for the worksheet (answers start hidden)
5. Click **Toggle Answers**, then **Print** again for the answer key

**Printing Tips:**
- Use A4 paper, portrait orientation
- Changing any setting generates a new set, so print the answer key before changing anything
 
### For Practice (Online)
1. Generate problems (or use existing worksheet)
2. Click **Practice Mode**
3. Type answers in the input boxes
4. Answers turn **green** (correct) or **red** (incorrect) as you type
5. Click **Exit Practice Mode** to return to worksheet view
 
### Running Locally
Since the project uses ES Modules, you must serve it via a local web server (opening `index.html` directly will not work).
 
```bash
npx serve .
# or
python3 -m http.server
```

### Running the Tests
The tests use Node's built-in test runner (Node 20 or later). There is nothing to install.

```bash
npm test
```
 
---
 
## Current Limitations
 
- Answer key prints on the same page as problems (no separate sheet option)
- No progress tracking yet (number of problems solved, accuracy %)
- If the constraints can't be met, the app shows a browser alert and keeps the previous worksheet
 
---
 
## Technical Details
 
**Architecture:**
- Modular MVC structure (ES Modules)
- **Model**: `src/model/` (Logic & Data)
- **View**: `src/view/` (Grid Rendering)
- **Service**: `src/services/` (Persistence)
- **Controller**: `src/main.js` (Orchestration)
 
**Files:**
- `index.html` — Entry point
- `styles.css` — Responsive layout + print styles
- `src/` - Application source code
- `tests/` - Unit tests for the rules engine, generator, settings and rule builder

**Key Features:**
- Uses `localStorage` to save preferences and custom rules; invalid values are clamped or reset to defaults
- Dynamic title updates (e.g., "4-Digit Addition Window Cards"). For division, the digit count is the dividend's; the divisor has at most half as many digits, rounded up
- Card width follows the longest number on the sheet and the chosen font size
- Every problem is checked against all active rules before it's shown
- Practice mode preserves problems when toggling between modes

---

## Roadmap

**Done:**
- [x] Custom constraint rules (teacher-defined patterns via dropdown UI)
- [x] Smarter division problem generation (no remainders, no `÷ 1`, no `n ÷ n`)

**Next:**
- [ ] Separate answer key page option

**Future:**
- [ ] Mobile-optimized touch input
- [ ] Progress tracking (problems solved, accuracy, time)
- [ ] Shareable preset links for teachers
- [ ] Score summary at end of practice session

---

## Development Context

Built for **San Vicente Elementary School (Quezon City, Philippines)** to support classrooms with limited device access. Teachers requested a tool that works equally well on paper and screen.

Inspired by discussions in ["Why People Hate Math"](https://www.youtube.com/watch?v=xvOkXXprG2g) by *Answer in Progress*.

---

## Contributing

This is a learning project built while studying freeCodeCamp's [Certified Full Stack Developer Curriculum](https://www.freecodecamp.org/learn/full-stack-developer/). Feedback and suggestions welcome via GitHub Issues.

---

## License

MIT