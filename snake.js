/**
 * @typedef {[x: number, y: number]} Position
 */

/**
 * @typedef {'RIGHT' | 'DOWN' | 'LEFT' | 'UP'} Direction
 */

const ROWS = 38
const COLUMS = 50

/** @type {HTMLElement | null} */
const ROOT_EL = document.querySelector('.js-snake')


if (ROOT_EL) ROOT_EL.style.cssText = `
    --size: min(calc(100vw / ${COLUMS}), calc(100vh / ${ROWS}));
    max-width: 100%;
    display: inline-grid;
    grid-template-columns: repeat(${COLUMS}, var(--size));
    grid-template-rows: repeat(${ROWS}, var(--size));
    justify-content: center;
    border: 0.2rem solid #000;
    box-shadow: 0 0 8px #000 inset;
    background: #fff;
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

const Food = {
    /** @type {Position} */
    position: [1, 1],

    wasEaten: false,

    eat() {
        this.wasEaten = true
        this.setRandomPosition()
    },

    setRandomPosition() {
        /** @type {HTMLElement[]} */
        const availablePlaces = Array.from(document.querySelectorAll(".js-snake_grid_box:not(.js-snake_body)"))
        const randomPlace = availablePlaces[getRandomInt(availablePlaces.length)]

        this.position = [
            Number(randomPlace.dataset.x),
            Number(randomPlace.dataset.y)
        ]
    },

    draw() {
        const prevEl = ROOT_EL?.querySelector('.js-snake_food')
        if (prevEl) prevEl.classList.remove('js-snake_food')

        const foodDiv = findDiv(this.position)
        foodDiv?.classList.add('js-snake_food')
    },
}

/** @typedef {number} KeyCode */

/** @typedef {{
 *      controls: {
 *          up: KeyCode,
 *          down: KeyCode,
 *          right: KeyCode,
 *          left: KeyCode
 *      }
 *      positions: Position[]
 * }} SnakeOptions */

let id = 0;
class Snake {
    /**
     * @param      {SnakeOptions}  options  The options
     */
    constructor(options) {
        this.id = id
        id++
        /** @type {SnakeOptions} */
        this.options = options

        /** @type {Direction[]} */
        this.inputs = []

            /** @type {Position[]} */
        this.positions = options.positions

        /** @type {Direction} */
        this.direction = 'RIGHT'

        this.onKeyDown = this.changeDirection.bind(this)
        ROOT_EL?.addEventListener('keydown', this.onKeyDown);
    }

    cleanup() {
        ROOT_EL?.removeEventListener('keydown', this.onKeyDown);
    }

    /**
     * @param      {KeyboardEvent}  e
     */
    changeDirection(e) {
        /** @type {Direction | undefined} */
        let direction;

        const controls = this.options.controls
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
    intersect(position) {
        const rest = this.positions.filter(pos => pos !== this.headPosition())
        if (!rest) return null
        return rest.find(pos => isSamePosition(pos, position)) || null
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
        if (Food.wasEaten) {
            Food.wasEaten = false
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
        throw Error('INCORRECT_DIRECTION')
    }
}


const snake = new Snake({
    controls: {
        up: 38,
        down: 40,
        right: 39,
        left: 37,
    },
    positions: [[4, 7], [5, 7], [6, 7], [7, 7]]
})

const game = {
    /** @type {number | undefined} */
    interval: undefined,
    fps: 1000 / 8,

    startGame() {
        this.interval = setInterval(this.draw, this.fps)
    },

    endGame() {
        clearInterval(this.interval)
        snake.cleanup()
    },

    draw() {
        snake.move()

        if (isSamePosition(snake.headPosition(), Food.position)) {
            Food.eat()
        }

        const didSnakeEatItself = snake.intersect(snake.headPosition())
        if (didSnakeEatItself) {
            // const index = snake.positions.findIndex(pos => pos === didSnakeEatItself)
            // snake.positions = snake.positions.slice(index + 1)
            game.endGame()
            console.log('endGame', this)
        }

        snake.draw()
        Food.draw()
    }
}

function main() {
    game.startGame()
}

main()

// HELPERS

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