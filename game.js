const gridContainer = document.getElementById('gridContainer')
const cardHeader = document.getElementById('cardHeader')
const cardBody = document.getElementById('cardBody')
const cardPopUp = document.getElementById('cardDisplay')
let energySpan;
let staminaSpan;
let squaresEl = {}
let gmLoop;

let boardSize = (arg) => { return (arg.charCodeAt(0) - 96) * 2 + 1 }

const player = {
    energy: 5,
    stamina: 12,
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
    activeSquares: ['a','b','c'],
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

let homeShopBGColor = {
    a: 'rgb(179, 255, 224)',
    b: 'rgb(179, 255, 224)',
    c: 'rgb(179, 255, 224)'
}

let counter = {
    a: 1,
    b: 1,
    c: 1
}

function selectSquare(which, id) {
    cardPopUp.style.display = which === 'close' ? 'none' : 'block';
    if (which !== 'close') {
        drawCard(which, id)
        cardPopUp.style.top = (event.pageY + cardPopUp.clientHeight / 2) + 'px';
        cardPopUp.style.left = (event.pageX + cardPopUp.clientWidth / 2) + 'px';
    }
}


function buyBuilding() {
    
}


function findNeighbors(target) {
    const layer = target.charCodeAt(0) - 96
    const layerUp = String.fromCharCode(layer + 97)
    if (!player.activeSquares.includes(layerUp)) return false
    const layerDown = String.fromCharCode(layer + 95)
    const num = +target.slice(1)

    const modulo = layer * 2

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

function init() {
    let currentBoardSize = boardSize(player.activeSquares[player.activeSquares.length - 1])


    createGrid(currentBoardSize)
}

document.addEventListener("DOMContentLoaded", function() {
   init();
   player.activeSquares.forEach((layer) => {
    squaresEl[layer][0].style.backgroundColor = 'black'
    squaresEl[layer][0].style.color = 'white'
   })
   runGameLoop();
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

function makeASquare(area, id, letter) {
    let newSquare = document.createElement('div')
        newSquare.classList.add('grid-item')
        // newSquare.classList.add('active')
        newSquare.classList.add(id.charAt(1) === '0' ? 'homeShop' : 'active')
        newSquare.style.gridArea = area
        newSquare.textContent = id
        newSquare.id = id

        let newPlayerSquare = {
            id: id,
            type: id.charAt(1) === '0' ? 'Home' : 'None'
            //type: 'None',
            //neighbors: findNeighbors(element.id)
        }
        newSquare.addEventListener('click', () => {
            selectSquare(letter, id)
        })
        player.squares[letter].push(newPlayerSquare)
        squaresEl[letter].push(newSquare)
    return newSquare
}

function createGrid(size) {
    console.log(`currentboardsize ${size}`)

    gridContainer.innerHTML = ''
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`

    let howManyLayers = player.activeSquares.length

    let thisLayerOffset = 0
    let calcLength = size + 1
    let thisLayerLength = size

    if (howManyLayers < 2) {
        gridContainer.style.padding = '15%'
    } else if (howManyLayers < 3) {
        gridContainer.style.padding = '10%'
    }


    player.activeSquares.reverse().forEach((letter) => {
        let count = 0
        counter[letter] = 0
        if (!squaresEl[letter]) {squaresEl[letter] = []}
        
        // top
        for (let top = 1; top < thisLayerLength; top++) {
            let gridArea = `${thisLayerOffset+1} / ${top+thisLayerOffset} / ${thisLayerOffset+2} / ${top+thisLayerOffset+1}`
            let id = `${letter}${count}`
            let newSquare = makeASquare(gridArea, id, letter)
            count++
            gridContainer.appendChild(newSquare)
        }

        //right
        for (let right = 1; right < thisLayerLength; right++) {
            let gridArea = `${right + thisLayerOffset} / ${thisLayerLength+thisLayerOffset} / ${right + thisLayerOffset + 1} / ${thisLayerLength + 1 + thisLayerOffset}`
            let id = `${letter}${count}`
            let newSquare = makeASquare(gridArea, id, letter)
            count++
            gridContainer.appendChild(newSquare)
        }

        // bottom
        for (let bottom = 1; bottom < thisLayerLength; bottom++) {
            let gridArea = `${calcLength - 1} / ${calcLength - bottom} / ${calcLength} / ${calcLength - bottom + 1}`
            let id = `${letter}${count}`
            let newSquare = makeASquare(gridArea, id, letter)
            count++
            gridContainer.appendChild(newSquare)
        }

        // left
        for (let left = 1; left < thisLayerLength; left++) {
            let gridArea = `${calcLength - left} / ${thisLayerOffset + 1} / ${calcLength - left + 1} / ${thisLayerOffset + 2}`
            let id = `${letter}${count}`
            let newSquare = makeASquare(gridArea, id, letter)
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
    let energyLabel = document.createElement('span')
    energyLabel.textContent = `Energy`
    let currentEnergy = document.createElement('span')
    currentEnergy.id = energySpan
    currentEnergy.textContent = player.energy
    centerDiv.appendChild(energyLabel)
    centerDiv.appendChild(document.createElement('br'))
    centerDiv.appendChild(currentEnergy)
    energyLabel.style.width = '50%'
    currentEnergy.style.width = '100%'
    gridContainer.appendChild(centerDiv)
    centerDiv.appendChild(document.createElement('br'))
    let staminaLabel = document.createElement('span')
    staminaLabel.textContent = `Stamina`
    centerDiv.appendChild(document.createElement('br'))
    let currentStamina = document.createElement('span')
    currentStamina.textContent = player.stamina
    centerDiv.appendChild(staminaLabel)
    centerDiv.appendChild(document.createElement('br'))
    centerDiv.appendChild(currentStamina)
    centerDiv.style.lineHeight = '1.5rem'
    staminaSpan = currentStamina   
    energySpan = currentEnergy
}

function runGameLoop(pause) {
    if (pause === true) { 
        clearInterval (gmLoop)
        return
    }
    gmLoop = setInterval(() => {
        player.activeSquares.forEach((layer) => {
            
            let currentSelection = squaresEl[layer][counter[layer]]
            let lastSelection = squaresEl[layer][(counter[layer] - 1 + squaresEl[layer].length) % squaresEl[layer].length]
                if (lastSelection) {
                    lastSelection.style.color = 'black'
                    lastSelection.style.backgroundColor = counter[layer] === 1 ? homeShopBGColor[layer] : 'rgb(235, 235, 235)'
                }

                currentSelection.style.backgroundColor = 'rgb(24, 24, 24)'
                currentSelection.style.color = 'white'
                
                counter[layer] = (counter[layer] + 1) % squaresEl[layer].length
        })

    },1000)
}

