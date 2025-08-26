document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelector('.calculator-buttons');
    const themeToggle = document.getElementById('theme-toggle');

    // --- THEME SWITCHER LOGIC ---
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.dataset.theme;
        document.body.dataset.theme = currentTheme === 'dark' ? 'light' : 'dark';
    });

    // --- CALCULATOR LOGIC ---
    let displayValue = '0';
    let firstValue = null;
    let operator = null;
    let waitingForSecondValue = false;
    
    // Color palettes for button clicks
    const numberColors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff'];
    const operatorColors = ['#ff8a80', '#ffcf81', '#b9f6ca', '#81d4fa', '#8c9eff'];
    const functionColors = ['#cfd8dc', '#d7ccc8', '#f5f5f5', '#e0e0e0'];

    function updateDisplay() {
        if (displayValue.length > 9) {
            display.style.fontSize = '2rem';
        } else {
            display.style.fontSize = '2.8rem';
        }
        display.textContent = displayValue;
    }

    updateDisplay();

    // --- UNIVERSAL CLICK HANDLER ---
    function handleButtonClick(value) {
        switch (value) {
            case '+': case '-': case '*': case '/': case '=': handleOperator(value); break;
            case '.': inputDecimal(); break;
            case 'AC': clearAll(); break;
            case 'DEL': deleteLast(); break;
            case '%': inputPercent(); break;
            case 'PI': inputPi(); break;
            case 'SQUARE': inputSquare(); break;
            case 'SQRT': inputSqrt(); break;
            default:
                if (/[0-9]/.test(value) || value === '00') inputNumber(value);
        }
        updateDisplay();
    }
    
    // --- EVENT LISTENERS ---
    buttons.addEventListener('click', (event) => {
        const element = event.target;
        if (!element.matches('button')) return;
        
        // Trigger animations and color changes
        triggerButtonAnimation(element);
        
        handleButtonClick(element.dataset.value);
    });

    window.addEventListener('keydown', (e) => {
        e.preventDefault();
        const key = e.key;
        let button;

        if (key >= 0 && key <= 9) {
            button = document.querySelector(`.btn[data-value="${key}"]`);
        } else {
            switch (key) {
                case '.': button = document.querySelector(`.btn[data-value="."`); break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%': button = document.querySelector(`.btn[data-value="${key}"]`); break;
                case 'Enter':
                case '=': button = document.querySelector('.btn-equals'); break;
                case 'Backspace': button = document.querySelector(`.btn[data-value="DEL"]`); break;
                case 'Escape': button = document.querySelector(`.btn[data-value="AC"]`); break;
            }
        }
        if (button) button.click();
    });

    // --- ANIMATION AND COLOR FUNCTION ---
    function triggerButtonAnimation(element) {
        // 1. Add the CSS animation class
        element.classList.add('clicked');
        element.addEventListener('animationend', () => element.classList.remove('clicked'), { once: true });

        // 2. Apply a temporary random color
        let colorPalette;
        if (element.classList.contains('btn-number')) colorPalette = numberColors;
        else if (element.classList.contains('btn-operator') || element.classList.contains('btn-equals')) colorPalette = operatorColors;
        else if (element.classList.contains('btn-function')) colorPalette = functionColors;

        if (colorPalette) {
            const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            const originalColor = getComputedStyle(element).backgroundColor;
            element.style.backgroundColor = randomColor;
            // Revert to the stylesheet color after a short delay
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 400);
        }
    }

    // --- CORE FUNCTIONS ---
    function inputNumber(num) {
        if (waitingForSecondValue) {
            displayValue = num;
            waitingForSecondValue = false;
        } else {
            if (displayValue === '0' && num !== '00') displayValue = num;
            else if (displayValue !== '0' || num !== '00') displayValue += num;
        }
    }
    
    function inputPi() {
        displayValue = String(Math.PI.toFixed(8)); 
        waitingForSecondValue = false;
    }

    function inputDecimal() {
        if (!displayValue.includes('.')) displayValue += '.';
    }
    
    function inputPercent() {
        const currentValue = parseFloat(displayValue);
        if (currentValue === 0) return;
        displayValue = (currentValue / 100).toString();
        waitingForSecondValue = true;
    }
    
    function inputSquare() {
        displayValue = String(Math.pow(parseFloat(displayValue), 2));
        waitingForSecondValue = true;
    }

    function inputSqrt() {
        const currentValue = parseFloat(displayValue);
        if (currentValue < 0) displayValue = 'Error';
        else displayValue = String(Math.sqrt(currentValue));
        waitingForSecondValue = true;
    }

    function handleOperator(nextOperator) {
        const value = parseFloat(displayValue);
        if (isNaN(value)) { clearAll(); return; }
        if (operator && waitingForSecondValue) { operator = nextOperator; return; }
        if (firstValue === null) {
            firstValue = value;
        } else if (operator) {
            const result = calculate(firstValue, value, operator);
            if (result === 'Error') {
                displayValue = 'Error';
                firstValue = null; operator = null; waitingForSecondValue = true;
                return;
            }
            displayValue = `${parseFloat(result.toFixed(7))}`;
            firstValue = result;
        }
        waitingForSecondValue = true;
        operator = nextOperator;
    }

    function calculate(first, second, op) {
        if (op === '+') return first + second;
        if (op === '-') return first - second;
        if (op === '*') return first * second;
        if (op === '/') {
            if (second === 0) return 'Error';
            return first / second;
        }
        return second;
    }

    function clearAll() {
        displayValue = '0';
        firstValue = null; operator = null; waitingForSecondValue = false;
    }
    
    function deleteLast() {
        if (displayValue === 'Error' || waitingForSecondValue) return;
        if (displayValue.length > 1) displayValue = displayValue.slice(0, -1);
        else displayValue = '0';
    }
});
