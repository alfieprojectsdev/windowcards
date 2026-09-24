// A4 portrait at 96 dpi with 0.5 cm margins, minus the name/title header
const USABLE_WIDTH_PX = 756;
const USABLE_HEIGHT_PX = 1015;
const PX_PER_PT = 96 / 72;

export function formatNumber(n) {
    return n.toLocaleString('en-US');
}

/** The widest operand, second operand and answer a sheet with these settings can contain. */
export function largestNumbers(numDigits, operator) {
    const max = 10 ** numDigits - 1;
    switch (operator) {
        case '+': return { a: max, b: max, result: 2 * max };
        case '-': return { a: max, b: max, result: max };
        case '×': return { a: max, b: max, result: max * max };
        // Matches Generator: N-digit dividend, divisor up to ceil(N/2) digits, quotient >= 2
        case '÷': return { a: max, b: 10 ** Math.ceil(numDigits / 2) - 1, result: Math.floor(max / 2) };
        default: throw new RangeError(`Unknown operator: ${operator}`);
    }
}

/**
 * Estimates whether a rows × cols grid of window cards fits on one A4 page at `fontSize` pt.
 * Card width: widest line in characters × 0.6em (tabular digits) + cell padding.
 * Card height: about 4.3 lines at 1.2 line height + the problem number and padding.
 * @returns {{ fits: boolean, message: string }} message is empty when it fits
 */
export function fitCheck({ numDigits, operator, numRows, numCols, fontSize }) {
    const { a, b, result } = largestNumbers(numDigits, operator);
    const chars = Math.max(formatNumber(a).length, formatNumber(b).length + 2, formatNumber(result).length);

    const cardWidth = pt => chars * 0.6 * pt * PX_PER_PT + 10;
    const cardHeight = pt => 4.3 * 1.2 * pt * PX_PER_PT + 18;
    const fitsAt = pt => cardWidth(pt) <= USABLE_WIDTH_PX / numCols && cardHeight(pt) <= USABLE_HEIGHT_PX / numRows;

    if (fitsAt(fontSize)) return { fits: true, message: '' };

    let bestPt = null;
    for (let pt = fontSize - 1; pt >= 8; pt--) {
        if (fitsAt(pt)) { bestPt = pt; break; }
    }
    const maxCols = Math.max(1, Math.floor(USABLE_WIDTH_PX / cardWidth(fontSize)));

    let message = `At ${fontSize} pt, a ${numRows} × ${numCols} grid won’t fit on one A4 page. `;
    message += bestPt ? `Try ${bestPt} pt` : 'Try fewer columns';
    message += bestPt && maxCols < numCols ? ` or ${maxCols} columns.` : '.';
    return { fits: false, message };
}
