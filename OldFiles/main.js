const cardHeader = document.getElementById('cardHeader')
const cardBody = document.getElementById('cardBody')
const cardPopUp = document.getElementById('cardDisplay')
const moneySpan = document.getElementById('moneySpan')
const optionsEl = document.getElementById('floating-square')
const squaresEl = {}

/// Figure out how to add cost multipliers ... probably have to redo drawbutton to use cost multipliers of some sort.
// game data
// Generator price growth on outer layers = 1.5x ?
// Generator price growth on inidividual layers? cost = base * (1.2)^amount ?

function setColor(color) {
    colorData[color] = document.getElementById('colorBoxA')
}

let colorData = {
    a: '#ccc',
    b: '',
    c: ''
}

const buildings = {
    Generator: {
        type: 'Generator',
        description: 'Generates $1.',
        cost: 5,
        upgrades: {
            output: {
                name: 'Output',
                description: 'Doubles the amount generated (not implemented.)',
                cost: 25
            },
            crit: {
                name: 'Crit',
                description: 'Adds a small chance to gain 3x. (not implemented.)',
                cost: 25
            }
        }
    },
    Multi: {
        type: 'Multi',
        description: 'Multiplies the next square.',
        cost: 10,
        upgrades: {
            place: {
                name: 'place',
                description: 'placeholder (not implemented.)',
                cost: 25
            },
            place2: {
                name: 'place2',
                description: 'placeholdre2 (not implemented.)',
                cost: 100
            }
        }
    },
    Reverse: {
        name: 'Reverse',
        description: 'Reverses direction when hitting this square. (not implemented.)',
        cost: 25
    }
}

const boardUpgrades = {
    gameSpeed: {
        name: 'Game Speed',
        description: 'Squares move along quicker. (not implemented.)',
        cost: 100,
        levelMulti: 1.2
    },
    boardSize: {
        name: 'Add Layer',
        description: 'Add another layer to the grid.',
        cost: 50,
        levelMulti: 1.2
    }
}


// player data
const player = {
    money: 5000,
    iterationSpeed: 350,
    iterationSpeeds: {
        a: 1000,
        b: 1000,
        c: 1000
    },
    layerMultis: {
        a: 1,
        b: 1,
        c: 1
    },
    activeSquares: ['a'],
    layerModifiers: {
        a: 1,
        b: 1,
        c: .5
    },
    drawnLayers: [],
    squares: {
        a: [],
        b: [],
        c: []
    }
};

let currentSquare = {
    a: 0,
    b: 0,
    c: 0
}

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
        if (player.drawnLayers.includes(layer)) { return }
        player.drawnLayers.push(layer)
        squaresEl[layer].forEach((element) => {
            document.getElementById(element.id).classList.add('active')
            let newSpan = document.createElement('span')
            newSpan.appendChild(document.createTextNode(`[ ${element.id} ]`))

            element.appendChild(newSpan)
            newSpan.classList.add('squareSel')
            element.addEventListener('click', () => {
                selectSquare(layer, element.id)
            })
            let newPlayerSquare = {
                id: element.id,
                type: 'None',
                neighbors: findNeighbors(element.id)
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

function addLayer() {
    let thisLayer = player.activeSquares[player.activeSquares.length - 1]
    let nextLayer = String.fromCharCode(player.activeSquares.length + 97)
    let newCost = (boardUpgrades.gameSpeed.cost + (boardUpgrades.gameSpeed.cost * 1.2) ** player.activeSquares.length)
    console.log(newCost)
    if (player.money < boardUpgrades.gameSpeed.cost) return
    player.money -= boardUpgrades.gameSpeed.cost
    player.activeSquares.push(nextLayer)
    newInit()
    selectSquare('boardUpgrades',0)

    console.log(thisLayer)
    player.squares[thisLayer].forEach((element, index) => {
        let thisSquare = `${thisLayer}${index}`
        element.neighbors = findNeighbors(thisSquare)
    })
}

function reInit() {
    if (player.activeSquares.includes('b')) { player.activeSquares.push('c') }
    else {player.activeSquares.push('b') }
    newInit()
}


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
        newDiv.classList.add('coin')
        newDiv.id = `coin${square}`
        squareDiv.appendChild(newDiv)

        player.money -= buildings.Generator.cost
        player.squares[layer][indexOfSquare] = {
            id: square,
            type: 'Generator',
            neighbors: findNeighbors(square),
            amount: 2
        }       
    } else if (key === 'Multi') {
        //buy a multiplier
        let squareDiv = document.getElementById(square)
        let newDiv = document.createElement('div')
        newDiv.appendChild(document.createTextNode('✖'))
        squareDiv.appendChild(newDiv)

        player.money -= buildings.Multi.cost
        player.squares[layer][indexOfSquare] = {
            id: square,
            type: 'Multi',
            neighbors: findNeighbors(square),
            amount: 1.5
        }
    }
    // redraw the card IG
    drawCard(layer, square)
}


function selectSquare(which, id) {

    // show & position card, then draw.
    drawCard(which, id)
    cardPopUp.style.display = 'block'
    cardPopUp.style.top = (event.pageY + cardPopUp.clientHeight / 2) + 'px';
    cardPopUp.style.left = (event.pageX + cardPopUp.clientWidth / 2) + 'px';
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

function buyBoardUpgrade(upgrade) {
    if (upgrade.name === 'Game Speed') {
        return
    } else if (upgrade.name === 'Add Layer') {
        addLayer()
    }
}

function drawCard(which, id) {
    // why is this 3 different functions?? consolidate?
    cardHeader.innerHTML = ''
    cardBody.innerHTML = ''

    if (which === 'boardUpgrades') {
        //board upgrades
        cardHeader.innerHTML = `Board`
        
        let buttonsHeader = document.createElement('span')
        buttonsHeader.appendChild(document.createTextNode(`Upgrades`))
        buttonsHeader.style.textDecoration = 'underline'
        cardBody.appendChild(buttonsHeader)

        for (const key in boardUpgrades) {

            let upgradeButton = drawCardButton(boardUpgrades[key])

            upgradeButton.addEventListener('click', () => {
                buyBoardUpgrade(boardUpgrades[key])
            })

            cardBody.appendChild(upgradeButton)
        }
        //idk run away  
        return
    }

    const square = player.squares[which].find(obj => obj.id === id)
    cardHeader.innerHTML = id

    if (square.type === 'None') {

        // blank card
        cardBody.appendChild(drawCardBody('Nothing Here...', 'Build'))

        for (const key in buildings) {
            let buildButton = drawCardButton(buildings[key])
            buildButton.addEventListener('click', () => {
                buyBuilding(buildings[key].name,square.id)
            })
            cardBody.appendChild(buildButton)
        }
    } else {

        //todo: seperate this out into gameData to reuse

        cardBody.appendChild(drawCardBody(square.type, 'Upgrades'))

        for (const key in buildings[square.type].upgrades) {
            let upgradeButton = drawCardButton(buildings[square.type].upgrades[key])
            upgradeButton.addEventListener('click', () => {
                console.log(buildings[square.type].upgrades[key].name)
            })
            cardBody.appendChild(upgradeButton)
        }
    }
}

// this feels stupid. Add to game data? or player? is saving spot on board really important? prob not.
let counter = {
    a: 1,
    b: 1,
    c: 1
}

let countMod = {
    a: 0,
    b: 0,
    c: 0
}

function findNeighbors(target) {
    const layer = target.charCodeAt(0) - 96
    const layerUp = String.fromCharCode(layer + 97)
    if (!player.activeSquares.includes(layerUp)) return false
    const layerDown = String.fromCharCode(layer + 95)
    const num = +target.slice(1)

    const modulo = layer * 2

    // a 2    b 4    c 6     d 8



    //  d 9 long

    const side = Math.floor(num / modulo)
    const upLayerNum = num + 1 + 2 * side
    const adjs = [`${layerUp}${upLayerNum}`]

    // corner or edge?
    const isCornerCase = !(num % modulo)

    if (isCornerCase) {
        //corner case
        const upLayerLength = 8 * (layer + 1)
        adjs.push(`${layerUp}${(upLayerNum + upLayerLength - 2) % upLayerLength}`)
    } else if (layer !== 1) {
      // Edge case
      const downLayerLength = 8 * (layer - 1)
      adjs.unshift(`${layerDown}${(num - 1 - 2 * side) % downLayerLength}`)
    }
  
    return adjs
}


function playMoneyAnimation(el, amount) {
    let increaseAnimation = document.createElement('div')
    increaseAnimation.className = 'money-increase'
    increaseAnimation.textContent = `+$${amount}`
    el.appendChild(increaseAnimation)
    setTimeout(() => {
        el.removeChild(increaseAnimation)
    },1500)
}



let gmLoop = setInterval(() => {

    player.activeSquares.forEach((layer) => {
        countMod[layer] += player.layerModifiers[layer]
        if (countMod[layer] < 1) return
        countMod[layer] = 0
        
        let currentSelection = squaresEl[layer][counter[layer]]
        let lastSelection = squaresEl[layer][(counter[layer] - 1 + squaresEl[layer].length) % squaresEl[layer].length]

        if (lastSelection) {
            lastSelection.style.backgroundColor = 'rgb(235, 235, 235)'
            lastSelection.style.color = 'black'
            lastSelection.style.boxShadow = '2px 2px 4px rgb(54, 54, 54)'
            lastSelection.style.borderRight = `2px solid #ccc`
            lastSelection.style.borderBottom = '2px solid #ccc'
        }

        currentSelection.style.backgroundColor = 'rgb(24, 24, 24)'
        currentSelection.style.color = 'white'
        currentSelection.style.boxShadow = 'inset 2px 2px 2px #ccc'


        let neighbors = findNeighbors(`${layer}${counter[layer]}`)
        
        if (neighbors) {
            //console.log(neighbors)
        }

        if (player.squares[layer][counter[layer]].type === 'Generator') {

            let higherLayerActive = String.fromCharCode(layer.charCodeAt(0) + 1)
            if (player.activeSquares.includes(higherLayerActive)) {
                // counter[higherLayerActive] = current square of layer+1
                let thisSquare = `${layer}${counter[layer]}`
                let thatSquare = `${higherLayerActive}${counter[higherLayerActive]}`
                let thatType = player.squares[higherLayerActive][counter[higherLayerActive]].type
                if (thisSquare === thatType) {
                    console.log(`we did it!!!!!!!!!`)
                }
            }
            

            player.money += player.squares[layer][counter[layer]].amount * player.layerMultis[layer]

            playMoneyAnimation(squaresEl[layer][counter[layer]], player.squares[layer][counter[layer]].amount * player.layerMultis[layer])
            player.layerMultis[layer] = 1
            let div = document.getElementById(`coin${layer}${counter[layer]}`)
            div.classList.add('animate-rotation')
            
            setTimeout(() => {
               div.classList.remove('animate-rotation')
            },1000)
        } else if (player.squares[layer][counter[layer]].type === 'Multi') {
            console.log(`multi`)
            player.layerMultis[layer] = 1.5
        }

        moneySpan.innerHTML = `$${player.money}`

        counter[layer] = (counter[layer] + 1) % squaresEl[layer].length
    })
}, player.iterationSpeed)