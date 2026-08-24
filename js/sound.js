//─── Audio Manager ────────────────────────────

let music = null;
let effects = {};

function initSounds(){
    music = new Audio("assets/music/Song1KorobeinikiStartScreen.mp3");
    music.loop = true;

    effects.border = new Audio("assets/sounds/border.mp3");
    effects.border.loop = false;
    effects.gameOver = new Audio("assets/sounds/GameOver.mp3");
    effects.gameOver.loop = false;
    effects.levelUp = new Audio("assets/sounds/levelUp.mp3");
    effects.levelUp.loop = false;
    effects.score = new Audio("assets/sounds/score.mp3");
    effects.score.loop = false;
    effects.space = new Audio("assets/sounds/space.mp3");
    effects.space.loop = false;
}

function playSound(name){
    let sound = effects[name];
    sound.pause();
    sound.currentTime = 0;
    sound.play();
}

function playMusic(){
    music.play();
}

function pauseMusic(){
    music.pause();
}

function resumeMusic(){
    music.play();
}

function stopMusic(){
    music.pause();
    music.currentTime = 0;
}

export {initSounds, playMusic, playSound, pauseMusic, resumeMusic, stopMusic};