const cardHeader = document.getElementById('cardHeader')
const cardBody = document.getElementById('cardBody')
const cardPopUp = document.getElementById('cardDisplay')
const moneySpan = document.getElementById('moneySpan')

// game data
const buildings = {
    Generator: {
        name: 'Mint',
        description: 'Generates $1.',
        cost: 5
    },
    Multi: {
        name: 'Multi',
        description: 'Multiplies the next square.',
        cost: 10
    }
}

const player = {
    money: 15,
    iterationSpeed: 1000,
    activeSquares: ['a'],
    squares: {
        a: []
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

function init() {
    moneySpan.innerHTML = player.money
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
}

init()

function buyBuilding(key, square) {
    console.log(`${key} and ${square}`)
}

function selectSquare(which, id) {
    cardHeader.innerHTML = ''
    cardBody.innerHTML = ''
    // select the square in the player object
    const square = player.squares[which].find(obj => obj.id === id)
    cardHeader.innerHTML = id
    if (square.id === 'Generator') {
        //TODO: GENERATOR LOGIC
        
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
    cardPopUp.style.display = 'block'
}

function closeSquare() {

    cardPopUp.style.display = 'none'    
}

const theLoop = setInterval(() => {
    let currentSelection = squaresA[iterator];
    let lastSelection = squaresA[(iterator - 1 + squaresA.length) % squaresA.length];
    
    // Reset styles for the last selection
    if (lastSelection) {
        lastSelection.style.backgroundColor = 'white';
        lastSelection.style.color = 'black';
    }

    // Apply styles for the current selection
    currentSelection.style.backgroundColor = 'black';
    currentSelection.style.color = 'white';

    iterator = (iterator + 1) % squaresA.length;
    
}, player.iterationSpeed)
