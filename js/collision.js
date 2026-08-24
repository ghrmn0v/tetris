function canMove(piece, board,rowOffset, colOffset){
    for(let i=0; i<piece.shape.length; i++){
        for(let j=0; j<piece.shape[i].length; j++){
            if(piece.shape[i][j] === 1){
                let newRow = piece.row + i + rowOffset;
                let newCol = piece.col + j + colOffset;

                if(newRow < 0 || newRow >= board.length)
                    return false;
                if(newCol < 0 || newCol >= board[0].length)
                    return false;
                if(board[newRow][newCol] !== 0){
                    return false;
                }
            }
        }
    }
    return true;
}

export { canMove };