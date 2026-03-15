/**
 * Apple Game (Fruit Box) - Core Logic
 */

const COLS = 17;
const ROWS = 10;
const INITIAL_TIME = 120;

let score = 0;
let timeLeft = INITIAL_TIME;
let timerId = null;
let isDragging = false;
let startX, startY;
let apples = []; // Array to store apple objects { element, value, x, y, removed }

const board = document.getElementById('game-board');
const selectionBox = document.getElementById('selection-box');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const overlay = document.getElementById('overlay');
const finalScoreDisplay = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const boardContainer = document.getElementById('game-board-container');

/**
 * Initialize the game board
 */
function initGame() {
    score = 0;
    timeLeft = INITIAL_TIME;
    apples = [];
    board.innerHTML = '';
    updateScore();
    updateTimer();
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const value = Math.floor(Math.random() * 9) + 1;
            const appleEl = document.createElement('div');
            appleEl.className = 'apple';
            appleEl.textContent = value;
            appleEl.dataset.x = x;
            appleEl.dataset.y = y;
            
            board.appendChild(appleEl);
            apples.push({
                element: appleEl,
                value: value,
                x: x,
                y: y,
                removed: false
            });
        }
    }
    
    overlay.classList.add('hidden');
    startTimer();
}

/**
 * Timer management
 */
function startTimer() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function updateTimer() {
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 10) {
        timerDisplay.style.color = 'var(--primary-red)';
    } else {
        timerDisplay.style.color = '';
    }
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function endGame() {
    clearInterval(timerId);
    finalScoreDisplay.textContent = score;
    finalScoreDisplay.parentElement.classList.remove('hidden');
    document.getElementById('modal-title').textContent = '게임 종료!';
    overlay.classList.remove('hidden');
}

/**
 * Selection Logic
 */
function handleStart(e) {
    if (timeLeft <= 0) return;
    isDragging = true;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const rect = boardContainer.getBoundingClientRect();
    startX = clientX - rect.left + boardContainer.scrollLeft;
    startY = clientY - rect.top + boardContainer.scrollTop;
    
    selectionBox.style.display = 'block';
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
}

function handleMove(e) {
    if (!isDragging) return;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const rect = boardContainer.getBoundingClientRect();
    const currentX = clientX - rect.left + boardContainer.scrollLeft;
    const currentY = clientY - rect.top + boardContainer.scrollTop;
    
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(startX - currentX);
    const height = Math.abs(startY - currentY);
    
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    
    highlightSelectedApples(left, top, width, height);
}

function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    selectionBox.style.display = 'none';
    
    const selected = apples.filter(a => !a.removed && a.element.classList.contains('selected'));
    const sum = selected.reduce((acc, a) => acc + a.value, 0);
    
    if (sum === 10) {
        selected.forEach(a => {
            a.removed = true;
            a.element.classList.add('removed');
        });
        score += selected.length;
        updateScore();
    }
    
    // Clear highlights
    apples.forEach(a => a.element.classList.remove('selected'));
}

let currentSum = 0;

function highlightSelectedApples(left, top, width, height) {
    const boxRect = {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height
    };
    
    currentSum = 0;
    apples.forEach(apple => {
        if (apple.removed) return;
        
        const el = apple.element;
        const appleRect = {
            left: el.offsetLeft,
            top: el.offsetTop,
            right: el.offsetLeft + el.offsetWidth,
            bottom: el.offsetTop + el.offsetHeight
        };
        
        const isIntersecting = !(
            appleRect.left > boxRect.right ||
            appleRect.right < boxRect.left ||
            appleRect.top > boxRect.bottom ||
            appleRect.bottom < boxRect.top
        );
        
        if (isIntersecting) {
            el.classList.add('selected');
            currentSum += apple.value;
        } else {
            el.classList.remove('selected');
        }
    });

    // Visual feedback for sum 10
    if (currentSum === 10) {
        selectionBox.style.borderColor = '#4caf50';
        selectionBox.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
    } else {
        selectionBox.style.borderColor = 'var(--selection-border)';
        selectionBox.style.backgroundColor = 'var(--selection-bg)';
    }
}

/**
 * Screen Management
 */
function showStartScreen() {
    if (timerId) clearInterval(timerId);
    overlay.classList.remove('hidden');
    document.getElementById('modal-title').textContent = '사과게임 시작!';
    finalScoreDisplay.parentElement.classList.add('hidden');
    startBtn.textContent = '게임 시작';
}

/**
 * Event Listeners
 */
boardContainer.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

boardContainer.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

startBtn.addEventListener('click', initGame);
resetBtn.addEventListener('click', showStartScreen);

// Initial setup
showStartScreen();
