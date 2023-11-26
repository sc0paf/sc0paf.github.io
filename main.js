const cardHeader = document.getElementById('cardHeader')
const cardBody = document.getElementById('cardBody')
const cardPopUp = document.getElementById('cardDisplay')
const moneySpan = document.getElementById('moneySpan')

// find sq by name     const square = player.squares[which].find(obj => obj.id === id)

// game data
const buildings = {
    Generator: {
        name: 'Generator',
        description: 'Generates $1.',
        cost: 5,
        upgrades: {
            output: {
                id: 'Output',
                description: 'Doubles the amount generated',
                cost: 25
            },
            crit: {
                id: 'Crit',
                description: 'Adds a small chance to gain 3x.',
                cost: 25
            }
        }
    },
    Multi: {
        name: 'Multi',
        description: 'Multiplies the next square.',
        cost: 10
    },
    Reverse: {
        name: 'Reverse',
        description: 'Reverses direction when hitting this square.',
        cost: 25
    }
}

const player = {
    money: 15,
    iterationSpeed: 1000,
    activeSquares: ['a'],
    squares: {
        a: [],
        b: []
    }
}

function generateSquaresArray(prefix, count) {
    const squares = []
    for (let i = 0; i < count; i++) {
        squares.push(document.getElementById(`${prefix}${i}`))
    }
    return squares
}

const squaresA = generateSquaresArray('a',8)
const squaresB = generateSquaresArray('b',16)
const squaresC = generateSquaresArray('c',24)

squaresA[0].style.backgroundColor = 'black'
squaresA[0].style.color = 'white'

let iterator = 1
let iteratorB = 1
let iteratorC = 1

function init() {
    moneySpan.innerHTML = `$${player.money}`
    if (player.activeSquares.includes('a')) {
        // Draw the board for A
        squaresA.forEach((element) => {
            let newSpan = document.createElement('span')
            newSpan.appendChild(document.createTextNode(`[ ${element.id} ]`))
            newSpan.classList.add('squareSel')
            newSpan.addEventListener('click', () => {
                selectSquare('a', element.id)
            })
            element.appendChild(newSpan)
            let newPlayerSquare = {
                id: element.id,
                type: 'None'
            }
            player.squares.a.push(newPlayerSquare)
        })        
    }
    if(player.activeSquares.includes('b')) {
        squaresB.forEach((element) => {
            let newSpan = document.createElement('span')
            newSpan.appendChild(document.createTextNode(`[ ${element.id} ]`))
            newSpan.classList.add('squareSel')
            newSpan.addEventListener('click', () => {
                selectSquare('b', element.id)
            })
            element.appendChild(newSpan)
            let newPlayerSquare = {
                id: element.id,
                type: 'None'
            }
            player.squares.b.push(newPlayerSquare)
        })
    }
}

init()

function buyBuilding(key, square) {
    //key is Generator and square is a0
    //console.log(`key is ${key} and square is ${square}`)
    if (player.money < buildings[key].cost) return
    let row = square.charAt(0)
    let indexOfSquare = player.squares[row].findIndex(squares => squares.id === square)
    console.log(player.squares[row][indexOfSquare].type)
    if (player.squares[row][indexOfSquare].type !== 'None') return

    if (key === 'Generator') {
        let squareDiv = document.getElementById(square)
        let newDiv = document.createElement('div')
        newDiv.appendChild(document.createTextNode('G'))
        squareDiv.appendChild(newDiv)
        player.money -= buildings.Generator.cost
        player.squares.a[indexOfSquare] = {
            id: square,
            type: 'Generator',
            amount: 2
        }       
    }
    // redraw the card IG
    drawSquareBody(row, square)
}


function selectSquare(which, id) {
    cardPopUp.style.display = 'block'
    cardPopUp.style.top = (event.pageY + cardPopUp.clientHeight / 2) + 'px';
    cardPopUp.style.left = (event.pageX + cardPopUp.clientWidth / 2) + 'px';
    //console.log(`which is ${which} and id is ${id}`)
    drawSquareBody(which, id)
}

function drawSquareBody(which, id) {
    cardHeader.innerHTML = ''
    cardBody.innerHTML = ''
    // select the square in the player object
    const square = player.squares[which].find(obj => obj.id === id)
    cardHeader.innerHTML = id
    if (square.type === 'Generator') {
        //TODO: GENERATOR LOGIC
        let topBody = document.createElement('strong')
        topBody.appendChild(document.createTextNode('Generator'))
        cardBody.appendChild(topBody)
        cardBody.appendChild(document.createElement('br'))
        let headText = document.createElement('span')
        headText.appendChild(document.createTextNode('Upgrades'))
        headText.style.textDecoration = 'underline'
        cardBody.appendChild(headText)

        for (const key in buildings.Generator.upgrades) {
            
        }
        
    } else {
        let topBody = document.createElement('span')
        topBody.appendChild(document.createTextNode('Nothing here..'))
        cardBody.appendChild(topBody)
        for (const key in buildings) {
            let buildingButton = document.createElement('button')
            let title = document.createElement('strong')
            title.appendChild(document.createTextNode(buildings[key].name))
            buildingButton.appendChild(title)
            buildingButton.appendChild(document.createElement('br'))
            let cost = document.createElement('em')
            cost.appendChild(document.createTextNode(`Cost : $${buildings[key].cost}`))
            buildingButton.appendChild(cost)
            buildingButton.appendChild(document.createElement('br'))
            let description = document.createTextNode(buildings[key].description)
            buildingButton.appendChild(description)
            buildingButton.classList.add('cardButtons')
            buildingButton.addEventListener('click', () => {
                buyBuilding(buildings[key].name,square.id)
            })
            cardBody.appendChild(buildingButton)
        }
    }
}

function closeSquare() {
    cardPopUp.style.display = 'none'    
}

const theLoop = setInterval(() => {
    let currentSelectionA = squaresA[iterator];
    if (player.activeSquares.includes('b')) {
        currentSelectionB = squaresB[iteratorB];

        let lastSelectionB = squaresB[(iteratorB - 1 + squaresB.length) % squaresB.length]
        if (lastSelectionB) {
            lastSelectionB.style.backgroundColor = 'white'
            lastSelectionB.style.color = 'black'
        }

        currentSelectionB.style.backgroundColor = 'black'
        currentSelectionB.style.color = 'white'
        iteratorB = (iteratorB + 1) % squaresB.length
                
    }
    let lastSelection = squaresA[(iterator - 1 + squaresA.length) % squaresA.length];
    
    // Reset styles for the last selection
    if (lastSelection) {
        lastSelection.style.backgroundColor = 'white';
        lastSelection.style.color = 'black';
    }

    // Apply styles for the current selection
    currentSelectionA.style.backgroundColor = 'black';
    currentSelectionA.style.color = 'white';
    if(player.squares.a[iterator].type === 'Generator') {       
        player.money += player.squares.a[iterator].amount
    }
    moneySpan.innerHTML = `$${player.money}`

    iterator = (iterator + 1) % squaresA.length;
    
}, player.iterationSpeed)
