let score = 0;
let level = 1;

function calculateScore(numberOfLines){
    if(numberOfLines === 1)
        score += (100 * level);
    else if(numberOfLines === 2)
        score += (300 * level);
    else if(numberOfLines === 3)
        score += (500 * level);
    else if(numberOfLines === 4)
        score += (800 * level);
}

function updateLevel(currentLinesCleared){
    let linesNeeded = 5 * level;

    if(currentLinesCleared>=linesNeeded){
        level ++;
    }
}

function getSpeed(){
    let speed = 1000 - (level - 1) * 100;
    if(speed<100){
        speed = 100;
    }
    return speed;
}

function getScore() {
    return score;
}

function getLevel() {
    return level;
}

export {calculateScore, updateLevel, getSpeed, getScore, getLevel};
