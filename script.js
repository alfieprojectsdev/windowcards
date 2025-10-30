let practiceMode = false;
let currentProblems = []; // Add to store problems
// Format a number with comma separators (e.g., 12345 → "12,345")
function formatNumber(num) {
  return num.toLocaleString();
}

// Map operator strings to metadata: symbol, title, and operation function
const OPERATOR_MAP = {
  '+': { symbol: '+', title: 'Addition', op: (a, b) => a + b },
  '-': { symbol: '−', title: 'Subtraction', op: (a, b) => a - b },
  '×': { symbol: '×', title: 'Multiplication', op: (a, b) => a * b },
  '÷': { symbol: '÷', title: 'Division', op: (a, b) => a / b },
};

// Check if a + b causes a carry in any digit
function causesCarrying(a, b) {
  const aStr = a.toString().padStart(b.toString().length, '0');
  const bStr = b.toString().padStart(aStr.length, '0');
  for (let i = aStr.length - 1; i >= 0; i--) {
    if (parseInt(aStr[i]) + parseInt(bStr[i]) >= 10) return true;
  }
  return false;
}

// Check if a - b would require borrowing in any digit
function causesBorrowing(a, b) {
  const aStr = a.toString().padStart(b.toString().length, '0');
  const bStr = b.toString().padStart(aStr.length, '0');
  for (let i = aStr.length - 1; i >= 0; i--) {
    if (parseInt(aStr[i]) < parseInt(bStr[i])) return true;
  }
  return false;
}

// Generate a valid pair of operands depending on the operator and constraints
function getRandomOperands(digits, operator) {
  const max = Math.pow(10, digits) - 1;
  const min = digits > 1 ? Math.pow(10, digits - 1) : 0;
  const avoidCarrying = document.getElementById("avoidCarrying")?.checked;
  const avoidBorrowing = document.getElementById("avoidBorrowing")?.checked;
  let a, b;

  while (true) {
    a = Math.floor(Math.random() * (max - min + 1)) + min;
    b = Math.floor(Math.random() * (max - min + 1)) + min;

    if (operator === '+') {
      if (avoidCarrying && causesCarrying(a, b)) continue;
      return [a, b, avoidCarrying ? !causesCarrying(a, b) : null];
    }

    if (operator === '-') {
      if (a < b) [a, b] = [b, a]; // Ensure positive result
      if (avoidBorrowing && causesBorrowing(a, b)) continue;
      return [a, b, avoidBorrowing ? !causesBorrowing(a, b) : null];
    }

    if (operator === '×') {
      return [a, b, null]; // No constraints applied for multiplication
    }

    if (operator === '÷') {
      // Ensure result is integer, avoid trivial identity (e.g., a ÷ a)
      if (b > 1 && a % b === 0 && a / b <= max && a !== b) return [a, b, null];
    }
  }
}

// Dynamically update the page title with digit count and operation name
function updateTitle(digits, operator) {
  const title = document.getElementById("mainTitle");
  const opLabel = OPERATOR_MAP[operator]?.title || 'Math';
  title.textContent = `${digits}-Digit ${opLabel} Window Cards`;
}

// Save UI settings to localStorage
function saveSettings() {
  const ids = ["numRows", "numCols", "numDigits", "fontSize", "operator", "avoidCarrying", "avoidBorrowing"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    localStorage.setItem(id, el.type === 'checkbox' ? el.checked : el.value);
  });
}

// Load UI settings from localStorage on page load
function loadSettings() {
  const ids = ["numRows", "numCols", "numDigits", "fontSize", "operator", "avoidCarrying", "avoidBorrowing"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    const val = localStorage.getItem(id);
    if (val !== null) {
      el.type === 'checkbox' ? el.checked = (val === 'true') : el.value = val;
    }
  });
  updateTitle(parseInt(document.getElementById("numDigits").value), document.getElementById("operator").value);
}

// Show/hide constraint checkboxes based on current operator
function updateVisibility() {
  const op = document.getElementById("operator").value;
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
  }

  if (op === '-') {
    borrowBox.disabled = false;
    borrowLabel.classList.remove("disabled");
  } else {
    borrowBox.disabled = true;
    borrowBox.checked = false;
    borrowLabel.classList.add("disabled");
  }
}

// Re-render existing problems without generating new ones
function renderProblems() {
  const numRows = parseInt(document.getElementById('numRows').value);
  const numCols = parseInt(document.getElementById('numCols').value);
  const numDigits = parseInt(document.getElementById('numDigits').value);
  const fontSize = parseInt(document.getElementById('fontSize').value);
  const operator = document.getElementById('operator').value;
  const container = document.getElementById('cardContainer');
  const opInfo = OPERATOR_MAP[operator];

  // Same layout calculations as generate()
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

  container.innerHTML = '';

  // Render stored problems
  currentProblems.forEach(({ num1, num2, result, obeyedConstraint }) => {
    const num1Str = formatNumber(num1);
    const num2Str = formatNumber(num2);
    const resultStr = formatNumber(result);
    const maxLength = Math.max(num1Str.length, num2Str.length);
    const equalsLine = '='.repeat(maxLength + 2);

    const card = document.createElement('div');
    card.className = 'card';

    if (practiceMode) {
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

// Generate and render the window card grid
function generate() {
  const numRows = parseInt(document.getElementById('numRows').value);
  const numCols = parseInt(document.getElementById('numCols').value);
  const numDigits = parseInt(document.getElementById('numDigits').value);
  const fontSize = parseInt(document.getElementById('fontSize').value);
  const operator = document.getElementById('operator').value;
  const container = document.getElementById('cardContainer');
  const opInfo = OPERATOR_MAP[operator];
  const totalProblems = numRows * numCols;

  updateTitle(numDigits, operator);
  saveSettings();

  // Layout tuning for print fidelity
  const usableWidthPx = 756;
  const estimatedCardWidthPx = Math.floor(usableWidthPx / numCols);
  const chPerCard = Math.floor(estimatedCardWidthPx / 8); // 1ch ≈ 8px for monospaced font

  // Font and padding tuning
  let cardPadding = '0.25rem';
  if (fontSize <= 8) cardPadding = '0.05rem';
  else if (fontSize <= 10) cardPadding = '0.2rem';

  // Apply CSS custom properties
  document.documentElement.style.setProperty('--card-font-size', `${fontSize}pt`);
  document.documentElement.style.setProperty('--card-width', `${chPerCard}ch`);
  document.documentElement.style.setProperty('--card-padding', cardPadding);
  document.documentElement.style.setProperty('--card-cols', numCols);

  container.innerHTML = '';

  // Generate each math card
  // NEW CODE: Save problems when generating
  currentProblems = []; // Clear previous problems
  for (let i = 0; i < totalProblems; i++) {
    const [num1, num2, obeyedConstraint] = getRandomOperands(numDigits, operator);
    const result = opInfo.op(num1, num2);

    // Store this problem
    currentProblems.push({ num1, num2, result, obeyedConstraint });

    const num1Str = formatNumber(num1);
    const num2Str = formatNumber(num2);
    const resultStr = formatNumber(result);
    const maxLength = Math.max(num1Str.length, num2Str.length);
    const equalsLine = '='.repeat(maxLength + 2); // adds spacing

    const card = document.createElement('div');
    card.className = 'card';

    // adds practice mode support
    if (practiceMode) {
      // Practice mode: show input field instead of answer
      card.innerHTML = `
    ${num1Str.padStart(maxLength + 2)}
    ${opInfo.symbol}${num2Str.padStart(maxLength + 1)}
    ${equalsLine}
    <input type="text" class="answer-input" data-answer="${result}" placeholder="?" />
    ${obeyedConstraint === false ? '<div class="note">⚠</div>' : ''}`;
    } else {
      // Worksheet mode: show hidden answer (original behavior)
      card.innerHTML = `
    ${num1Str.padStart(maxLength + 2)}
    ${opInfo.symbol}${num2Str.padStart(maxLength + 1)}
    ${equalsLine}
    <div class="answer">${resultStr}</div>
    ${obeyedConstraint === false ? '<div class="note">⚠</div>' : ''}`;
    }

    container.appendChild(card);
  }
 // After creating all cards, render them
 renderProblems();
}

// Check student answers in practice mode
document.getElementById('cardContainer').addEventListener('input', (e) => {
  if (!e.target.classList.contains('answer-input')) return;
  
  const userAnswer = parseInt(e.target.value.replace(/,/g, ''));
  const correctAnswer = parseInt(e.target.dataset.answer);
  
  // Remove previous feedback classes
  e.target.classList.remove('correct', 'incorrect');
  
  if (!e.target.value) return; // Don't show feedback if empty
  
  if (userAnswer === correctAnswer) {
    e.target.classList.add('correct');
  } else {
    e.target.classList.add('incorrect');
  }
});

// Toggle between worksheet mode and practice mode
function togglePracticeMode() {
  practiceMode = !practiceMode;
  const button = document.querySelector('button[onclick="togglePracticeMode()"]');
  button.textContent = practiceMode ? 'Exit Practice Mode' : 'Practice Mode';
  renderProblems(); // Use renderProblems() instead of generate()
}

// Toggle answer visibility for all cards (used for printing or worksheet mode)
function toggleAnswers() {
  document.querySelectorAll('.card').forEach(card => card.classList.toggle('show-answer'));
}

// Initialize the app on load
window.onload = function () {
  loadSettings();
  updateVisibility();
  generate();
};

// Recalculate UI when operator is changed
document.getElementById("operator").addEventListener("change", () => {
  updateVisibility();
  generate();
});
