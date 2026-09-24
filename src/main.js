import { generateProblemSet, answerRange, OPERATOR_MAP } from './model/Generator.js';
import { State, normalizeSettings } from './model/State.js';
import { fitCheck, formatNumber } from './model/Layout.js';
import { Storage } from './services/Storage.js';
import { GridRenderer } from './view/GridRenderer.js';
import { RuleBuilder } from './view/RuleBuilder.js';
import { PracticeView } from './view/PracticeView.js';
import { Analytics } from './analytics.js';

const PRACTICE_COUNT = 20;

// Changing one of these needs a new set of problems; anything else only redraws
const REGENERATE_ON = ['operator', 'numDigits', 'numRows', 'numCols', 'avoidCarrying', 'avoidBorrowing'];

const OPERATION_NOTES = {
    '×': 'Multiplication has no extra options. Use a custom rule to limit how big answers get.',
    '÷': 'Division always divides evenly, never divides by 0 or 1, and never divides a number by itself.'
};

const $ = id => document.getElementById(id);

const Main = {
    init() {
        this.form = $('settings');
        this.rules = new RuleBuilder({
            list: $('rule-list'),
            template: $('rule-row-template'),
            addButton: $('btn-add-rule'),
            empty: $('rules-empty'),
            intro: $('rules-intro'),
            error: $('rule-error'),
            errorText: $('rule-error-text'),
            removeLastButton: $('btn-remove-last-rule')
        }, () => this.handleRulesChange());
        this.rules.setRows(Storage.loadRules());

        this.practice = new PracticeView(() => {
            this.newSet();
            this.startPractice(true);
        });

        State.settings = Storage.loadSettings();
        this.syncForm();
        this.bindEvents();
        this.generate();
        this.route();
    },

    bindEvents() {
        this.form.addEventListener('submit', (e) => e.preventDefault());

        // Rule rows live inside the form but report through RuleBuilder's onChange
        this.form.addEventListener('change', (e) => {
            if (!e.target.closest('#rule-list')) this.handleSettingsChange(e.target);
        });

        // − / + stepper buttons
        this.form.addEventListener('click', (e) => {
            const button = e.target.closest('[data-step]');
            if (!button) return;
            const input = $(button.getAttribute('aria-controls'));
            input.value = Number(input.value) + Number(button.dataset.step);
            this.handleSettingsChange(input);
        });

        document.querySelectorAll('input[name="previewMode"]').forEach(radio => {
            radio.addEventListener('change', () => {
                State.previewMode = radio.value;
                this.render();
            });
        });

        document.querySelectorAll('.js-new-set').forEach(button => button.addEventListener('click', () => this.newSet()));
        document.querySelectorAll('.js-print').forEach(button => button.addEventListener('click', () => window.print()));

        window.addEventListener('hashchange', () => this.route());
    },

    /** Writes State.settings into the form, including values that were clamped. */
    syncForm() {
        const s = State.settings;
        const f = this.form.elements;
        f.operator.value = s.operator;
        f.numDigits.value = String(s.numDigits);
        f.numRows.value = s.numRows;
        f.numCols.value = s.numCols;
        f.fontSize.value = s.fontSize;
        f.avoidCarrying.checked = s.avoidCarrying;
        f.avoidBorrowing.checked = s.avoidBorrowing;
        f.includeKey.checked = s.includeKey;
    },

    readForm() {
        const f = this.form.elements;
        return {
            operator: f.operator.value,
            numDigits: f.numDigits.value,
            numRows: f.numRows.value,
            numCols: f.numCols.value,
            fontSize: f.fontSize.value,
            avoidCarrying: f.avoidCarrying.checked,
            avoidBorrowing: f.avoidBorrowing.checked,
            includeKey: f.includeKey.checked
        };
    },

    handleSettingsChange(target) {
        const before = State.settings;
        const settings = normalizeSettings(this.readForm());
        // Carry/borrow options only exist for + and −
        if (settings.operator !== '+') settings.avoidCarrying = false;
        if (settings.operator !== '-') settings.avoidBorrowing = false;
        State.settings = settings;
        this.syncForm();
        Storage.saveSettings(settings);

        if (target.type === 'checkbox') {
            const on = settings[target.id];
            Analytics.trackEvent(`setting-${target.id}-${on ? 'enabled' : 'disabled'}`, `Constraint: ${target.id} turned ${on ? 'on' : 'off'}`);
        } else if (target.name === 'operator') {
            Analytics.trackEvent(`operator-${settings.operator}-selected`, `Operator: ${settings.operator}`);
        }

        if (REGENERATE_ON.some(key => before[key] !== settings[key])) this.generate();
        else this.render();
    },

    handleRulesChange() {
        Storage.saveRules(this.rules.readRows());
        this.generate();
    },

    newSet() {
        const { numRows, numCols, numDigits, operator } = State.settings;
        Analytics.trackEvent('worksheet-generated', `Generated ${numRows * numCols} ${operator} problems (${numDigits} digits)`);
        this.generate();
    },

    /** Makes a new set of problems. If the rules can't be met, keeps the last set that worked. */
    generate() {
        const { numRows, numCols } = State.settings;
        const settings = { ...State.settings, customRules: this.rules.generateAST() };

        try {
            State.currentProblems = generateProblemSet(numRows * numCols, settings);
            // Rendering uses the settings these problems were made with, so a failed
            // generation later can't pair old problems with a new operator or title
            State.currentSettings = { ...State.settings };
            State.generationFailed = false;
        } catch (error) {
            console.error(error);
            State.generationFailed = true;
        }
        this.render();
    },

    render() {
        const settings = State.settings;
        const failed = State.generationFailed;

        let errorMessage = '';
        if (failed) {
            const [low, high] = answerRange(settings.numDigits, settings.operator);
            const name = OPERATOR_MAP[settings.operator].title.toLowerCase();
            errorMessage = `With ${settings.numDigits}-digit ${name}, answers run from about ${formatNumber(low)} to ${formatNumber(high)}. `
                + 'Change a number in a rule, remove a rule, or choose different digits.';
        }
        this.rules.setError(errorMessage);
        $('staleNotice').hidden = !failed;
        $('preview').classList.toggle('is-stale', failed);

        $('carryLabel').hidden = settings.operator !== '+';
        $('borrowLabel').hidden = settings.operator !== '-';
        $('opNote').hidden = !OPERATION_NOTES[settings.operator];
        $('opNote').textContent = OPERATION_NOTES[settings.operator] ?? '';
        $('maxNum').textContent = formatNumber(10 ** settings.numDigits - 1);
        $('totalProblems').textContent = settings.numRows * settings.numCols;

        const fit = fitCheck(settings);
        $('fitWarn').hidden = fit.fits;
        $('fitText').textContent = fit.message;

        if (!State.currentSettings) return; // nothing has generated yet
        // Problems keep the operator, digits and grid they were made with; size and key follow the form
        const shown = { ...State.currentSettings, fontSize: settings.fontSize, includeKey: settings.includeKey };
        GridRenderer.render(State.currentProblems, shown, State.previewMode);
    },

    route() {
        const practice = location.hash === '#practice';
        $('builder').hidden = practice;
        $('practice').hidden = !practice;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.view === (practice ? 'practice' : 'worksheet')) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });

        if (practice) this.startPractice(false);
        else this.practice.stop();
        window.scrollTo(0, 0);
    },

    /** Practice uses the first 20 problems of the worksheet. Restarts only when the worksheet changed, unless forced. */
    startPractice(force) {
        if (!State.currentSettings) {
            location.hash = '#worksheet';
            return;
        }
        if (!force && this.practiceSource === State.currentProblems) {
            this.practice.resume();
            return;
        }
        this.practiceSource = State.currentProblems;
        const problems = State.currentProblems.slice(0, PRACTICE_COUNT).map((problem, i) => ({ ...problem, n: i + 1 }));
        this.practice.start(problems, State.currentSettings);
        Analytics.trackEvent('practice-started', `Practice: ${problems.length} problems`);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Main.init();
});
