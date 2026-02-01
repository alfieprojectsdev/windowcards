import { generateProblemSet } from './model/Generator.js';
import { State } from './model/State.js';
import { Storage } from './services/Storage.js';
import { GridRenderer } from './view/GridRenderer.js';

const Main = {
    init() {
        this.loadSettings();
        this.initUI();
        this.generate(); // Initial generation on load
    },

    loadSettings() {
        const saved = Storage.loadSettings();
        // Merge saved settings into State
        Object.assign(State.settings, saved);
    },

    initUI() {
        // 1. Populate inputs from State.settings
        const ids = ["numRows", "numCols", "numDigits", "fontSize", "operator", "avoidCarrying", "avoidBorrowing"];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (typeof State.settings[id] === 'boolean') {
                el.checked = State.settings[id];
            } else {
                el.value = State.settings[id];
            }

            // Add Change Listeners to update State and re-generate/render
            el.addEventListener('change', (e) => this.handleInputChange(id, e.target));
        });

        // 2. Attach Button Listeners
        // We can't use onclick=generate() in HTML anymore because scope is module-level (private).
        // so we need to attach listeners here.
        // However, existing buttons have onclick attributes. We should ideally remove them in HTML
        // and attach IDs.
        // For now, let's attach to the buttons by their text content or position or just override window.generate
        // To be clean, we'll attach to window for backward compat with HTML onclicks OR select them.
        // The plan said "Attach event listeners".
        // Let's rely on selecting buttons. The HTML buttons call global functions.
        // We will Expose functions to window for compatibility with existing HTML onclick attributes,
        // OR we will update HTML to remove onclick handlers and add IDs. 
        // The plan said "Update index.html". I will likely update index.html to remove onclicks and use IDs.
        // But to be safe and robust, I'll attach handlers to buttons with specific text or add data-attributes.

        // Actually, looking at index.html, buttons invoke: generate(), toggleAnswers(), togglePracticeMode(), window.print()
        // I should expose these to window to minimize HTML changes if I want, or better, 
        // select them. But they don't have IDs.
        // I will use querySelector based on their onclick attribute to find them and addEventListener,
        // then remove the onclick attribute. 
        // Or simpler: Just assign window.generate = ... 

        // Let's go with the cleaner module approach: assign to window for now to match the existing button calls,
        // but the plan implies a cleaner MVC. 
        // I'll stick to binding to window for the "migration" step to be least disruptive to HTML structure unless I edit HTML heavily.
        // Wait, I am editing index.html anyway to switch to module. 
        // So I will expose `window.generate`, `window.toggleAnswers`, `window.togglePracticeMode`.

        window.generate = () => this.generate();
        window.toggleAnswers = () => this.toggleAnswers();
        window.togglePracticeMode = () => this.togglePracticeMode();

        // Also need to handle operator visibility logic
        this.updateVisibility();

        // Practice mode input checking delegation
        document.getElementById('cardContainer').addEventListener('input', (e) => this.checkAnswer(e));
    },

    handleInputChange(id, target) {
        const val = target.type === 'checkbox' ? target.checked : target.value;

        // Parse numbers
        if (target.type === 'number' || (target.tagName === 'SELECT' && !isNaN(parseInt(val)) && id !== 'operator')) {
            // operator is string, others are numbers usually. 
            // Start IDs: numRows, numCols, numDigits, fontSize are numbers.
            State.settings[id] = parseInt(val);
        } else {
            State.settings[id] = val;
        }

        if (id === 'operator') {
            this.updateVisibility();
        }

        // Save settings immediately
        Storage.saveSettings(State.settings);

        // If it's a visual setting that doesn't need re-gen (like toggle answers), handle it.
        // But most inputs here affect generation.
        this.generate();
    },

    updateVisibility() {
        const op = State.settings.operator;
        const carryBox = document.getElementById("avoidCarrying");
        const borrowBox = document.getElementById("avoidBorrowing");
        const carryLabel = document.getElementById("carryLabel");
        const borrowLabel = document.getElementById("borrowLabel");

        if (op === '+') {
            carryBox.disabled = false;
            carryLabel.classList.remove("disabled");
            if (document.getElementById("operator").value !== op) {
                // Sync DOM if needed, but we rely on DOM to trigger change.
            }
        } else {
            carryBox.disabled = true;
            carryBox.checked = false;
            carryLabel.classList.add("disabled");
            State.settings.avoidCarrying = false;
        }

        if (op === '-') {
            borrowBox.disabled = false;
            borrowLabel.classList.remove("disabled");
        } else {
            borrowBox.disabled = true;
            borrowBox.checked = false;
            borrowLabel.classList.add("disabled");
            State.settings.avoidBorrowing = false;
        }
    },

    generate() {
        // 1. Update State from DOM to be sure (or rely on listeners).
        // Listeners are safer. 

        const { numRows, numCols } = State.settings;
        const totalProblems = numRows * numCols;

        // 2. Generate Data
        State.currentProblems = generateProblemSet(totalProblems, State.settings);

        // 3. Render
        this.render();
    },

    render() {
        const container = document.getElementById('cardContainer');
        GridRenderer.updateCSSVariables(State.settings);
        GridRenderer.updateTitle(State.settings);
        GridRenderer.renderGrid(State.currentProblems, container, State.practiceMode);
    },

    toggleAnswers() {
        GridRenderer.toggleAnswers();
    },

    togglePracticeMode() {
        State.practiceMode = !State.practiceMode;
        // Update button text
        // We need to find the button. It had onclick="togglePracticeMode()"
        const btn = document.querySelector('button[onclick="togglePracticeMode()"]');
        if (btn) {
            btn.textContent = State.practiceMode ? 'Exit Practice Mode' : 'Practice Mode';
        }
        this.render();
    },

    checkAnswer(e) {
        if (!e.target.classList.contains('answer-input')) return;

        const userAnswer = parseInt(e.target.value.replace(/,/g, ''));
        const correctAnswer = parseInt(e.target.dataset.answer);

        e.target.classList.remove('correct', 'incorrect');

        if (!e.target.value) return;

        if (userAnswer === correctAnswer) {
            e.target.classList.add('correct');
        } else {
            e.target.classList.add('incorrect');
        }
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    Main.init();
});
