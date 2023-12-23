// Elements
const gridContainer = document.getElementById('gridContainer');
const cardHeader = document.getElementById('cardHeader');
const cardBody = document.getElementById('cardBody');
const cardPopUp = document.getElementById('cardDisplay');
// CSS Variables & Colors
const rootStyles = getComputedStyle(document.documentElement)
const buttonBackground = rootStyles.getPropertyValue('--active-bg-color');
const menuColor = rootStyles.getPropertyValue('--menu-color');
const primaryTextColor = rootStyles.getPropertyValue('--primary-text');
const secondaryTextColor = rootStyles.getPropertyValue('--secondary-text');
let moneySpan;
let squaresEl = {};
let gmLoop = {};
let counter = {};

// x*x ? board size? clever? aheuheu
let boardSize = (arg) => { return (arg.charCodeAt(0) - 96) * 2 + 1 };



// Do I even need this still?
let squareType = (type) => { return type === 'None' ? 'Nothing' : type };


//player object
let player = {
    money: 10,
    intervals: {},
    iterationSpeeds: {},
    layerMultis: {},
    activeSquares: ['a'],
    drawnLayers: [],
    squares: {},
    boardUpgrades: {}
};



function selectSquare(which, id) {
    cardPopUp.style.display = which === 'close' ? 'none' : 'block';
    //selectSquare = id
    if (which !== 'close') {
        drawCard(which, id)
        cardPopUp.style.top = (event.pageY + cardPopUp.clientHeight / 2) + 'px';
        cardPopUp.style.left = (event.pageX + cardPopUp.clientWidth / 2) + 'px';
    }
}

function drawCalculatedSquare(which, id) {
    cardPopUp.style.display = which === 'close' ? 'none' : 'block';
    let fullElement = document.getElementById('cardDisplay')

    if (which !== 'close') {
        drawCard(which, id)
        cardPopUp.style.top = (fullElement.offsetTop + cardPopUp.clientHeight) + 'px';
        cardPopUp.style.left = (fullElement.offsetLeft + cardPopUp.clientWidth) + 'px';        
    }
}



function buyBuilding(name, id) {
    if (!canAffordBuilding(name)) return
    player.money -= buildings[name].cost

    let layer = id.charAt(0)
    let num = id.charAt(1)

    player.squares[layer][num].type = name
    player.squares[layer][num].charges = buildings[name].charges
    player.squares[layer][num].maxCharges = buildings[name].maxCharges
    player.squares[layer][num].amount = buildings[name].amount
    player.squares[layer][num].upgrades = buildings[name].upgrades

    reDrawSquare(layer, num, name)
    drawCard(layer, id)
}


function drawAnySquare(type) {
    let newSquare = document.createElement('div')
}


function reDrawSquare(layer, num, type) {
    let square = squaresEl[layer][num]
    square.innerHTML = ''

    let squareIdLabel = document.createElement('span')
    squareIdLabel.style.margin = '0 0 auto auto'
    squareIdLabel.style.color = secondaryTextColor
    squareIdLabel.textContent = `[${layer}${num}]`
    square.appendChild(squareIdLabel)

    let newImage = document.createElement('div')
    newImage.classList.add(type)
    newImage.style.margin = `auto`
    player.squares[layer][num].coinDiv = newImage
    square.appendChild(newImage)

    let chargeDiv = document.createElement('span')
    chargeDiv.textContent = `5 charges`
    chargeDiv.style.fontStyle = 'italic'
    chargeDiv.style.margin = `auto`
    chargeDiv.style.color = primaryTextColor
    player.squares[layer][num].chargeEl = chargeDiv
    square.appendChild(chargeDiv)


    let cSpan = document.createElement('span')
    cSpan.textContent = type
    cSpan.style.color = secondaryTextColor
    square.appendChild(cSpan) 
}

function canAffordBuilding(building) {
    return player.money >= buildings[building].cost ? true :  false
}




function deleteSave() {
    localStorage.removeItem('savedGame')
}

function init() {
    saveData = localStorage.getItem('savedGame')
    if (saveData) {
        let playerData = JSON.parse(saveData)
        player = playerData
        let currentBoardSize = boardSize(player.activeSquares[player.activeSquares.length - 1])
        player.activeSquares.forEach((layer) => {


        loadGrid(currentBoardSize)
        })
    } 
        let currentBoardSize = boardSize(player.activeSquares[player.activeSquares.length - 1])
        player.activeSquares.forEach((layer) => {
            counter[layer] = 0
            if (!saveData) { player.squares[layer] = [] }
            player.layerMultis[layer] = 1
            player.iterationSpeeds[layer] = 1000
        })

        createGrid(currentBoardSize)
    

    player.activeSquares.forEach((layer) => {
        squaresEl[layer][counter[layer]].style.backgroundColor = menuColor
        squaresEl[layer][counter[layer]].style.border = `1px dashed darkgray`
        squaresEl[layer][counter[layer]].style.color = 'white'

        counter[layer]++

        //setTimeout(runGameStep, player.iterationSpeeds[layer], layer)
    })

    

}

document.addEventListener("DOMContentLoaded", function() {
   init();
   player.activeSquares.forEach((layer) => {
    squaresEl[layer][0].style.backgroundColor = menuColor;
    squaresEl[layer][0].style.color = primaryTextColor;
   })
});


// obsolete?
function howManyLayers(size) {
    if (size <= 1) { return 0 }
    let layers = 0
    currentSize = size
    while (currentSize >= 3) {
        currentSize -= 2
        layers++
    }
    return layers
}


function makeASquare(area, id, letter, number) {
        let newSquare = document.createElement('div')
        newSquare.classList.add('grid-item')
        newSquare.style.gridArea = area
        newSquare.id = id

        let cDiv = document.createElement('div')
        
        let squareIdLabel = document.createElement('span')
        squareIdLabel.style.margin = '0 0 auto auto'
        squareIdLabel.style.color = secondaryTextColor
        //squareIdLabel.textContent = `[${id}]`
        squareIdLabel.textContent = id.charAt(1) === '0' ? `[${id.charAt(0).toUpperCase()}]` : `[${id}]`
        newSquare.appendChild(squareIdLabel)

        let newPlayerSquare = {
            id: id,
            type: id.charAt(1) === '0' ? 'Home' : 'None'
        }


        player.squares[letter].push(newPlayerSquare)
        squaresEl[letter].push(newSquare)

        if (id.charAt(1) === '0') {
            newSquare.classList.add('homeShop')
            let layerInfo = document.createElement('div')
            layerInfo.textContent = `a speed: ${player.iterationSpeeds[letter]}`
            layerInfo.style.color = secondaryTextColor
            let layerUpgradesText = document.createElement('div')
            layerUpgradesText.textContent = `Upgrades`
            layerUpgradesText.style.color = primaryTextColor

            newSquare.appendChild(layerInfo)

            newSquare.appendChild(layerUpgradesText)
            newSquare.appendChild(document.createElement('br'))

        } else {
            newSquare.classList.add('active')
            newSquare.addEventListener('click', () => {
                selectSquare(letter, id)
            })


        }
        let cSpan = document.createElement('span')
        cSpan.style.color = secondaryTextColor;
        cSpan.textContent = squareType(newPlayerSquare.type)
        newSquare.appendChild(cSpan)
        return newSquare    
}



function createGrid(size) {
    gridContainer.innerHTML = ''
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`

    let howManyLayers = player.activeSquares.length

    let thisLayerOffset = 0
    let calcLength = size + 1
    let thisLayerLength = size

    if (howManyLayers < 2) {
        gridContainer.style.padding = '10% 25%'
    } else if (howManyLayers < 3) {
        gridContainer.style.padding = '10%'
    }


    player.activeSquares.reverse().forEach((letter) => {
        let count = 0
        if (!squaresEl[letter]) {squaresEl[letter] = []}
        
        // top
        for (let top = 1; top < thisLayerLength; top++) {
            let gridArea = `${thisLayerOffset+1} / ${top+thisLayerOffset} / ${thisLayerOffset+2} / ${top+thisLayerOffset+1}`
            let id = `${letter}${count}`
            let newSquare;
            if (saveData) { newSquare = loadASquare() }
            else { newSquare = makeASquare(gridArea, id, letter, count) }
            count++
            gridContainer.appendChild(newSquare)
        }

        //right
        for (let right = 1; right < thisLayerLength; right++) {
            let gridArea = `${right + thisLayerOffset} / ${thisLayerLength+thisLayerOffset} / ${right + thisLayerOffset + 1} / ${thisLayerLength + 1 + thisLayerOffset}`
            let id = `${letter}${count}`
            let newSquare = makeASquare(gridArea, id, letter, count)
            count++
            gridContainer.appendChild(newSquare)
        }

        // bottom
        for (let bottom = 1; bottom < thisLayerLength; bottom++) {
            let gridArea = `${calcLength - 1} / ${calcLength - bottom} / ${calcLength} / ${calcLength - bottom + 1}`
            let id = `${letter}${count}`
            let newSquare = makeASquare(gridArea, id, letter, count)
            count++
            gridContainer.appendChild(newSquare)
        }

        // left
        for (let left = 1; left < thisLayerLength; left++) {
            let gridArea = `${calcLength - left} / ${thisLayerOffset + 1} / ${calcLength - left + 1} / ${thisLayerOffset + 2}`
            let id = `${letter}${count}`
            let newSquare = makeASquare(gridArea, id, letter, count)


            count++
            gridContainer.appendChild(newSquare)
        }

        calcLength--
        thisLayerLength-=2
        thisLayerOffset++   

    })

    let centerDiv = document.createElement('div')
    let gridArea = `${size / 2} / ${size / 2} / ${size / 2 + 1} / ${size / 2 + 1}`
    centerDiv.style.gridArea = gridArea
    centerDiv.classList.add('centerDisp')

    let moneyLabel = document.createElement('span')
    moneyLabel.textContent = `Money`
    let currentMoney = document.createElement('span')
    currentMoney.id = moneySpan
    currentMoney.textContent = player.money
    centerDiv.appendChild(moneyLabel)
    centerDiv.appendChild(document.createElement('br'))
    centerDiv.appendChild(currentMoney)
    moneyLabel.style.width = `50%`
    currentMoney.style.width = `100%`
    gridContainer.appendChild(centerDiv)
    moneySpan = currentMoney

    centerDiv.style.lineHeight = '1.5rem'



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


function runGameStep(layer) {
    let currentElement = squaresEl[layer][counter[layer]]
    let currentPlayerSquare = player.squares[layer][counter[layer]]

    if (layer === 'a' && counter[layer] === 0) {
        console.log(`save`)
        let playerData = JSON.stringify(player);
        localStorage.setItem('savedGame', playerData);
    }

    if (currentPlayerSquare.type === 'Generator' && currentPlayerSquare.charges > 0) {
        player.squares[layer][counter[layer]].charges--
        player.money += player.squares[layer][counter[layer]].amount
        player.squares[layer][counter[layer]].chargeEl.textContent = `${player.squares[layer][counter[layer]].charges} charges`
        let coinEl = player.squares[layer][counter[layer]].coinDiv
        playMoneyAnimation(squaresEl[layer][counter[layer]], player.squares[layer][counter[layer]].amount)
        coinEl.classList.add('animate-rotation')
        setTimeout(() => {
            console.log(`turn off`)
                coinEl.classList.remove('animate-rotation')
        },1000)
    }

    let lastSelection = squaresEl[layer][(counter[layer] - 1 + squaresEl[layer].length) % squaresEl[layer].length]

        lastSelection.style.color = 'black'
        lastSelection.style.border = `1px solid ${menuColor}`
        lastSelection.style.backgroundColor = buttonBackground;

    currentElement.style.backgroundColor = menuColor
    currentElement.style.border = `1px dashed darkgray`
    currentElement.style.color = 'white'

    counter[layer] = (counter[layer] + 1) % squaresEl[layer].length

    moneySpan.textContent = player.money.toFixed(2)

    // convert to use gmLoop object?
    //setTimeout(runGameStep, player.iterationSpeeds[layer], layer)
}

function homeShopBuy(which) {
    console.log(which)
}

function drawCard(which, id) {
    cardHeader.innerHTML = ''
    cardBody.innerHTML = ''

    const square = player.squares[which].find(obj => obj.id === id)
    cardHeader.textContent = `${id} - ${square.type}`

    if (square.type === 'None') {

        // blank card
        cardBody.appendChild(drawCardBody('Nothing Here...', 'Build?'))

        for (const key in buildings) {
            let buildButton = drawCardButton(buildings[key])
            buildButton.addEventListener('click', () => {
                buyBuilding(buildings[key].name,square.id)
            })
            cardBody.appendChild(buildButton)
        }
    } else if(square.type === 'Home') {
        cardBody.appendChild(drawCardBody('Home','Shop'))

        for (const key in boardUpgrades) {
            let upgradeButton = drawCardButton(boardUpgrades[key])
            upgradeButton.addEventListener('click', () => {
                homeShopBuy(boardUpgrades[key])
            })
            cardBody.appendChild(upgradeButton)
        }

    } else {

        //todo: seperate this out into gameData to reuse
        if (square.type === 'Generator') {
            let chargeBtn = document.createElement('button')
            currentCardBtn = chargeBtn
            chargeBtn.textContent = `CHARGE [${square.charges} / ${square.maxCharges}]`
            chargeBtn.classList.add('cardButtons')
            chargeBtn.addEventListener('click', () => {
                if (square.charges < square.maxCharges) {
                square.charges++
                square.chargeEl.textContent = `${square.charges} charges`
                drawCard(which, id)
                }
            })
            let genAmt = document.createElement('p')
            genAmt.textContent = `Generating $${square.amount} per cycle.`
            cardBody.appendChild(chargeBtn)
            cardBody.appendChild(document.createElement('br'))
            cardBody.appendChild(genAmt)
            cardBody.appendChild(document.createElement('br'))

        }

        //cardBody.appendChild(drawCardBody(square.type, 'Upgrades'))
        let upgradeText = document.createElement('div')
        upgradeText.style.fontWeight = `bold`
        upgradeText.textContent = `Upgrades`
        cardBody.appendChild(upgradeText)

        for (const key in buildings[square.type].upgrades) {
            let upgradeButton = drawCardButton(buildings[square.type].upgrades[key])
            upgradeButton.addEventListener('click', () => {
                buyUpgrade(square, buildings[square.type].upgrades[key].id)
            })
            cardBody.appendChild(upgradeButton)
        }
    }
}

function buyUpgrade(square, upgrade) {
    console.log(`buy ${upgrade} on ${square.id}`)
    let layer = square.id.charAt(0)
    let index = square.id.charAt(1)
    if (player.money >= player.squares[layer][index].upgrades[upgrade].cost) {
        player.money -= buildings[square.type].upgrades[upgrade].cost
        if (upgrade === 'generated') {
            player.squares[layer][index].amount *= 2
        } else if (upgrade === 'charges') {
            player.squares[layer][index].maxCharges *= 2
            player.squares[layer][index].charges *= 2
        }
        let newCost = player.squares[layer][index].upgrades[upgrade].cost * (1.2 ** player.squares[layer][index].upgrades[upgrade].level)
        player.squares[layer][index].upgrades[upgrade].cost = newCost.toFixed(2)
        player.squares[layer][index].upgrades[upgrade].level++
        drawCard(layer, square.id)
    }
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

function drawCardButton(obj) {
    // generic card button
    let newButton = document.createElement('button')
    let title = document.createElement('strong')
    title.appendChild(document.createTextNode(obj.name))
    newButton.appendChild(title)
    newButton.appendChild(document.createElement('br'))
    let costText = document.      console.log(currentPlayerSquare)createElement('em')
    costText.appendChild(document.createTextNode(`Cost : $${obj.cost}`))
    newButton.appendChild(costText)
    newButton.appendChild(document.createElement('br'))
    newButton.appendChild(document.createTextNode(obj.description))
    newButton.classList.add('cardButtons')

    return newButton
}




