class BatsmanGame {
    constructor(name) {
        this.name = name;
        this.score = 0;
    }

    bat() {
        const runs = Math.floor(Math.random() * 7); // runs between 0 and 6
        this.score += runs;
        return runs;
    }
}

class BowlerGame {
    constructor(name) {
        this.name = name;
        this.wickets = 0;
    }

    bowl() {
        const outcome = Math.floor(Math.random() * 2); // 0 for no wicket, 1 for wicket
        if (outcome === 1) {
            this.wickets += 1;
        }
        return outcome;
    }
}

class GameManager {
    constructor(batsman, bowler) {
        this.batsman = batsman;
        this.bowler = bowler;
        this.totalOvers = 5;
        this.currentOver = 0;
    }

    play() {
        while(this.currentOver < this.totalOvers) {
            console.log(`Over ${this.currentOver + 1}:`);
            for (let ball = 0; ball < 6; ball++) {
                const runs = this.batsman.bat();
                const wicket = this.bowler.bowl();
                console.log(`Batsman ${this.batsman.name} scored: ${runs} Runs.`);
                if (wicket === 1) {
                    console.log(`Bowler ${this.bowler.name} took a wicket!`);
                    break; // End the over if a wicket falls
                }
            }
            this.currentOver++;
        }
        console.log(`Game Over! ${this.batsman.name} scored a total of ${this.batsman.score} runs.`);
    }
}

const batsman = new BatsmanGame('Player 1');
const bowler = new BowlerGame('Player 2');
const game = new GameManager(batsman, bowler);
game.play();
