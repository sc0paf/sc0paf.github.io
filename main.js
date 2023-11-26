const cardHeader = document.getElementById('cardHeader')
const cardBody = document.getElementById('cardBody')
const cardPopUp = document.getElementById('cardDisplay')
const moneySpan = document.getElementById('moneySpan')
const squaresEl = {}

// game data
const buildings = {
    Generator: {
        name: 'Generator',
        description: 'Generates $1.',
        cost: 5,
        upgrades: {
            output: {
                name: 'Output',
                description: 'Doubles the amount generated',
                cost: 25
            },
            crit: {
                name: 'Crit',
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


// player data
const player = {
    money: 15,
    iterationSpeed: 1000,
    activeSquares: ['a','b'],
    squares: {
        a: [],
        b: [],
        c: []
    }
};

// build array of squares
function generateSquaresArray(prefix, count) {
    const squares = []
    for (let i = 0; i < count; i++) {
        squares.push(document.getElementById(`${prefix}${i}`))
    }
    return squares
}

// setup
function newInit() {
    // set money
    moneySpan.innerHTML = `$${player.money}`

    // build arrays based on active layers
    player.activeSquares.forEach((element, index) => {
        squaresEl[element] = generateSquaresArray(element, 8 * (index + 1))       
    })

    // draw all active squares on each active layer
    player.activeSquares.forEach((layer) => {
        squaresEl[layer].forEach((element) => {
            document.getElementById(element.id).classList.add('active')
            let newSpan = document.createElement('span')
            newSpan.appendChild(document.createTextNode(`[ ${element.id} ]`))
            newSpan.classList.add('squareSel')
            newSpan.addEventListener('click', () => {
                selectSquare(layer, element.id)
            })
            element.appendChild(newSpan)
            let newPlayerSquare = {
                id: element.id,
                type: 'None'
            }
            // push array to layer on player object
            player.squares[layer].push(newPlayerSquare)
            
            // set the first squares
            squaresEl[layer][0].style.backgroundColor = 'black'
            squaresEl[layer][0].style.color = 'white'
        })
    })
}

newInit()


function buyBuilding(key, square) {

    if (player.money < buildings[key].cost) return
    let layer = square.charAt(0)
    let indexOfSquare = player.squares[layer].findIndex(squares => squares.id === square)
    if (player.squares[layer][indexOfSquare].type !== 'None') return

    // TODO : clean this up so it works for any building? or build out the rest.
    if (key === 'Generator') {
        // buy a generator
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
    drawCard(layer, square)
}


function selectSquare(which, id) {
    // show & position card, then draw.
    cardPopUp.style.display = 'block'
    cardPopUp.style.top = (event.pageY + cardPopUp.clientHeight / 2) + 'px';
    cardPopUp.style.left = (event.pageX + cardPopUp.clientWidth / 2) + 'px';
    drawCard(which, id)
}


function closeSquare() {
    // close card -- Move into selectSquare?
    cardPopUp.style.display = 'none'    
}

function drawCardButton(obj) {
    // generic card button
    let newButton = document.createElement('button')
    let title = document.createElement('strong')
    title.appendChild(document.createTextNode(obj.name))
    newButton.appendChild(title)
    newButton.appendChild(document.createElement('br'))
    let costText = document.createElement('em')
    costText.appendChild(document.createTextNode(`Cost : $${obj.cost}`))
    newButton.appendChild(costText)
    newButton.appendChild(document.createElement('br'))
    newButton.appendChild(document.createTextNode(obj.description))
    newButton.classList.add('cardButtons')

    return newButton
}

function drawCardBody(title, underText) {

    // generic card heading
    let frag = document.createDocumentFragment()
    let cardName = document.createElement('strong')
    cardName.appendChild(document.createTextNode(title))
    frag.appendChild(cardName)
    frag.appendChild(document.createElement('br'))
    let buttonsHeader = document.createElement('span')
    buttonsHeader.appendChild(document.createTextNode(underText))
    buttonsHeader.style.textDecoration = 'underline'
    frag.appendChild(buttonsHeader)

    return frag   
}

function drawCard(which, id) {
    // why is this 3 different functions?? consolidate?
    cardHeader.innerHTML = ''
    cardBody.innerHTML = ''
    // select the square in the player object
    const square = player.squares[which].find(obj => obj.id === id)
    cardHeader.innerHTML = id

    //todo: seperate this out into gameData to reuse
    if (square.type === 'Generator') {

        // using generic heading.. 
        cardBody.appendChild(drawCardBody('Generator', 'Upgrades'))

        // draw buttons
        for (const key in buildings.Generator.upgrades) {
            let upgradeButton = drawCardButton(buildings.Generator.upgrades[key])
            upgradeButton.addEventListener('click', () => {
                console.log(buildings.Generator.upgrades[key].name)
            })
            cardBody.appendChild(upgradeButton)

        }        
    } else {
        // blank card
        cardBody.appendChild(drawCardBody('Nothing Here...', 'Build'))

        for (const key in buildings) {
            let buildButton = drawCardButton(buildings[key])
            buildButton.addEventListener('click', () => {
                buyBuilding(buildings[key].name,square.id)
            })
            cardBody.appendChild(buildButton)
        }
    }
}

// this feels stupid. Add to game data? or player? is saving spot on board really important? prob not.
let counter = {
    a: 1,
    b: 1,
    c: 1
}

const gmLoop = setInterval(() => {

    player.activeSquares.forEach((layer) => {

        let currentSelection = squaresEl[layer][counter[layer]]
        let lastSelection = squaresEl[layer][(counter[layer] - 1 + squaresEl[layer].length) % squaresEl[layer].length]

        if (lastSelection) {
            lastSelection.style.backgroundColor = 'white'
            lastSelection.style.color = 'black'
        }

        currentSelection.style.backgroundColor = 'black'
        currentSelection.style.color = 'white'

        moneySpan.innerHTML = `$${player.money}`

        counter[layer] = (counter[layer] + 1) % squaresEl[layer].length

        if (player.squares[layer][counter[layer]].type === 'Generator') {
            player.money += player.squares[layer][counter[layer]].amount
        }
    })

}, player.iterationSpeed)


