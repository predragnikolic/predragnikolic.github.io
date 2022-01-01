const ROWS = 10
const COLUMS = 10
const ROOT_EL = document.querySelector('.js-snake')
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
		div.classList.add('js-snake_grid_box')
		ROOT_EL.appendChild(div)
	}
}

const Food = {
	position: [1, 1],

	wasEaten: false,

	eat() {
		this.wasEaten = true
		this.setRandomPosition()
	},

	setRandomPosition() {
		const availablePlaces = [...document.querySelectorAll(".js-snake_grid_box:not(.js-snake_body)")]
		const randomPlace = availablePlaces[getRandomInt(availablePlaces.length)]
		this.position = [
			Number(randomPlace.dataset.x),
			Number(randomPlace.dataset.y)
		]
		console.log(this.position )
	},

	draw() {
		const prevEl = ROOT_EL.querySelector('.js-snake_food')
		if (prevEl) prevEl.classList.remove('js-snake_food')

		const [foodX, foodY] = this.position
		const foodDiv = findDiv(foodX, foodY)
		foodDiv.classList.add('js-snake_food')
	},
}

const Snake = {
	positions: [[4, 9], [5, 9], [6, 9], [7, 9]],

	headPosition() {
		return at(this.positions, -1)
	},

	tailPosition() {
		return at(this.positions, 0)
	},

	intersect(position) {
		const rest = this.positions.filter(pos => pos !== this.headPosition())
		return rest.find(pos => isSamePosition(pos, position))
	},

	direction: 'RIGHT',
	setDirection(direction) {
		if (this.direction == 'RIGHT' && direction === "LEFT") return
		if (this.direction == 'DOWN' && direction === "UP") return
		if (this.direction == 'LEFT' && direction === "RIGHT") return
		if (this.direction == 'UP' && direction === "DOWN") return
		this.direction = direction
	},

	draw() {
		const previousEls = [...ROOT_EL.querySelectorAll('.js-snake_body')]
		previousEls.forEach(el => el.classList.remove('js-snake_body'))

		for (let [x, y] of this.positions) {
			const div = findDiv(x, y)
			div.classList.add('js-snake_body')
		}
	},

	move() {
		this.popTail()

		this.pushHead()
	},

	popTail() {
		if (Food.wasEaten) {
			Food.wasEaten = false
			return
		}

		this.positions.shift()
	},

	pushHead() {
		const nextPosition = this.nextPosition()
		return this.positions.push(nextPosition)
	},

	nextPosition() {
		const [x, y] = this.headPosition()

		switch (this.direction) {
			case "RIGHT":{
				const nextX = x + 1
				if (nextX > COLUMS - 1) return [0, y]
				return [nextX, y]
			}
			case "LEFT": {
				const nextX = x - 1
				if (nextX < 0) return [COLUMS - 1, y]
				return [nextX, y]
			}
			case "UP": {
				const nextY = y - 1
				if (nextY < 0) return [x, ROWS - 1]
				return [x, nextY]
			}
			case "DOWN": {
				const nextY = y + 1
				if (nextY > ROWS - 1) return [x, 0]
				return [x, nextY]
			}
		}
		throw Error('INCORRECT_DIRECTION')
	},


}

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
		// document.addEventListener('keydown', changeDirection);
		// document.removeEventListener('keydown', changeDirection);

const game = {
	interval: null,
	fps: 1000 / 8,

	startGame() {
		this.interval = setInterval(this.draw, this.fps)
	},

	endGame() {
		clearInterval(this.interval)
	},

	draw() {
		Snake.move()

		if (isSamePosition(Snake.headPosition(), Food.position)) {
			Food.eat()
		}

		const didSnakeEatItself = Snake.intersect(Snake.headPosition())
		if (didSnakeEatItself) {
			const index = Snake.positions.findIndex(pos => pos === didSnakeEatItself)
			Snake.positions = Snake.positions.slice(index)
		}

		Food.draw()
		Snake.draw()
	}
}

function main() {
	game.startGame()
}

main()


// HELPERS
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function findDiv(x, y) {
	return ROOT_EL.querySelector(`[data-x='${x}'][data-y='${y}']`)
}

function isSamePosition([aX, aY], [bX, bY]){
	if (aX === bX && aY === bY) return true
	return false
}

function at(array, index) {
	if (index >= 0) {
		return array[index]
	}
	return array[array.length - Math.abs(index)]
}