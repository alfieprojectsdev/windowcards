# Math Window Cards Generator

A web-based worksheet generator for elementary math practice (addition, subtraction, multiplication, division). Designed for teachers who need printable worksheets and students who want online practice.

**Live Demo:** [alfieprojectsdev.github.io/windowcards](https://alfieprojectsdev.github.io/windowcards/)

---

## What It Does

- Generates customizable math problem grids (up to 10×10 per page)
- Supports four operations: `+  −  ×  ÷`
- Optional constraints: avoid carrying (addition) or borrowing (subtraction)
- **Interactive practice mode** — students can type answers online with instant feedback
- Print-friendly A4 layout with answer key toggle
- Remembers your last-used settings

---

## Quick Start
 
### For Worksheets (Print)
1. Open the app in your browser (Live Demo)
2. Choose operation, grid size, and digit count
3. Click **Generate** to create problems
4. Click **Toggle Answers** to hide solutions
5. Click **Print** for worksheets
 
**Printing Tips:**
- Use A4 paper, portrait orientation
- Hide answers before printing the worksheet
- Show answers and reprint for the answer key
 
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
 
---
 
## Current Limitations
 
- Division problems sometimes generate trivial cases (e.g., `55 ÷ 55`)
- Answer key prints on the same page as problems (no separate sheet option)
- No progress tracking yet (number of problems solved, accuracy %)
 
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

**Key Features:**
- Uses `localStorage` to save preferences
- Dynamic title updates (e.g., "4-Digit Addition Window Cards")
- Font size and grid layout adjust for screen and print
- Constraint validation with visual warnings (⚠ marker)
- Practice mode preserves problems when toggling between modes

---

## Roadmap

**Next (v4.1):**
- [ ] Custom constraint rules (teacher-defined patterns via dropdown UI)
- [ ] Smarter division problem generation
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