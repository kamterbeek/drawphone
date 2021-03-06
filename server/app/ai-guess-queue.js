const PlayerAI = require("./player-ai");

class AIGuessQueue {
	constructor(getRandomWord) {
		this.getRandomWord = getRandomWord;
		this.reset();
	}

	addWork(workToAdd) {
		this.workQueue.push(workToAdd);

		this.distributeWork();
	}

	playerAvailableForWork(player) {
		if (player.isAi) return;

		const playerAlreadyInQueue = this.workerQueue.indexOf(player);
		if (playerAlreadyInQueue) this.workerQueue.push(player);

		this.distributeWork();
	}

	distributeWork() {
		while (this.workLeft() && this.workersLeft()) {
			this.giveNextWorkerNextWork();
		}
	}

	giveNextWorkerNextWork() {
		const { drawingToGuess, next, attempts = 0 } = this.workQueue.shift();

		if (attempts < 3) {
			const nextPlayer = this.workerQueue.shift();
			console.log("sending work to", nextPlayer.name);

			nextPlayer.sendThen(
				"makeAIGuess",
				drawingToGuess,
				"AIGuessResult",
				res => {
					if (res.success) {
						next(res);
					} else {
						this.addWork({
							drawingToGuess,
							next,
							attempts: attempts + 1
						});
					}

					this.playerAvailableForWork(nextPlayer);
				}
			);
		} else {
			next({
				link: { type: "word", data: this.getRandomWord() }
			});
		}
	}

	reset() {
		this.workQueue = [];
		this.workerQueue = [];
	}

	workLeft = () => this.workQueue.length > 0;

	workersLeft = () => this.workerQueue.length > 0;
}

module.exports = AIGuessQueue;
