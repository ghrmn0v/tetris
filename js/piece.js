const TETRIMINOS = {
    I: {        color: "cyan",
        shape: [
            [1, 1, 1, 1]
        ]
    },

    O: {
        color: "yellow",
        shape: [
            [1, 1],
            [1, 1]
        ]
    },

    T: {
        color: "purple",
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ]
    },

    S: {
        color: "green",
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ]
    },

    Z: {
        color: "red", 
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ]
    },

    J: {
        color: "blue",
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ]
    },

    L: {
        color: "orange", 
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ]
    }
};

function createPiece(type){
    const pieceData = TETRIMINOS[type];

    return{
        type: type, 
        shape: pieceData.shape,
        row: 0,
        col: 0
    };
}

export {TETRIMINOS, createPiece} ;