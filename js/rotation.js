import { canMove } from "./collision.js";

function rotatePiece(currentPiece, board) {
    let shape = currentPiece.shape;
    let rows = shape.length;
    let cols = shape[0].length;

    let newShape = [];

    let colIndex = 0;
    while (colIndex < cols) {
        let newRow = [];
        let rowIndex = rows - 1;
        while (rowIndex >= 0) {
            newRow.push(shape[rowIndex][colIndex]);
            rowIndex--;
        }
        newShape.push(newRow);
        colIndex++;
    }

    return applyRotationWithKicks(currentPiece, board, newShape);
}

function rotatePieceLeft(currentPiece, board) {
    let shape = currentPiece.shape;
    let rows = shape.length;
    let cols = shape[0].length;

    let newShape = [];

    let colIndex = cols - 1;
    while (colIndex >= 0) {
        let newRow = [];
        let rowIndex = 0;
        while (rowIndex < rows) {
            newRow.push(shape[rowIndex][colIndex]);
            rowIndex++;
        }
        newShape.push(newRow);
        colIndex--;
    }

    return applyRotationWithKicks(currentPiece, board, newShape);
}

function applyRotationWithKicks(currentPiece, board, newShape) {
    let oldShape = currentPiece.shape;
    currentPiece.shape = newShape;

    let kicks = [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, -3]
    ];

    let success = false;
    let i = 0;

    while (i < kicks.length && success === false) {
        let colKick = kicks[i][0];
        let rowKick = kicks[i][1];

        let oldCol = currentPiece.col;
        let oldRow = currentPiece.row;
        currentPiece.col = currentPiece.col + colKick;
        currentPiece.row = currentPiece.row + rowKick;

        if (canMove(currentPiece, board, 0, 0) === true) {
            success = true;
        } else {
            currentPiece.col = oldCol;
            currentPiece.row = oldRow;
        }
        i++;
    }

    if (success === false) {
        currentPiece.shape = oldShape;
    }
    return success;
}

export { rotatePiece, rotatePieceLeft };
