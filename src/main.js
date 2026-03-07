import { generateProblemSet } from './model/Generator.js';
import { State } from './model/State.js';
import { Storage } from './services/Storage.js';
import { GridRenderer } from './view/GridRenderer.js';
import { Analytics } from './analytics.js';
import { RuleBuilder } from './view/RuleBuilder.js';

const builder = new RuleBuilder('rule-list', 'rule-row-template', 'btn-add-rule');

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
            State.settings[id] = parseInt(val);
        } else {
            State.settings[id] = val;
        }

        if (id === 'operator') {
            this.updateVisibility();
        }

        // Analytics Event Tracking
        if (target.type === 'checkbox') {
            Analytics.trackEvent(`setting-${id}-${val ? 'enabled' : 'disabled'}`, `Constraint: ${id} turned ${val ? 'on' : 'off'}`);
        } else if (id === 'operator') {
            Analytics.trackEvent(`operator-${val}-selected`, `Operator: ${val}`);
        }

        // Save settings immediately
        Storage.saveSettings(State.settings);

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
        const { numRows, numCols, numDigits, operator } = State.settings;
        const totalProblems = numRows * numCols;

        // Capture Custom Rules from the RuleBuilder UI
        const customAST = builder.generateAST();
        if (customAST) {
            State.settings.customRules = customAST;
        } else {
            delete State.settings.customRules;
        }

        try {
            State.currentProblems = generateProblemSet(totalProblems, State.settings);

            // Analytics Tracking
            Analytics.trackEvent('worksheet-generated', `Generated ${totalProblems} ${operator} problems (${numDigits} digits)`);

            this.render();
        } catch (error) {
            console.error(error);
            alert("Constraints are too strict. Could not generate enough valid problems. Try changing the settings, softening constraints, or using larger numbers.");
        }
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
