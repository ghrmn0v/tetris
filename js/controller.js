import { rotatePiece, rotatePieceLeft } from "./rotation.js";

function handleKeyDown(event, currentPiece, board, canMove) {
    switch (event.key) {
        case 'ArrowUp':
            return rotatePiece(currentPiece, board);
        case 'z':
        case 'Z':
            return rotatePieceLeft(currentPiece, board);
        default:
            return false;
    }
}

export { handleKeyDown }