/**
 * @typedef {[x: number, y: number]} Position
 */

/**
 * @typedef {'RIGHT' | 'DOWN' | 'LEFT' | 'UP'} Direction
 */

const ROWS = 38
const COLUMS = 70

let numberOfPlayers = 1

const modalEL = document.querySelector('[data-modal="game-modal"]')
function showModal() {
    modalEL.classList.remove('hide')
}

function hideModal() {
    modalEL.classList.add('hide')
}

/** @type {HTMLElement | null} */
const ROOT_EL = document.querySelector('.js-snake')

const GAME_WRAPPER_EL = document.querySelector('.js-snake-wrapper')


if (ROOT_EL) ROOT_EL.style.cssText = `
    --size: min(calc(100vw / ${COLUMS}), calc(100vh / ${ROWS}));
    grid-template-columns: repeat(${COLUMS}, var(--size));
    grid-template-rows: repeat(${ROWS}, var(--size));
    height: calc(${ROWS} * var(--size) - 4em);
`

for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMS; col++) {
        const div = document.createElement('div')

        div.dataset.y = String(row)
        div.dataset.x = String(col)
        div.classList.add('js-snake_grid_box')

        ROOT_EL?.appendChild(div)
    }
}

/** @typedef {{
 *      position: Position
 *      respawn: boolean
 * }} FoodOptions */

class Food {
    /**
     * @param      {FoodOptions}  options
     */
    constructor(options) {
        this.id = id
        id++
        /** @type {FoodOptions} */
        this.options = options
        /** @type {Position} */
        this.position = options.position
    }

    eat() {
        if (this.options.respawn) {
            this.setRandomPosition()
            return
        }

        this.position = [-1,-1]
    }

    setRandomPosition() {
        /** @type {HTMLElement[]} */
        const availablePlaces = Array.from(document.querySelectorAll(".js-snake_grid_box:not(.js-snake_body)"))
        const randomPlace = availablePlaces[getRandomInt(availablePlaces.length)]

        this.position = [
            Number(randomPlace.dataset.x),
            Number(randomPlace.dataset.y)
        ]
    }

    draw() {
        const prevEl = ROOT_EL?.querySelector(`.js-snake_food.id-${this.id}`)
        prevEl?.classList.remove(`js-snake_food`)
        prevEl?.classList.remove(`id-${this.id}`)

        const foodDiv = findDiv(this.position)
        foodDiv?.classList.add(`js-snake_food`)
        foodDiv?.classList.add(`id-${this.id}`)
    }

    cleanup() {
        const previousEl = ROOT_EL?.querySelector(`.js-snake_food.id-${this.id}`)
        previousEl?.classList.remove('js-snake_food')
        previousEl?.classList.remove(`id-${this.id}`)
    }
}

/** @typedef {number} KeyCode */

/** @typedef {{
 *      id: string
 *      controls: {
 *          up: KeyCode,
 *          down: KeyCode,
 *          right: KeyCode,
 *          left: KeyCode
 *      }
 *      positions: Position[]
 *      direction?: Direction
 * }} SnakeOptions */

let id = 0;
class Snake {
    /**
     * @param      {SnakeOptions}  options  The options
     */
    constructor(options) {
        this.id = options.id
        /** @type {SnakeOptions} */
        this.options = options

        /** @type {Direction[]} */
        this.inputs = []

            /** @type {Position[]} */
        this.positions = options.positions

        /** @type {Direction} */
        this.direction = options.direction || 'RIGHT'

        this.didEat = false

        this.onKeyDown = this.changeDirection.bind(this)
        ROOT_EL?.addEventListener('keydown', this.onKeyDown);
    }

    /**
     * @param      {Food}  food
     */
    eat(food) {
        food.eat()
        this.didEat = true
    }

    cleanup() {
        ROOT_EL?.removeEventListener('keydown', this.onKeyDown);

        const previousEls = ROOT_EL?.querySelectorAll(`.id-${this.id}`)
        if (previousEls) Array.from(previousEls).forEach(el => {
            el.classList.remove('js-snake_body')
            el.classList.remove(`id-${this.id}`)
        })

        this.positions = []
    }

    /**
     * @param      {KeyboardEvent}  e
     */
    changeDirection(e) {
        /** @type {Direction | undefined} */
        let direction;

        const controls = this.options.controls
        console.log('eej')
        switch (e.keyCode) {
        case controls.left: {
            e.preventDefault()
            direction = "LEFT"
            break
        }
        case controls.right: {
            e.preventDefault()
            direction = "RIGHT"
            break
        }
        case controls.up: {
            e.preventDefault()
            direction = "UP"
            break
        }
        case controls.down: {
            e.preventDefault()
            direction = "DOWN"
            break
        }
        }

        if (direction) this.inputs.push(direction)

        // only remember the 2 last keys
        if (this.inputs.length > 2) this.inputs.shift()
    }

    /**
     * @return     {Position}
     */
    headPosition() {
        return at(this.positions, -1) || [-1, -1]
    }

    /**
     * @return     {Position}
     */
    tailPosition() {
        return at(this.positions, 0) || [-1, -1]
    }

    /**
     * @param      {Position}  position
     * @return     {Position | null}
     */
    intersectNoHead(position) {
        const rest = this.positions.filter(pos => pos !== this.headPosition())
        if (!rest) return null
        return rest.find(pos => isSamePosition(pos, position)) || null
    }

    /**
     * @param      {Position}  position
     * @return     {Position | null}
     */
    intersect(position) {
        return this.positions.find(pos => isSamePosition(pos, position)) || null
    }

    setDirection() {
        const direction = this.inputs.shift()

        if (this.direction == 'RIGHT'   && direction === "LEFT")    return
        if (this.direction == 'DOWN'    && direction === "UP")      return
        if (this.direction == 'LEFT'    && direction === "RIGHT")   return
        if (this.direction == 'UP'      && direction === "DOWN")    return

        if (direction) this.direction = direction
    }

    draw() {
        const previousEls = ROOT_EL?.querySelectorAll(`.js-snake_body.id-${this.id}`)
        if (previousEls) Array.from(previousEls).forEach(el => {
            el.classList.remove('js-snake_body')
            el.classList.remove(`id-${this.id}`)
        })

        for (let position of this.positions) {
            const div = findDiv(position)
            div?.classList.add('js-snake_body')
            div?.classList.add(`id-${this.id}`)
        }
    }

    move() {
        this.setDirection()

        this.popTail()

        this.pushHead()
    }

    popTail() {
        if (this.didEat) {
            this.didEat = false
            return
        }

        this.positions.shift()
    }

    pushHead() {
        const nextPosition = this.nextPosition()
        return this.positions.push(nextPosition)
    }

    /**
     * @return     {Position}
     */
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
        throw new Error('INCORRECT_DIRECTION')
    }
}


let snakes = getAllPlayers()

function getAllPlayers() {
    return [
        new Snake({
            id: 1,
            controls: {
                up: 38,
                down: 40,
                right: 39,
                left: 37,
            },
            direction: "RIGHT",
            positions: [[10, 33], [11, 33], [12, 33], [13, 33]]
        }),
         new Snake({
            id: 2,
            controls: {
                up: 87,
                down: 83,
                right: 68,
                left: 65,
            },
            direction: "RIGHT",
            positions: [[26, 33], [27, 33], [28, 33], [29, 33]]
        }),
        new Snake({
            id: 3,
            controls: {
                up: 84,
                down: 71,
                right: 72,
                left: 70,
            },
            direction: "RIGHT",
            positions: [[42, 33], [43, 33], [44, 33], [45, 33]]
        }),
        new Snake({
            id: 4,
            controls: {
                up: 73,
                down: 75,
                right: 76,
                left: 74,
            },
            direction: "RIGHT",
            positions: [[58, 33], [59, 33], [60, 33], [61, 33]]
        })
    ]
}

const map = `
------------------------------------------------------------------
-------------------xx---------------------------------------------
--x---x--x--x-x---x--x-xx--xx--xx-xx--xx---x---xx----xx--xx---x---
--xx-xx-x-x-x-x--x-x-x-x-x-x-x-x--x-x-x-x-x-x-x------x-x-x-x-x-x--
--x-x-x-xxx-x-x--x-xx--xx--xx--xx-x-x-xx--xxx-x-xx---xx--xx--x-x--
--x---x-x-x-x-x--x-----x---x-x-x--x-x-x-x-x-x-x--x---x---x-x-x-x--
--x---x-x-x-x-xx--x--x-x---x-x-xx-xx--x-x-x-x--xx--x-x---x-x--x---
-------------------xx---------------------------------------------
`

/** @type {Food[]} */
let foods = []

function setInitallFood() {
    foods = []
    map.split('\n').filter(Boolean).map((line, i) => {
        Array.from(line).forEach((char, j) => {
            if (char == 'x') foods.push(new Food({
                position: [Number(j), Number(i)],
                respawn: Boolean(getRandomInt(2))
            }))
        })
    })
}


const game = {
    /** @type {number | undefined} */
    interval: undefined,
    fps: 1000 / 8,

    startGame() {
        this.interval = setInterval(() => requestAnimationFrame(this.draw), this.fps)
    },

    endGame() {
        clearInterval(this.interval)
        snakes.forEach(snake => snake.cleanup())
        foods.forEach(food => food.cleanup())
        GAME_WRAPPER_EL.classList.add('hide')
    },

    draw() {
        snakes.forEach( snake => snake.move())

        for (let snake of snakes) {
            const otherSnakes = snakes.filter(s => s !==snake)

            otherSnakes.forEach(otherSnake => {
                if (otherSnake.intersect(snake.headPosition())) {
                    console.log(isSamePosition(otherSnake.headPosition(), snake.headPosition()))
                    console.log(otherSnake.headPosition(), snake.headPosition())
                    if (isSamePosition(otherSnake.headPosition(), snake.headPosition())) {
                        dieSnake(snake)
                        dieSnake(otherSnake)
                        console.log(`Tied. Player ${snake.id + 1} and ${otherSnake.id + 1} both died.`)
                    } else {
                        console.log(`Player ${snake.id + 1} was killed by Player ${otherSnake.id + 1}.`)
                        dieSnake(snake)
                    }
                }
            })

            foods.forEach(food => {
                if (isSamePosition(snake.headPosition(), food.position)) {
                    snake.eat(food)
                }
            })

            const didSnakeEatItself = snake.intersectNoHead(snake.headPosition())
            if (didSnakeEatItself) {
                // const index = snake.positions.findIndex(pos => pos === didSnakeEatItself)
                // snake.positions = snake.positions.slice(index + 1)

                 dieSnake(snake)
            }

            if (numberOfPlayers > 1 && snakes.length === 1) {
                alert(`The winner is Player ${snakes[0].id}`)
                game.endGame()
                break;
            }

            if (snakes.length === 0) {
                alert(`No one won.`)
                game.endGame()
                break;
            }
        }


        snakes.forEach( snake => snake.draw())
        foods.forEach(food => food.draw())
    }
}

function play(event) {
    event.preventDefault()

    game.endGame()
    hideModal()


    numberOfPlayers = Number(document.forms.gameSettings.elements.numberOfPlayers.value)
    snakes = getAllPlayers().slice(0, numberOfPlayers)
    setInitallFood()

    GAME_WRAPPER_EL.classList.remove('hide')
    if (ROOT_EL) {
        ROOT_EL.focus()
    }
    game.startGame()
}

// HELPERS

/**
 * @param      {Snake}  snake
 */
function dieSnake(snake) {
    snake.cleanup()
    snakes = snakes.filter(s => s !== snake)
}

/**
 * Geta a random integer.
 *
 * @param      {number}  max     The maximum
 * @return     {number}  The random integer.
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Finds a div.
 *
 * @param      {Position}  position
 * @return     {HTMLElement | null}
 */
function findDiv(position) {
    const [x, y] = position
    return ROOT_EL?.querySelector(`[data-x='${x}'][data-y='${y}']`) || null
}

/**
 * Determines if same position.
 *
 * @param      {Position}   posA
 * @param      {Position}   posB
 * @return     {boolean}
 */
function isSamePosition(posA, posB){
    const [aX, aY] = posA
    const [bX, bY] = posB
    if (aX === bX && aY === bY) return true
    return false
}

/**
 * @template T
 *
 * @param      {T[]}  array
 * @param      {number}  index
 * @return     {T | undefined}
 */
function at(array, index) {
    if (index >= 0) {
        return array[index]
    }
    return array[array.length - Math.abs(index)]
}