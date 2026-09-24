import { OPERATOR_MAP } from '../model/Generator.js';
import { formatNumber } from '../model/Layout.js';

const PHONE_PREVIEW_COUNT = 12; // must match the nth-child rule in styles.css

export function sheetTitle({ numDigits, operator }) {
    return `${numDigits}-Digit ${OPERATOR_MAP[operator].title} Window Cards`;
}

/** Inner HTML for one grid cell. The worksheet leaves the answer row empty but keeps its height. */
export function cellHTML(problem, n, symbol, withAnswer) {
    return `<span class="cell-n">${n}</span>`
        + '<div class="wc">'
        + `<span></span><span>${formatNumber(problem.num1)}</span>`
        + `<span class="wc-op">${symbol}</span><span>${formatNumber(problem.num2)}</span>`
        + '<span class="wc-rule"></span>'
        + `<span class="wc-answer">${withAnswer ? formatNumber(problem.result) : ''}</span>`
        + '</div>';
}

function fillGrid(grid, problems, symbol, withAnswer) {
    grid.innerHTML = problems.map((problem, i) =>
        `<div class="cell">${cellHTML(problem, i + 1, symbol, withAnswer)}</div>`).join('');
}

export const GridRenderer = {
    /**
     * Draws both A4 pages (worksheet and answer key) and the preview toolbar text.
     * @param {Object} settings  settings the problems were made with, plus the current fontSize/includeKey
     * @param {'worksheet'|'key'} previewMode which page shows on screen; print uses includeKey
     */
    render(problems, settings, previewMode) {
        const { numRows, numCols, fontSize, operator, includeKey } = settings;
        const { symbol } = OPERATOR_MAP[operator];
        const title = sheetTitle(settings);
        const total = problems.length;

        const root = document.documentElement.style;
        root.setProperty('--rows', numRows);
        root.setProperty('--cols', numCols);
        root.setProperty('--wc-card-size', `${fontSize}pt`);

        document.title = title;
        document.getElementById('mainTitle').textContent = title;
        document.getElementById('keyTitle').textContent = `Answer key — ${title}`;
        document.getElementById('keyKind').textContent = includeKey ? 'Answer key · Page 2' : 'Answer key';
        document.querySelectorAll('.sheet-total').forEach(el => { el.textContent = total; });

        fillGrid(document.getElementById('cardContainer'), problems, symbol, false);
        fillGrid(document.getElementById('cardContainerKey'), problems, symbol, true);

        document.getElementById('sheet-worksheet').classList.toggle('is-shown', previewMode !== 'key');
        document.getElementById('sheet-key').classList.toggle('is-shown', previewMode === 'key');
        document.body.classList.toggle('print-key', includeKey);

        document.querySelectorAll('.preview-title').forEach(el => { el.textContent = title; });
        document.getElementById('previewMeta').textContent =
            `${numRows} × ${numCols} · ${total} problems · ${fontSize} pt · A4 portrait`;
        document.getElementById('previewMore').textContent = total > PHONE_PREVIEW_COUNT
            ? `Showing ${PHONE_PREVIEW_COUNT} of ${total}. The full sheet prints on one A4 page.`
            : 'The full sheet prints on one A4 page.';

        const printLabel = includeKey ? 'Print 2 pages' : 'Print 1 page';
        document.querySelectorAll('.print-label').forEach(el => { el.textContent = printLabel; });
    }
};
