let pieceTypes = ["I", "O", "T", "S", "Z", "J", "L"];

let bag = [];

function shuffle(array){
    let i = array.length - 1;

    while(i > 0){
        let j = Math.floor(Math.random() * (i+1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        i--;
    }
    return array;
}

function refillBag(){
    if(bag.length === 0){
        let newBag = [...pieceTypes];
        shuffle(newBag);
        
        for(let i=0; i<newBag.length; i++){
            bag.push(newBag[i]);
        }
    }
}

function getNextPiece(){
    refillBag();
    return bag.pop();
}

function getNextPieces(count){
    let pieces = [];
    for(let i = 0; i < count; i++){
        pieces.push(getNextPiece());
    }
    for(let i = pieces.length - 1; i >= 0; i--){
        bag.push(pieces[i]);
    }
    return pieces;
}

function peekNextPieces(count){
    let pieces = [];
    for(let i = 0; i < count; i++){
        refillBag();
        pieces.push(bag[bag.length - 1 - i]);
    }
    return pieces;
}

export {getNextPiece, getNextPieces, peekNextPieces}
