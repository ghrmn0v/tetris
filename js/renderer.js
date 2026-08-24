import {
    CELL_SIZE, VISIBLE_ROWS, COLS,
    LEFT_PANEL_WIDTH, RIGHT_PANEL_WIDTH, PANEL_PADDING,
    BOARD_WIDTH, BOARD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT
} from "./constants.js";
import { TETRIMINOS } from "./piece.js";
import { gameOver } from "./game.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const BOARD_X = LEFT_PANEL_WIDTH;
const BOARD_Y = 0;

// ─── BACKGROUND STARS ───────────────────────────────

const stars = [];
for (let i = 0; i < 80; i++) {
    stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.5 + 0.3
    });
}

let frameCount = 0;

const tetrisLogoImg = new Image();
tetrisLogoImg.src = "assets/images/Tetris_logo.png";

let startScreenCallback = null;

function onStartScreenRender(cb) {
    startScreenCallback = cb;
}

tetrisLogoImg.onload = function() {
    if (startScreenCallback) startScreenCallback();
};

// ─── MAIN RENDER ────────────────────────────────────

function renderBoard(board, currentPiece, ghostPiece, holdPiece, nextPieces, score, level, linesCleared, isLocking) {
    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    drawBackground();
    drawBoard(board);
    drawGhostPiece(ghostPiece);
    renderPiece(currentPiece, isLocking);
    drawBoardBorder();
    drawHoldPanel(holdPiece);
    drawNextPanel(nextPieces);
    drawInfoPanel(score, level, linesCleared);
    drawTetrisLogo();
    if(gameOver === true) drawGameOver();
}

// ─── BACKGROUND ─────────────────────────────────────

function drawBackground() {
    
    let grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#0a0a2e");
    grad.addColorStop(0.5, "#0d0d1a");
    grad.addColorStop(1, "#0a0a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    
    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        let flicker = s.brightness + Math.sin(frameCount * 0.02 + i) * 0.2;
        ctx.fillStyle = "rgba(255, 255, 255, " + Math.max(0.1, flicker).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }

    
    ctx.fillStyle = "rgba(15, 15, 40, 0.85)";
    ctx.fillRect(0, 0, LEFT_PANEL_WIDTH, CANVAS_HEIGHT);

    
    ctx.fillStyle = "rgba(15, 15, 40, 0.85)";
    ctx.fillRect(LEFT_PANEL_WIDTH + BOARD_WIDTH, 0, RIGHT_PANEL_WIDTH, CANVAS_HEIGHT);

    
    ctx.fillStyle = "#080818";
    ctx.fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT);
}

// ─── BOARD ──────────────────────────────────────────

function drawBoard(board) {
    for (let row = 20; row < board.length; row++) {
        for (let col = 0; col < board[0].length; col++) {
            drawCell(row, col, board[row][col]);
        }
    }
}

function drawBoardBorder() {
    ctx.shadowColor = "#e94560";
    ctx.shadowBlur = 15;
    ctx.strokeStyle = "#e94560";
    ctx.lineWidth = 3;
    ctx.strokeRect(BOARD_X - 1, BOARD_Y - 1, BOARD_WIDTH + 2, BOARD_HEIGHT + 2);
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
}

// ─── GHOST PIECE (dashed outline style) ─────────────

function drawGhostPiece(ghostPiece) {
    if (!ghostPiece) return;

    for (let i = 0; i < ghostPiece.shape.length; i++) {
        for (let j = 0; j < ghostPiece.shape[i].length; j++) {
            if (ghostPiece.shape[i][j] === 1) {
                let boardRow = i + ghostPiece.row;
                let boardCol = j + ghostPiece.col;
                let x = BOARD_X + boardCol * CELL_SIZE;
                let y = (boardRow - 20) * CELL_SIZE;

                let color = TETRIMINOS[ghostPiece.type].color;

                ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
                ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

                ctx.setLineDash([4, 3]);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                ctx.setLineDash([]);
                ctx.globalAlpha = 1.0;
                ctx.lineWidth = 1;
            }
        }
    }
}

// ─── PIECE (with lock flash effect) ─────────────────

function renderPiece(currentPiece, isLocking) {
    if (!currentPiece) return;

    const rows = currentPiece.shape.length;

    for (let i = 0; i < rows; i++) {
        const cols = currentPiece.shape[i].length;

        for (let j = 0; j < cols; j++) {
            let cellValue = currentPiece.shape[i][j];

            if (cellValue === 1) {
                let boardRow = i + currentPiece.row;
                let boardCol = j + currentPiece.col;

                if (isLocking) {
                    let flash = Math.sin(frameCount * 0.5) * 0.3 + 0.5;
                    drawCell3D(boardRow, boardCol, currentPiece.type);
                    ctx.fillStyle = "rgba(255, 255, 255, " + flash.toFixed(2) + ")";
                    let x = BOARD_X + boardCol * CELL_SIZE;
                    let y = (boardRow - 20) * CELL_SIZE;
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                } else {
                    drawCell3D(boardRow, boardCol, currentPiece.type);
                }
            }
        }
    }
}

// ─── DRAW CELL (3D bevel effect) ────────────────────

function drawCell(row, col, cellValue) {
    const x = BOARD_X + col * CELL_SIZE;
    const y = (row - 20) * CELL_SIZE;
    const s = CELL_SIZE;

    if (cellValue === 0) {
        ctx.fillStyle = "#0d1030";
        ctx.fillRect(x, y, s, s);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeRect(x, y, s, s);
    } else {
        let color = TETRIMINOS[cellValue].color;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, s, s);

        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(x, y, s, 3);
        ctx.fillRect(x, y, 3, s);

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x, y + s - 3, s, 3);
        ctx.fillRect(x + s - 3, y, 3, s);

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(x + 4, y + 4, s - 8, (s - 8) / 2);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.strokeRect(x, y, s, s);
    }
}

function drawCell3D(row, col, type) {
    const x = BOARD_X + col * CELL_SIZE;
    const y = (row - 20) * CELL_SIZE;
    const s = CELL_SIZE;

    let color = TETRIMINOS[type].color;

    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, s - 2, s - 2);

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(x + 1, y + 1, s - 2, 3);
    ctx.fillRect(x + 1, y + 1, 3, s - 2);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(x + 1, y + s - 4, s - 2, 3);
    ctx.fillRect(x + s - 4, y + 1, 3, s - 2);

    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(x + 5, y + 5, s - 10, (s - 10) / 2);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
}

// ─── HOLD PANEL ─────────────────────────────────────

function drawHoldPanel(holdPiece) {
    let panelX = PANEL_PADDING;
    let panelY = PANEL_PADDING;

    ctx.fillStyle = "#e94560";
    ctx.font = "bold 16px monospace";
    ctx.fillText("HOLD", panelX, panelY + 14);

    let boxX = panelX;
    let boxY = panelY + 25;
    let boxW = 4 * CELL_SIZE;
    let boxH = 3 * CELL_SIZE;

    ctx.fillStyle = "rgba(10, 10, 30, 0.8)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#e94560";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.lineWidth = 1;

    if (!holdPiece) return;

    drawPieceInBox(holdPiece, boxX, boxY, boxW, boxH);
}

// ─── NEXT PANEL ─────────────────────────────────────

function drawNextPanel(nextPieces) {
    let panelX = LEFT_PANEL_WIDTH + BOARD_WIDTH + PANEL_PADDING;
    let panelY = PANEL_PADDING;

    ctx.fillStyle = "#e94560";
    ctx.font = "bold 16px monospace";
    ctx.fillText("NEXT", panelX, panelY + 14);

    let boxX = panelX;
    let boxY = panelY + 25;
    let boxW = 4 * CELL_SIZE;
    let boxH = 3 * CELL_SIZE;

    ctx.fillStyle = "rgba(10, 10, 30, 0.8)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#e94560";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.lineWidth = 1;

    if (!nextPieces || nextPieces.length === 0) return;

    drawPieceInBox(nextPieces[0], boxX, boxY, boxW, boxH);
}

// ─── DRAW PIECE IN BOX  ─────────────────────────────

function drawPieceInBox(piece, boxX, boxY, boxW, boxH) {
    let pieceW = piece.shape[0].length * CELL_SIZE;
    let pieceH = piece.shape.length * CELL_SIZE;
    let offsetX = boxX + (boxW - pieceW) / 2;
    let offsetY = boxY + (boxH - pieceH) / 2;

    for (let i = 0; i < piece.shape.length; i++) {
        for (let j = 0; j < piece.shape[i].length; j++) {
            if (piece.shape[i][j] === 1) {
                let x = offsetX + j * CELL_SIZE;
                let y = offsetY + i * CELL_SIZE;
                let s = CELL_SIZE;

                ctx.fillStyle = TETRIMINOS[piece.type].color;
                ctx.fillRect(x, y, s, s);

                ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
                ctx.fillRect(x, y, s, 3);
                ctx.fillRect(x, y, 3, s);

                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(x, y + s - 3, s, 3);
                ctx.fillRect(x + s - 3, y, 3, s);

                ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                ctx.strokeRect(x, y, s, s);
            }
        }
    }
}

// ─── INFO PANEL ───────────────────────────────────

function drawInfoPanel(score, level, linesCleared) {
    let panelX = LEFT_PANEL_WIDTH + BOARD_WIDTH + PANEL_PADDING;
    let startY = CANVAS_HEIGHT - 180;

    drawLabel(panelX, startY, "SCORE");
    drawValue(panelX, startY + 25, String(score || 0));

    drawLabel(panelX, startY + 60, "LEVEL");
    drawValue(panelX, startY + 85, String(level || 1));

    drawLabel(panelX, startY + 120, "LINES");
    drawValue(panelX, startY + 145, String(linesCleared || 0));
}

function drawLabel(x, y, text) {
    ctx.fillStyle = "#e94560";
    ctx.font = "bold 14px monospace";
    ctx.fillText(text, x, y);
}

function drawValue(x, y, text) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = "bold 22px monospace";
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x, y);
}

// ─── TETRIS LOGO ────────────────────────────────────

function drawTetrisLogo() {
    let panelX = PANEL_PADDING;
    let logoY = CANVAS_HEIGHT - 120;

    ctx.fillStyle = "#e94560";
    ctx.font = "bold 28px monospace";
    ctx.shadowColor = "#e94560";
    ctx.shadowBlur = 10;
    ctx.fillText("TETRIS", panelX, logoY);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "10px monospace";
    ctx.fillText("JavaScript Edition", panelX, logoY + 18);
}

// ─── Game Over ────────────────────────────────────

function drawGameOver(){
    ctx.fillStyle = "rgba(0 ,0 ,0, 0.7)";
    ctx.fillRect(BOARD_X, 0, BOARD_WIDTH, BOARD_HEIGHT);

    ctx.fillStyle = "#e94560";
    ctx.font = "bold 30px monospace";
    let text = "GAME OVER";
    let textWidth = ctx.measureText(text).width;
    let x = BOARD_X + (BOARD_WIDTH - textWidth) / 2;
    let y = BOARD_HEIGHT / 2;
    ctx.fillText(text, x, y);

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px monospace";
    let text2 = "Press R to restart";
    let textWidth2 = ctx.measureText(text2).width;
    ctx.fillText(text2, BOARD_X + (BOARD_WIDTH - textWidth2)/2, y + 40);
}

// ─── EXPORTS ────────────────────────────────────────

function drawBlock(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(x, y, size, 2);
    ctx.fillRect(x, y, 2, size);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(x, y + size - 2, size, 2);
    ctx.fillRect(x + size - 2, y, 2, size);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(x, y, size, size);
}

function drawTetrisLogoBlocks(startX, startY, blockSize) {
    let logo = [
        { grid: [[1,1,1],[0,1,0],[0,1,0]], color: "cyan" },
        { grid: [[1,1,0],[1,0,0],[1,1,0]], color: "red" },
        { grid: [[1,1,1],[0,1,0],[0,1,0]], color: "purple" },
        { grid: [[1,1,0],[1,1,0],[1,0,1]], color: "green" },
        { grid: [[1,1],[1,1]], color: "yellow" },
        { grid: [[0,1,1],[1,1,0],[0,1,0]], color: "orange" }
    ];

    let x = startX;
    let gap = blockSize * 0.6;

    for (let l = 0; l < logo.length; l++) {
        let letter = logo[l];
        for (let row = 0; row < letter.grid.length; row++) {
            for (let col = 0; col < letter.grid[row].length; col++) {
                if (letter.grid[row][col] === 1) {
                    drawBlock(x + col * blockSize, startY + row * blockSize, blockSize, letter.color);
                }
            }
        }
        x += letter.grid[0].length * blockSize + gap;
    }
}

function drawLegalNotice() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    let centerX = CANVAS_WIDTH / 2;

    if (tetrisLogoImg.complete && tetrisLogoImg.naturalWidth > 0) {
        let logoW = 360;
        let logoH = logoW * (tetrisLogoImg.naturalHeight / tetrisLogoImg.naturalWidth);
        let logoX = (CANVAS_WIDTH - logoW) / 2;
        let logoY = CANVAS_HEIGHT / 2 - 170;
        ctx.drawImage(tetrisLogoImg, logoX, logoY, logoW, logoH);
    } else {
        drawTetrisLogoBlocks(centerX - 130, CANVAS_HEIGHT / 2 - 155, 18);
    }

    ctx.shadowColor = "#e94560";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#e94560";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    let subtitleY = CANVAS_HEIGHT / 2 - 30;
    ctx.fillText("JAVASCRIPT EDITION", centerX, subtitleY);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(233, 69, 96, 0.3)";
    ctx.lineWidth = 1;
    let lineY = subtitleY + 20;
    ctx.beginPath();
    ctx.moveTo(centerX - 160, lineY);
    ctx.lineTo(centerX + 160, lineY);
    ctx.stroke();

    let noticeY = lineY + 25;
    ctx.font = "9px monospace";
    let noticeLines = [
        "Tetris \u00A9 1985~2026 Tetris Holding.",
        "Tetris logos, Tetris theme song and Tetriminos",
        "are trademarks of Tetris Holding.",
        "The Tetris trade dress is owned by Tetris Holding.",
        "Licensed to The Tetris Company.",
        "Tetris Game Design by Alexey Pajitnov.",
        "Tetris Logo Design by Roger Dean.",
        "All Rights Reserved."
    ];

    for (let i = 0; i < noticeLines.length; i++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText(noticeLines[i], centerX, noticeY);
        noticeY += 14;
    }

    let pulse = 0.5 + Math.sin(frameCount * 0.06) * 0.5;
    ctx.fillStyle = "rgba(233, 69, 96, " + (0.5 + pulse * 0.5).toFixed(2) + ")";
    ctx.font = "bold 15px monospace";
    ctx.fillText("PRESS ANY KEY TO START", centerX, noticeY + 20);

    ctx.textAlign = "left";
}

export { renderBoard, drawCell, drawLegalNotice, onStartScreenRender };
