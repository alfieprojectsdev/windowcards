import { OPERATOR_MAP } from '../model/Generator.js';

export const GridRenderer = {
    formatNumber(num) {
        return num.toLocaleString();
    },

    /** The three text lines of a card (operands and rule line), without the answer. */
    cardText({ num1, num2 }, symbol) {
        const num1Str = this.formatNumber(num1);
        const num2Str = this.formatNumber(num2);
        const maxLength = Math.max(num1Str.length, num2Str.length);
        return [
            num1Str.padStart(maxLength + 2),
            `${symbol}${num2Str.padStart(maxLength + 1)}`,
            ` ${'='.repeat(maxLength + 2)}`
        ].join('\n');
    },

    /**
     * Column width in `ch` that fits the longest line of any card, plus 1ch for padding.
     * `ch` is the width of "0" in the card font; commas and spaces are narrower, so this never clips.
     */
    cardWidthCh(problems, symbol) {
        let widest = 0;
        problems.forEach(problem => {
            const lines = this.cardText(problem, symbol).split('\n');
            lines.push(this.formatNumber(problem.result));
            lines.forEach(line => { widest = Math.max(widest, line.length); });
        });
        return widest + 1;
    },

    updateCSSVariables(settings, problems) {
        const { numCols, fontSize, operator } = settings;

        let cardPadding = '0.25rem';
        if (fontSize <= 8) cardPadding = '0.05rem';
        else if (fontSize <= 10) cardPadding = '0.2rem';

        const widthCh = this.cardWidthCh(problems, OPERATOR_MAP[operator].symbol);

        document.documentElement.style.setProperty('--card-font-size', `${fontSize}pt`);
        document.documentElement.style.setProperty('--card-width', `${widthCh}ch`);
        document.documentElement.style.setProperty('--card-padding', cardPadding);
        document.documentElement.style.setProperty('--card-cols', numCols);
    },

    updateTitle(settings) {
        const { numDigits, operator } = settings;
        const title = document.getElementById("mainTitle");
        const opLabel = OPERATOR_MAP[operator]?.title || 'Math';
        title.textContent = `${numDigits}-Digit ${opLabel} Window Cards`;
    },

    toggleAnswers() {
        document.querySelectorAll('.card').forEach(card => card.classList.toggle('show-answer'));
    },

    renderGrid(problems, container, isPracticeMode, operator) {
        container.innerHTML = '';
        const { symbol } = OPERATOR_MAP[operator];

        problems.forEach(problem => {
            const card = document.createElement('div');
            card.className = 'card';

            let answer;
            if (isPracticeMode) {
                answer = document.createElement('input');
                answer.type = 'text';
                answer.className = 'answer-input';
                answer.dataset.answer = problem.result;
                answer.placeholder = '?';
            } else {
                answer = document.createElement('div');
                answer.className = 'answer';
                answer.textContent = this.formatNumber(problem.result);
            }

            card.append(this.cardText(problem, symbol), answer);
            container.appendChild(card);
        });
    }
};
