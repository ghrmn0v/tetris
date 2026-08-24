import { renderBoard, drawCell, drawLegalNotice, onStartScreenRender } from './renderer.js'
import { createBoard } from './board.js';
import { createPiece } from './piece.js';
import { canMove } from './collision.js';
import { handleKeyDown } from './controller.js';
import { getNextPiece } from './randomBag.js';
import { calculateScore, updateLevel, getSpeed, getScore, getLevel } from './scoring.js';
import  {initSounds, playMusic, playSound, stopMusic} from './sound.js';
const board = createBoard();

let currentPiece;
let linesCleared = 0;
let holdPiece = null;
let canHold = true;
let nextPieces = [];
let gameOver = false;
let gameStarted = false;
let gameInterval = null;
const NEXT_COUNT = 2;
let moveCount = 0;
const MAX_MOVES = 15;

// ─── LOCK DELAY ─────────────────────────────────────
let lockTimer = null;
let isLocking = false;
const LOCK_DELAY = 500;
let lockGraceTicks = 0;
const LOCK_GRACE = 3;

function startLockDelay() {
    if (lockTimer !== null) return;
    isLocking = true;
    lockTimer = setTimeout(function() {
        doLock();
    }, LOCK_DELAY);
}

function cancelLockDelay() {
    if (lockTimer !== null) {
        clearTimeout(lockTimer);
        lockTimer = null;
        isLocking = false;
    }
}

function doLock() {
    cancelLockDelay();
    lockGraceTicks = 0;

    lockPiece(currentPiece, board);
    let clearedRows = clearLines(board);
    if (clearedRows > 0) {
        playSound("score");
        calculateScore(clearedRows);
        linesCleared = linesCleared + clearedRows;
        let oldLevel = getLevel();
        updateLevel(linesCleared);
        if (getLevel() > oldLevel) {
            playSound("levelUp");
        }
    }

    canHold = true;
    moveCount = 0;

    while (nextPieces.length < NEXT_COUNT) {
        nextPieces.push(createPiece(getNextPiece()));
    }
    let next = nextPieces.shift();
    currentPiece = next;
    currentPiece.row = 19;
    currentPiece.col = 3;

    if (!canMove(currentPiece, board, 0, 0)) {
        playSound("gameOver");
        stopMusic();
        gameOver = true;
        render();
        return;
    }

    render();
}

function spawnPiece(type) {
    currentPiece = createPiece(type);
    currentPiece.row = 19;
    currentPiece.col = 3;
    lockGraceTicks = 0;

    while (nextPieces.length < NEXT_COUNT) {
        nextPieces.push(createPiece(getNextPiece()));
    }
}

function getGhostPiece() {
    if (!currentPiece) return null;

    let ghost = createPiece(currentPiece.type);
    ghost.row = currentPiece.row;
    ghost.col = currentPiece.col;
    ghost.shape = currentPiece.shape;

    while (canMove(ghost, board, 1, 0)) {
        ghost.row++;
    }
    return ghost;
}

function render() {
    let ghostPiece = getGhostPiece();
    renderBoard(board, currentPiece, ghostPiece, holdPiece, nextPieces,
        getScore(), getLevel(), linesCleared, isLocking);
}

function gameLoop() {
    if (gameOver === true) return;
    if (!currentPiece) return;

    if (canMove(currentPiece, board, 1, 0)) {
        currentPiece.row++;
        cancelLockDelay();
        lockGraceTicks = 0;
    } else {
        lockGraceTicks++;
        if (lockGraceTicks >= LOCK_GRACE) {
            startLockDelay();
        }
    }

    render();
}

function lockPiece(currentPiece, board) {
    if (!currentPiece) return null;

    let rowCounter = 0;
    let colCounter = 0;

    for (let i = 0; i < currentPiece.shape.length; i++) {
        for (let j = 0; j < currentPiece.shape[i].length; j++) {
            if (currentPiece.shape[i][j] === 1) {
                let boardRow = currentPiece.row + rowCounter;
                let boardCol = currentPiece.col + colCounter;
                board[boardRow][boardCol] = currentPiece.type;
            }
            colCounter++;
        }
        rowCounter++;
        colCounter = 0;
    }
}

function clearLines(board) {
    let rows = board.length;
    let cols = board[0].length;
    let rowIndex = rows - 1;
    let numberOfClearedLines = 0;

    while (rowIndex >= 0) {
        let fullRow = true;
        let colIndex = 0;

        while (colIndex < cols) {
            if (board[rowIndex][colIndex] === 0) {
                fullRow = false;
                break;
            }
            colIndex++;
        }

        if (fullRow === true) {
            board.splice(rowIndex, 1);
            let emptyRow = Array(cols).fill(0);
            board.unshift(emptyRow);
            numberOfClearedLines++;
        } else {
            rowIndex--;
        }
    }
    return numberOfClearedLines;
}

// ─── HOLD PIECE ─────────────────────────────────────

function holdCurrentPiece() {
    if (canHold === false) return;

    if (holdPiece === null) {
        holdPiece = currentPiece;
        while (nextPieces.length < NEXT_COUNT) {
            nextPieces.push(createPiece(getNextPiece()));
        }
        currentPiece = nextPieces.shift();
        currentPiece.row = 19;
        currentPiece.col = 3;
    } else {
        let temp = currentPiece;
        currentPiece = holdPiece;
        currentPiece.row = 19;
        currentPiece.col = 3;
        holdPiece = temp;
    }

    canHold = false;
    moveCount = 0;
    cancelLockDelay();
    render();
}

// ─── CONTROLS ───────────────────────────────────────

function handleMovement(event) {
    if (gameOver) return;

    let moved = false;

    if (event.key === " ") {
        let ghost = getGhostPiece();
        if (ghost) {
            currentPiece.row = ghost.row;
            currentPiece.col = ghost.col;
        }
        playSound("space");
        doLock();
        return;
    } else if (event.key === "c" || event.key === "C") {
        holdCurrentPiece();
        return;
    } else if (event.key === "Shift") {
        holdCurrentPiece();
        return;
    } else if (event.key === "ArrowLeft") {
        if (moveCount >= MAX_MOVES) return;
        if (canMove(currentPiece, board, 0, -1)) {
            currentPiece.col--;
            moved = true;
            moveCount++;
        } else {
            playSound("border");
        }
    } else if (event.key === "ArrowRight") {
        if (moveCount >= MAX_MOVES) return;
        if (canMove(currentPiece, board, 0, 1)) {
            currentPiece.col++;
            moved = true;
            moveCount++;
        } else {
            playSound("border");
        }
    } else if (event.key === "ArrowDown") {
        if (canMove(currentPiece, board, 1, 0)) {
            currentPiece.row++;
            moved = true;
            moveCount++;
        }
    }

    if (moved && isLocking) {
        cancelLockDelay();
        startLockDelay();
    }

    render();
}

function startGameLoop() {
    stopGameLoop();
    gameInterval = setInterval(gameLoop, getSpeed());
}

function stopGameLoop() {
    if (gameInterval !== null) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

initSounds();

let musicStarted = false;

document.addEventListener("keydown", function(event) {
    if (!gameStarted) {
        gameStarted = true;
        spawnPiece(getNextPiece());
        startGameLoop();
        if (!musicStarted) {
            playMusic();
            musicStarted = true;
        }
        render();
        return;
    }

    if (!currentPiece) return;

    if (event.key === "R" || event.key === "r") {
        location.reload();
        return;
    }

    if (gameOver) return;

    if (event.key === "ArrowUp") {
        if (moveCount >= MAX_MOVES) return;
        let rotated = handleKeyDown(event, currentPiece, board, canMove);
        if (!rotated) {
            playSound("border");
        } else {
            moveCount++;
        }
        if (isLocking) {
            cancelLockDelay();
            startLockDelay();
        }
        render();
        return;
    }
    if (event.key === "z" || event.key === "Z") {
        if (moveCount >= MAX_MOVES) return;
        let rotated = handleKeyDown(event, currentPiece, board, canMove);
        if (!rotated) {
            playSound("border");
        } else {
            moveCount++;
        }
        if (isLocking) {
            cancelLockDelay();
            startLockDelay();
        }
        render();
        return;
    }

    handleMovement(event);
});

onStartScreenRender(function() {
    if (!gameStarted) {
        drawLegalNotice();
    }
});

drawLegalNotice();

export { gameOver };
