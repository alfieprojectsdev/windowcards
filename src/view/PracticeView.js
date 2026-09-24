import { OPERATOR_MAP } from '../model/Generator.js';
import { formatNumber } from '../model/Layout.js';
import { PracticeSession, parseAnswer } from '../model/PracticeSession.js';
import { columnHint } from '../model/Hints.js';
import { icon } from './icons.js';

const escapeHTML = text => text.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const SECONDS_PER_PROBLEM = 20;

const $ = id => document.getElementById(id);

function problemHTML(problem, symbol, withAnswer) {
    return '<span></span>'
        + `<span>${formatNumber(problem.num1)}</span>`
        + `<span class="wc-op">${symbol}</span><span>${formatNumber(problem.num2)}</span>`
        + '<span class="wc-rule"></span>'
        + (withAnswer ? `<span class="wc-answer">${formatNumber(problem.result)}</span>` : '');
}

/** "Problem 9: 47 plus 38" for screen readers */
function spokenProblem(problem, operator) {
    return `Problem ${problem.n}: ${formatNumber(problem.num1)} ${OPERATOR_MAP[operator].spoken} ${formatNumber(problem.num2)}`;
}

/**
 * Student practice. Wide screens show every problem as a card; phones (under 600px, by CSS)
 * show one problem at a time. Both read and write the same PracticeSession.
 */
export class PracticeView {
    /** @param {Function} onNewSet called by the score screen's "New set" button */
    constructor(onNewSet) {
        this.onNewSet = onNewSet;
        this.session = null;
        this.bindEvents();
    }

    bindEvents() {
        const grid = $('cardContainer-practice');

        grid.addEventListener('input', (e) => {
            const i = Number(e.target.dataset.index);
            this.session.setValue(i, e.target.value);
            this.update(i);
        });
        grid.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' || !e.target.classList.contains('answer-input')) return;
            e.preventDefault();
            const i = Number(e.target.dataset.index);
            this.check(i);
            $(`pr-${i + 2}`)?.focus();
        });
        // Leaving a box checks it, but only if something was typed
        grid.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('answer-input')) this.check(Number(e.target.dataset.index));
        });

        $('btn-finish').addEventListener('click', () => this.showSummary());

        const single = $('singleAnswer');
        single.addEventListener('input', () => {
            this.session.setValue(this.session.current, single.value);
            this.update(this.session.current);
        });
        single.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.primaryAction(); }
        });
        $('btn-check').addEventListener('click', () => this.primaryAction());
        $('btn-skip').addEventListener('click', () => this.next());

        $('btn-practise-missed').addEventListener('click', () => {
            this.start(this.session.summary().missed.map(item => item.problem), this.settings);
        });
        $('btn-summary-new').addEventListener('click', () => this.onNewSet());
    }

    /**
     * @param {Array} problems each with n = its number on the worksheet
     * @param {Object} settings the settings the problems were made with
     */
    start(problems, settings) {
        this.session = new PracticeSession(problems);
        this.settings = settings;
        const { operator, numDigits } = settings;
        const { symbol, title } = OPERATOR_MAP[operator];
        this.title = `${numDigits}-Digit ${title}`;

        $('practiceTitle').textContent = this.title;
        $('practice-run').hidden = false;
        $('practice-summary').hidden = true;
        document.body.classList.add('is-practising');

        const segs = n => Array.from({ length: n }, () => '<span class="seg"></span>').join('');
        $('practiceSegs').innerHTML = segs(this.session.total);
        $('singleSegs').innerHTML = segs(this.session.total);
        $('practiceSegs').style.setProperty('--n', this.session.total);
        $('singleSegs').style.setProperty('--n', this.session.total);

        $('cardContainer-practice').innerHTML = this.session.items.map((item, i) => `
            <div class="practice-card" id="pc-${i + 1}">
              <span class="practice-n">${item.problem.n}</span>
              <div class="wc">${problemHTML(item.problem, symbol, false)}</div>
              <label class="vh" for="pr-${i + 1}">${spokenProblem(item.problem, operator)}</label>
              <input id="pr-${i + 1}" class="answer-input" data-index="${i}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="pr-${i + 1}-fb">
              <p class="feedback" id="pr-${i + 1}-fb" aria-live="polite"></p>
            </div>`).join('');

        this.session.items.forEach((_, i) => this.update(i));
        this.renderSingle();
    }

    /** Coming back to the Practice view: carry on where the student left off. */
    resume() {
        if (!$('practice-run').hidden) document.body.classList.add('is-practising');
    }

    stop() {
        document.body.classList.remove('is-practising');
    }

    check(i) {
        this.session.check(i);
        this.update(i);
    }

    // Phone: Check → (Check again) → Next → … → See score
    primaryAction() {
        const { current } = this.session;
        const item = this.session.items[current];
        if (item.status === 'correct') return this.next();
        if (item.value.trim() === '') return $('singleAnswer').focus();
        this.check(current);
    }

    next() {
        this.session.current++;
        if (this.session.current >= this.session.total) {
            this.session.current = this.session.total - 1;
            return this.showSummary();
        }
        this.renderSingle();
        $('singleAnswer').focus();
    }

    /** Refreshes item i in both views, plus the progress counts. */
    update(i) {
        const item = this.session.items[i];
        const correct = item.status === 'correct';
        const wrong = item.status === 'wrong';

        const card = $(`pc-${i + 1}`);
        card.classList.toggle('is-correct', correct);
        card.classList.toggle('is-wrong', wrong);
        const input = $(`pr-${i + 1}`);
        if (input.value !== item.value) input.value = item.value;
        $(`pr-${i + 1}-fb`).innerHTML = correct ? `${icon('check', { strokeWidth: 3 })}<span>Correct</span>`
            : wrong ? `${icon('x', { strokeWidth: 3 })}<span>Not yet — try again</span>` : '';

        [$('practiceSegs'), $('singleSegs')].forEach(segs => {
            const seg = segs.children[i];
            seg.className = `seg${correct ? ' is-correct' : ''}${wrong ? ' is-wrong' : ''}`;
            seg.innerHTML = segs.id === 'practiceSegs' && (correct || wrong)
                ? icon(correct ? 'check' : 'x', { size: 14, strokeWidth: 3 }) : '';
        });

        $('practiceProgress').innerHTML =
            `<strong>${this.session.checkedCount} of ${this.session.total}</strong> checked · ${this.session.correctCount} correct`;
        $('singleCorrect').textContent = `${this.session.correctCount} correct`;

        if (i === this.session.current) this.renderSingleStatus();
    }

    renderSingle() {
        const { current, total, items } = this.session;
        const item = items[current];
        const { operator } = this.settings;

        $('singleCount').textContent = `${current + 1} of ${total}`;
        $('singleProblem').innerHTML = problemHTML(item.problem, OPERATOR_MAP[operator].symbol, false);
        $('singleLabel').textContent = spokenProblem(item.problem, operator);
        $('singleAnswer').value = item.value;
        [...$('singleSegs').children].forEach((seg, i) => seg.classList.toggle('is-current', i === current));
        this.renderSingleStatus();
    }

    renderSingleStatus() {
        const { current, total, items } = this.session;
        const item = items[current];
        const status = $('singleStatus');
        const answer = $('singleAnswer');
        const button = $('btn-check');

        answer.classList.toggle('is-correct', item.status === 'correct');
        answer.classList.toggle('is-wrong', item.status === 'wrong');
        status.hidden = item.status === 'unchecked';
        status.className = `single-status${item.status === 'wrong' ? ' is-wrong' : ''}`;

        if (item.status === 'wrong') {
            const { num1, num2 } = item.problem;
            status.innerHTML = `${icon('x', { size: 24, strokeWidth: 3 })}<div><p class="single-status-title">Not yet</p>`
                + `<p>${columnHint(num1, num2, this.settings.operator, item.value)}</p></div>`;
            button.textContent = 'Check again';
        } else if (item.status === 'correct') {
            status.innerHTML = `${icon('check', { size: 24, strokeWidth: 3 })}<div><p class="single-status-title">Correct</p></div>`;
            button.textContent = current === total - 1 ? 'See score' : 'Next';
        } else {
            status.innerHTML = '';
            button.textContent = 'Check';
        }
    }

    showSummary() {
        const summary = this.session.summary();
        const { correct, total, notYet, firstTry, missed } = summary;
        const { symbol } = OPERATOR_MAP[this.settings.operator];

        $('practice-run').hidden = true;
        $('practice-summary').hidden = false;
        document.body.classList.remove('is-practising');

        $('summaryKicker').textContent = `${this.title} · done`;
        $('summaryScore').innerHTML = `${correct}<span> / ${total}</span>`;
        $('summaryHeadline').textContent = correct === total ? `All ${total} correct.`
            : correct / total >= 0.75 ? `Great work — ${correct} correct.`
            : `${correct} correct. Keep going.`;

        const minutes = Math.ceil(notYet * SECONDS_PER_PROBLEM / 60);
        const count = NUMBER_WORDS[notYet] ?? String(notYet);
        $('summaryNote').textContent = notYet === 0 ? 'Nothing to look at again.'
            : `${count} to look at again. Practising just those takes about ${minutes === 1 ? 'a minute' : `${minutes} minutes`}.`;

        $('btn-practise-missed').hidden = notYet === 0;
        $('practiseMissedLabel').textContent = `Practise the ${notYet} I missed`;
        $('statCorrect').textContent = correct;
        $('statNotYet').textContent = notYet;
        $('statFirstTry').textContent = firstTry;
        $('missedHeading').hidden = notYet === 0;

        const yours = item => {
            if (item.value.trim() === '') return 'No answer';
            const typed = parseAnswer(item.value);
            return `You wrote <s>${typed === null ? escapeHTML(item.value) : formatNumber(typed)}</s>`;
        };
        $('missedCards').innerHTML = missed.map(item => `
            <div class="missed-card">
              <span class="practice-n">Problem ${item.problem.n}</span>
              <div class="wc">${problemHTML(item.problem, symbol, true)}</div>
              <p class="missed-foot"><span>${yours(item)}</span><strong>Answer ${formatNumber(item.problem.result)}</strong></p>
            </div>`).join('');
        $('missedList').innerHTML = missed.map(item => `
            <li>
              <span class="missed-problem">${formatNumber(item.problem.num1)} ${symbol} ${formatNumber(item.problem.num2)}</span>
              <span class="missed-yours">${yours(item).replace('You wrote', 'you wrote').replace('No answer', 'no answer')}</span>
              <strong>= ${formatNumber(item.problem.result)}</strong>
            </li>`).join('');

        $('summaryScore').focus();
    }
}
