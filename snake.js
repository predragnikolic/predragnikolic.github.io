const ROOT_EL = document.querySelector('.js-snake')

const ROWS = 10
const COLUMS = 10

ROOT_EL.style.cssText = `
	box-sizing: border-box;
	--size: min(calc(100vw / ${COLUMS}), calc(100vh / ${ROWS}));
	display: grid;
	grid-template-columns: repeat(${COLUMS}, var(--size));
	grid-template-rows: repeat(${ROWS}, var(--size));
	justify-content: center;
`

for (let row = 0; row < ROWS; row++) {
	for (let col = 0; col < COLUMS; col++) {
		const div = document.createElement('div')
		div.style.border = '1px solid #eee'
		div.dataset.y = row
		div.dataset.x = col
		ROOT_EL.appendChild(div)
	}
}

const Snake = {
	// [[x, y], ...]
	position: [
		[4, 9],
		[5, 9],
		[6, 9],
		[7, 9]
	],

	didEat: false,

	foodPosition: [1, 1],

	// 'RIGHT'
	// 'DOWN'
	// 'LEFT'
	// 'UP'
	direction: 'RIGHT',
	setDirection(direction) {
		if (this.direction == 'RIGHT' && direction === "LEFT") return
		if (this.direction == 'DOWN' && direction === "UP") return
		if (this.direction == 'LEFT' && direction === "RIGHT") return
		if (this.direction == 'UP' && direction === "DOWN") return
		this.direction = direction
	},

	draw() {
		for (let [x, y] of this.position) {
			const div = this.findDiv(x, y)
			div.style.background = '#000'
		}

		const [foodX, foodY] = this.foodPosition
		const foodDiv = this.findDiv(foodX, foodY)
		foodDiv.style.background = '#f00'
	},

	findDiv(x, y) {
		return ROOT_EL.querySelector(`[data-x='${x}'][data-y='${y}']`)
	},

	move() {
		this._popTail()

		const [nextX, nextY] = this._getNextPosition()
		const [foodX, foodY] = this.foodPosition
		if (nextX === foodX && nextY === foodY) {
			this.didEat = true
			this.foodPosition = [
				getRandomInt(COLUMS),
				getRandomInt(ROWS)
			]
		}



		this._pushHead([nextX, nextY])
		this.draw()
	},

	_popTail() {
		if (this.didEat) {
			this.didEat = false
			return
		}
		const [tailX, tailY] = this.position.shift()
		const div = this.findDiv(tailX, tailY)
		div.style.background = 'transparent'
	},

	_getNextPosition() {
		const [headX, headY] = this._getHeadPosition()
		switch (this.direction) {
			case "RIGHT":{
				const nextX = headX + 1
				if (nextX > COLUMS - 1) {
					return [0, headY]
				}
				return [nextX, headY]
			}
			case "LEFT": {
				const nextX = headX - 1
				if (nextX < 0) {
					return [COLUMS - 1, headY]
				}
				return [nextX, headY]
			}
			case "UP": {
				const nextY = headY - 1
				if (nextY < 0) {
					return [headX, ROWS - 1]
				}
				return [headX, nextY]
			}
			case "DOWN": {
				const nextY = headY + 1
				if (nextY > ROWS - 1) {
					return [headX, 0]
				}
				return [headX, nextY]
			}
		}
		throw Error('YOU passed an incorrect direction')
	},

	_getHeadPosition() {
		return this.position[this.position.length - 1]
	},

	_pushHead(nextPoisition) {
		return this.position.push(nextPoisition)
	},

	gameInterval: null,

	startGame() {
		const FPS = 1000 / 8
		this.gameInterval = setInterval(() => Snake.move(), FPS)
	},

	stopGame() {
		console.log('stope')
		clearInterval(this.gameInterval)
	}
}

Snake.startGame()

document.addEventListener('keydown', changeDirection);

function changeDirection(e) {
	switch (event.key) {
	case "ArrowLeft":
		Snake.setDirection("LEFT")
		break;
	case "ArrowRight":
		Snake.setDirection("RIGHT")
		break;
	case "ArrowUp":
		Snake.setDirection("UP")
		break;
	case "ArrowDown":
		Snake.setDirection("DOWN")
		break;
	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}