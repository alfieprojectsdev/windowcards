import { OPERATOR_MAP } from '../model/Generator.js';

export const GridRenderer = {
    formatNumber(num) {
        return num.toLocaleString();
    },

    updateCSSVariables(settings) {
        const { numCols, fontSize } = settings;
        // Layout tuning
        const usableWidthPx = 756;
        const estimatedCardWidthPx = Math.floor(usableWidthPx / numCols);
        const chPerCard = Math.floor(estimatedCardWidthPx / 8);

        let cardPadding = '0.25rem';
        if (fontSize <= 8) cardPadding = '0.05rem';
        else if (fontSize <= 10) cardPadding = '0.2rem';

        document.documentElement.style.setProperty('--card-font-size', `${fontSize}pt`);
        document.documentElement.style.setProperty('--card-width', `${chPerCard}ch`);
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

    renderGrid(problems, container, isPracticeMode) {
        container.innerHTML = '';

        problems.forEach(({ num1, num2, result, obeyedConstraint }) => {
            // Find operator symbol based on logic (reverse lookup or passed in props if needed)
            // For now, we need to know the operator used. 
            // Ideally, the problem object should carry the operator symbol or we pass it.
            // To keep it simple, we'll re-derive or pass it. 
            // Let's pass the operator in the problem or assume standard +,-,*,/ 
            // Actually, problems don't store operator. 
            // We can infer it or we can change Generator to include it.
            // But better: we'll pass the OPERATOR from State.settings in 'main.js' or look it up.
            // Wait, 'currentProblems' in script.js didn't store operator.
            // It used the global 'operator' value. 
            // We should probably pass 'operator' to renderGrid or rely on the fact that 
            // all problems in the set use the same operator.

            // Let's look up the operator from the DOM or passing it is cleaner.
            // We will assume the caller passes the 'operator' needed for display in 'settings' or similar.
            // But verify: renderGrid(problems, container, isPracticeMode) signature in specs.
            // We'll update the signature to accept 'operatorSymbol' or similar.

            // FIX: We need the operator symbol.
            // Let's get it from the inputs since we are in the View and connected to state.
            const operatorVal = document.getElementById('operator').value;
            const opInfo = OPERATOR_MAP[operatorVal];

            const num1Str = this.formatNumber(num1);
            const num2Str = this.formatNumber(num2);
            const resultStr = this.formatNumber(result);
            const maxLength = Math.max(num1Str.length, num2Str.length);
            const equalsLine = '='.repeat(maxLength + 2);

            const card = document.createElement('div');
            card.className = 'card';

            if (isPracticeMode) {
                card.innerHTML = `
${num1Str.padStart(maxLength + 2)}
${opInfo.symbol}${num2Str.padStart(maxLength + 1)}
 ${equalsLine}
<input type="text" class="answer-input" data-answer="${result}" placeholder="?" />
${obeyedConstraint === false ? '<div class="note">⚠</div>' : ''}`;
            } else {
                card.innerHTML = `
${num1Str.padStart(maxLength + 2)}
${opInfo.symbol}${num2Str.padStart(maxLength + 1)}
 ${equalsLine}
<div class="answer">${resultStr}</div>
${obeyedConstraint === false ? '<div class="note">⚠</div>' : ''}`;
            }

            container.appendChild(card);
        });
    }
};
