import { ROWS, COLS } from "./constants.js";

function createBoard() {
    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(0)
    );
}

export { createBoard };