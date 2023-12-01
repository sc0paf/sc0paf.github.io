const buildings = {
    Generator: {
        name: 'Generator',
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
        name: 'Multi',
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

function homeShopBuy(which) {
    console.log(which)
}

function drawCard(which, id) {
    cardHeader.innerHTML = ''
    cardBody.innerHTML = ''

    const square = player.squares[which].find(obj => obj.id === id)
    cardHeader.textContent = id

    console.log(square)

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
    let costText = document.createElement('em')
    costText.appendChild(document.createTextNode(`Cost : $${obj.cost}`))
    newButton.appendChild(costText)
    newButton.appendChild(document.createElement('br'))
    newButton.appendChild(document.createTextNode(obj.description))
    newButton.classList.add('cardButtons')

    return newButton
}