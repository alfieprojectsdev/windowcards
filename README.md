# Math Window Cards Generator

A web-based worksheet generator for elementary math practice (addition, subtraction, multiplication, division). Designed for teachers who need printable worksheets and students who want online practice.

**Live Demo:** [alfieprojectsdev.github.io/windowcards](https://alfieprojectsdev.github.io/windowcards/)

---

## What It Does

- Generates math problem grids up to 10×10, one A4 page each
- Supports four operations: `+  −  ×  ÷`
- Optional constraints: no carrying (addition) or no borrowing (subtraction)
- Custom rules such as "Answer is less than 100" or "First number is greater than second number"
- Prints the worksheet and, optionally, the answer key as page 2
- **Practice mode**: students type answers and check each one, then see a score and practise the ones they missed
- Remembers your last-used settings and rules

---

## Quick Start

### For Worksheets (Print)
1. Open the app in your browser (Live Demo)
2. Work down the numbered groups on the left: operation, digits, grid size, printing, custom rules
3. The page preview updates as you go. Click **New set** for different problems with the same settings
4. Switch the preview between **Worksheet** and **Answer key** to check it
5. Click **Print 2 pages** (or **Print 1 page** if "Print the answer key as page 2" is off)

**Printing Tips:**
- Use A4 paper, portrait orientation
- If a size won't fit on one page, the Printing group says so and suggests a smaller number size or fewer columns

### For Practice (Online)
1. Make a worksheet, then click **Practice** in the top bar
2. Practice uses the first 20 problems of the worksheet
3. Type an answer and press **Enter** (or move to the next box) to check it. Each answer shows **Correct** or **Not yet** with an icon, so colour isn't needed to read it
4. Click **Finish and see score** for the score, what was missed, and a button to practise just those
5. On a phone, problems come one at a time with a number keypad, and a wrong addition or subtraction answer gets a hint about which column to check

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

- Practice progress isn't saved: reloading the page starts a new session
- Hints cover addition and subtraction only
- Up to 10×10 problems per worksheet (one A4 page)

---

## Technical Details

**Architecture:**
- Modular MVC structure (ES Modules, no build step, no dependencies)
- **Model**: `src/model/` (generation, rules engine, fit check, practice scoring, hints)
- **View**: `src/view/` (A4 sheets, rule builder, practice)
- **Service**: `src/services/` (Persistence)
- **Controller**: `src/main.js` (Orchestration)

**Files:**
- `index.html` — Entry point (builder, practice, rule-row template)
- `styles.css` — Design tokens, components, phone layout and print styles
- `fonts/` — Archivo, self-hosted (Latin subset, 35 KB) so the page works without Google Fonts
- `src/` - Application source code
- `tests/` - Unit tests for the rules engine, generator, settings, layout check, practice scoring, hints and rule builder

**Key Features:**
- Uses `localStorage` to save preferences and custom rules; invalid values are clamped or reset to defaults
- Dynamic title updates (e.g., "4-Digit Addition Window Cards"). For division, the digit count is the dividend's; the divisor has at most half as many digits, rounded up
- Every problem is checked against all active rules before it's shown. If no problem can pass, the rules group explains the real answer range and the preview keeps the last set that worked
- The design follows the "Modernist" style from the Claude Design handoff: flat, zero radius, 2px rules, one red accent

---

## Roadmap

**Done:**
- [x] Custom constraint rules (teacher-defined patterns via dropdown UI)
- [x] Smarter division problem generation (no remainders, no `÷ 1`, no `n ÷ n`)
- [x] Separate answer key page
- [x] Mobile-optimized touch input
- [x] Score summary at end of practice session

**Future:**
- [ ] Progress tracking across sessions (problems solved, accuracy, time)
- [ ] Shareable preset links for teachers

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