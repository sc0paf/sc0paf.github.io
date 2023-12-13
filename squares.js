// Elements
const gridContainer = document.getElementById('gridContainer');
const cardModal = document.getElementById('cardContainer');
const cardHeader = document.getElementById('cardHeader');
const cardBody = document.getElementById('cardBody');
let saveButton = document.getElementById('saveButton');
let moneySpan, activeChargeBtn;


// CSS Variables
const rootStyles = getComputedStyle(document.documentElement);
const activeBgColor = rootStyles.getPropertyValue('--active-bg-color');
const menuColor = rootStyles.getPropertyValue('--menu-color');
const primaryTextColor = rootStyles.getPropertyValue('--primary-text');
const secondaryTextColor = rootStyles.getPropertyValue('--secondary-text');
let cardFontSize = () => { return player.activeSquares.length < 2 ? '1rem' : '.6rem' };

let squaresEl = {}, counter = {}, player = {};
let modalState = false;


function startGame() {
  let loadPlayerData = localStorage.getItem('savedPlayerData');
  let loadedData;
  
  if (loadPlayerData) {
    console.log('Data detected: Load Player')
    // save detected, load player data.
    let loadedPlayerData = JSON.parse(loadPlayerData)
    player = loadedPlayerData

  } else {
    // no save, draw player object
    console.log('No data: create Player')
    player.money = 10;
    player.intervals = {};
    player.activeSquares = ['a','b'];
    player.layerData = {
      a: {
        iterationSpeeds: 1000,
        boardUpgrades: [],
      }
    };
    player.squares = {};


    player.activeSquares.forEach((layer) => {
      let layerSize = (layer.charCodeAt(0) - 96) * 8
      player.squares[layer] = {}
      for (let i = 0; i < layerSize; i++) {
        player.squares[layer][i] = {
          id: `${layer}${i}`,
          type: 'None'
        }
      }
    })
  }
  console.log('player data loaded, drawing board...')
  let boardSize = player.activeSquares.length * 2 + 1;
  drawBoard(boardSize);
}

function splitId(id) {
  let layer = id.charAt(0);
  let number = parseInt(id.slice(1), 10);
  return { id, layer, number };
}



function squareContent(elementId) {
  let output = document.createDocumentFragment();

  let top = document.createElement('div')
  top.id = 'idlabel'
  let imageSpot = document.createElement('div')
  imageSpot.id = 'imageLabel'
  let bottomLabel = document.createElement('div')
  bottomLabel.id = 'bottomLabel'

  if (player.squares[elementId.layer][elementId.number].type === 'None') {
    top.style.marginLeft = 'auto'
    top.textContent = `[${elementId.id}]`
    top.style.verticalAlign = 'top'
  } else {
    // draw both sides
  }


  output.appendChild(top)
  output.appendChild(imageSpot)
  output.appendChild(bottomLabel)

  return output

}



function drawBlankSquare(area, layer, count) {
  let thisPlayerSquare = player.squares[layer][count]
  let newSquare = document.createElement('div')
  newSquare.classList.add('grid-item')
  newSquare.style.gridArea = area
  newSquare.id = `${layer}${count}`  

  // Top of Square
  let idLabelSpan = document.createElement('div')
  idLabelSpan.style.color = secondaryTextColor
  idLabelSpan.style.fontSize = cardFontSize

  if (thisPlayerSquare.type === 'None' || thisPlayerSquare.type === 'Home') {
    idLabelSpan.textContent = `[${layer}${count}]`
    idLabelSpan.style.margin = '0 0 auto auto'
    newSquare.appendChild(idLabelSpan)

  } else {
    idLabelSpan.style.width = '100%'
    idLabelSpan.style.display = 'flex'
    idLabelSpan.style.justifyContent = 'space-between'
    idLabelSpan.style.margin = '0 0 auto 0'
    let left = document.createElement('span')
    player.squares[layer][count].amtSpan = left
    let right = document.createElement('span')
    left.textContent = `$${player.squares[layer][count].amount}`
    right.textContent = `[${layer}${count}]`
    idLabelSpan.appendChild(left)
    idLabelSpan.appendChild(right)
    newSquare.appendChild(idLabelSpan)

    let imageDiv = document.createElement('div')
    imageDiv.classList.add(thisPlayerSquare.type)
    imageDiv.style.margin = 'auto'
    newSquare.appendChild(imageDiv)
  }

  newSquare.addEventListener('click', () => {
    openModal(thisPlayerSquare.id)
  })

  let typeSpan = document.createElement('div')
  typeSpan.textContent = thisPlayerSquare.type
  newSquare.appendChild(typeSpan)

  newSquare.classList.add('active')
  return newSquare
}

function drawBoard(size) {
  gridContainer.innerHTML = ''

  gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`
  gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`

  let howManyLayers = player.activeSquares.length;
  let thisLayerOffset = 0;
  let calcLength = size + 1;
  let thisLayerLength = size;


  let activeSquaresBackwards = player.activeSquares.slice().reverse()

  activeSquaresBackwards.forEach((layer) => {
    if (!squaresEl[layer]) {squaresEl[layer] = []}
    let count = 0;

    for (let top = 1; top < thisLayerLength; top++) {
      let gridArea = `${thisLayerOffset+1} / ${top+thisLayerOffset} / ${thisLayerOffset+2} / ${top+thisLayerOffset+1}`
      let id = `${layer}${count}`
      let newSquare = drawBlankSquare(gridArea, layer, count)
      squaresEl[layer].push(newSquare)
      player.squares[layer][count].element = newSquare
      count++
      gridContainer.appendChild(newSquare)
    }

    //right 
    for (let right = 1; right < thisLayerLength; right++) {
      let gridArea = `${right + thisLayerOffset} / ${thisLayerLength+thisLayerOffset} / ${right + thisLayerOffset + 1} / ${thisLayerLength + 1 + thisLayerOffset}`
      let id = `${layer}${count}`
      let newSquare = drawBlankSquare(gridArea, layer, count)
      squaresEl[layer].push(newSquare)
      player.squares[layer][count].element = newSquare
      count++
      gridContainer.appendChild(newSquare)
    }

    // bottom
    for (let bottom = 1; bottom < thisLayerLength; bottom++) {
      let gridArea = `${calcLength - 1} / ${calcLength - bottom} / ${calcLength} / ${calcLength - bottom + 1}`
      let id = `${layer}${count}`
      let newSquare = drawBlankSquare(gridArea, layer, count)
      squaresEl[layer].push(newSquare)
      player.squares[layer][count].element = newSquare
      count++
      gridContainer.appendChild(newSquare)
    }

    //left
    for (let left = 1; left < thisLayerLength; left++) {
      let gridArea = `${calcLength - left} / ${thisLayerOffset + 1} / ${calcLength - left + 1} / ${thisLayerOffset + 2}`
      let id = `${layer}${count}`
      let newSquare = drawBlankSquare(gridArea, layer, count)
      squaresEl[layer].push(newSquare)
      player.squares[layer][count].element = newSquare
      count++
      gridContainer.appendChild(newSquare)
    }
  
    calcLength--;
    thisLayerLength -= 2;
    thisLayerOffset++;
  })
}



function saveMe() {
  let savePlayerData = JSON.stringify(player)
  localStorage.setItem('savedPlayerData', savePlayerData)
}

function kill() {
  localStorage.removeItem('savedPlayerData')
}

startGame()





// ternary stuff
function canAffordBuilding(building, layer) { return player.money >= buildings[building].cost * (buildings[building].layerCostMod ** (layer.charCodeAt(0)-97)) }                                                                     
function canAffordUpgrade(upgrade, layer) { return player.money >= upgrade.cost * (upgrade.layerCostMod ** (layer.charCodeAt(0) - 97)) * (1.4 ** player.boardUpgrades[layer][upgrade.id]) }
function canAffordSqUp (upgrade, layer, id) { 
  let squareIndex = id.charAt(1)
  let level = player.squares[layer][squareIndex].upgrades[upgrade.id].level
  let fetchCost = upgrade.cost * (upgrade.layerCostMod ** (layer.charCodeAt(0) - 97) * (1.4 ** (level - 1)))
  return player.money >= fetchCost
}





function initialize() {
  savedGame = localStorage.getItem('savedData');
  let playerData;
  let currentBoardSize;
  if (savedGame) {
    console.log('Save data detected.');
    playerData = JSON.parse(savedGame)
    //playerData.activeSquares.reverse()
    currentBoardSize = playerData.activeSquares.length * 2 + 1;    

  } else {
    console.log('No Save Data');
    currentBoardSize = player.activeSquares.length * 2 + 1;
    player.activeSquares.forEach((layer) => {     
      player.squares[layer] = [];
      player.layerMultis[layer] = 1;
      player.iterationSpeeds[layer] = 1000;
      player.boardUpgrades[layer] = {};

      for (const key in boardUpgrades) {
        player.boardUpgrades[layer][key] = 1;
      };
    })
  }

  drawGrid(currentBoardSize);

  player.activeSquares.forEach((letter) => {
    squaresEl[letter].forEach((square, index) => {
      
      
      let topLabel = document.createElement('div')
      let topLeft = document.createElement('span')
      let topRight = document.createElement('span')
      topLabel.style.width = '100%'
      topLabel.style.display = 'flex'
      topLabel.style.justifyContent = 'space-between'
      topLabel.appendChild(topLeft)
      topLabel.appendChild(topRight)
      topLabel.style.margin = '0 0 auto auto'
      topRight.textContent = `[${square.id}]`
      square.appendChild(topLabel)

      let imageDiv = document.createElement('div')
      imageDiv.id = `${letter}${index}Img`
      let chargeDiv = document.createElement('div')
      chargeDiv.id = `${letter}${index}Charge`
      let bottomLabel = document.createElement('span')
      bottomLabel.style.margin = 'auto 0 0 0'
      square.appendChild(bottomLabel)

      if (savedGame) {
        bottomLabel.textContent = playerData.squares[letter][index].type
        player.squares[letter][index] = playerData.squares[letter][index]


      } else {

        bottomLabel.textContent = index === 0 ? 'Home' : 'None'
        let newSquare = {
          id: `${letter}${index}`,
          type: index === 0 ? 'Home' : 'None'
        }

        // Add square to player object
        player.squares[letter].push(newSquare)
      }
      square.addEventListener('click', () => {
        openModal(square.id)
      })
    })
  })

  player.activeSquares.forEach((layer) => {
    counter[layer] = 0;
    squaresEl[layer][counter[layer]].style.backgroundColor = menuColor
    squaresEl[layer][counter[layer]].style.border = `1px dashed darkgray`
    squaresEl[layer][counter[layer]].style.color = 'white'

    counter[layer]++

    // setTimeout(() => {
    //   runGameStep(layer)
    // }, player.iterationSpeeds[layer])
  })
  player.activeSquares.reverse()
}


function drawGrid(size) {
  gridContainer.innerHTML = ''

  gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`
  gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`

  let howManyLayers = player.activeSquares.length;

  let thisLayerOffset = 0;
  let calcLength = size + 1;
  let thisLayerLength = size;

  if (player.activeSquares.length < 2) {
    gridContainer.style.padding = `5% 10%`
  } else if (player.activeSquares.length < 3) {
    gridContainer.style.padding = `5%`
  }
  
  player.activeSquares.reverse().forEach((letter) => {
    let count = 0;
    if (!squaresEl[letter]) {squaresEl[letter] = []}

    for (let top = 1; top < thisLayerLength; top++) {
      let gridArea = `${thisLayerOffset+1} / ${top+thisLayerOffset} / ${thisLayerOffset+2} / ${top+thisLayerOffset+1}`
      let id = `${letter}${count}`
      let newSquare = drawBlankSquare(gridArea, letter, count)
      squaresEl[letter].push(newSquare)
      count++
      gridContainer.appendChild(newSquare)
    }

    //right 
    for (let right = 1; right < thisLayerLength; right++) {
      let gridArea = `${right + thisLayerOffset} / ${thisLayerLength+thisLayerOffset} / ${right + thisLayerOffset + 1} / ${thisLayerLength + 1 + thisLayerOffset}`
      let id = `${letter}${count}`
      let newSquare = drawBlankSquare(gridArea, letter, count)
      squaresEl[letter].push(newSquare)
      count++
      gridContainer.appendChild(newSquare)
    }

    // bottom
    for (let bottom = 1; bottom < thisLayerLength; bottom++) {
      let gridArea = `${calcLength - 1} / ${calcLength - bottom} / ${calcLength} / ${calcLength - bottom + 1}`
      let id = `${letter}${count}`
      let newSquare = drawBlankSquare(gridArea, letter, count)
      squaresEl[letter].push(newSquare)
      count++
      gridContainer.appendChild(newSquare)
    }

    //left
    for (let left = 1; left < thisLayerLength; left++) {
      let gridArea = `${calcLength - left} / ${thisLayerOffset + 1} / ${calcLength - left + 1} / ${thisLayerOffset + 2}`
      let id = `${letter}${count}`
      let newSquare = drawBlankSquare(gridArea, letter, count)
      squaresEl[letter].push(newSquare)
      count++
      gridContainer.appendChild(newSquare)
    }
    calcLength--
    thisLayerLength -= 2
    thisLayerOffset++
  })
  let centerDiv = document.createElement('div')
  let gridArea = `${size / 2} / ${size / 2} / ${size / 2 + 1} / ${size / 2 + 1}`
  centerDiv.style.gridArea = gridArea
  centerDiv.classList.add('centerDisp')

  let moneyLabel = document.createElement('span')
  moneyLabel.textContent = 'Money'
  let currentMoney = document.createElement('span')
  currentMoney.id = moneySpan
  currentMoney.textContent = player.money.toFixed(2)
  centerDiv.appendChild(moneyLabel)
  centerDiv.appendChild(document.createElement('br'))
  centerDiv.appendChild(currentMoney)
  moneyLabel.style.width = `90%`
  currentMoney.style.width = `90%`
  gridContainer.appendChild(centerDiv)
  moneySpan = currentMoney
  centerDiv.style.lineHeight = '1.5rem'
}








// just draw 1. 
function drawASquare(area, layer, count) {
  //generic square stuff
  let newSquare = document.createElement('div')
  newSquare.classList.add('grid-item')
  newSquare.style.gridArea = area
  newSquare.id = `${layer}${count}`

  let idLabelSpan = document.createElement('div')
  idLabelSpan.style.color = secondaryTextColor
  idLabelSpan.style.fontSize = cardFontSize


  newSquare.appendChild(idLabelSpan)

  let type;
  if (player.squares[layer][count]) {
    type = player.squares[layer][count].type
  } else {

    let newPlayerSquare = {
      id: `${layer}${count}`,
      type: count === 0 ? 'Home' : 'None'
    }
    type = count === 0 ? 'Home' : 'None'
    player.squares[layer].push(newPlayerSquare)
  }

  if (type === 'None' || type === 'Home') {
    idLabelSpan.textContent = `[${layer}${count}]`
    idLabelSpan.style.margin = `0 0 auto auto`
    idLabelSpan.style.padding = '2px'
  } else {
    idLabelSpan.style.width = '100%'
    idLabelSpan.style.display = 'flex'
    idLabelSpan.style.justifyContent = 'space-between'
    let left = document.createElement('span')
    player.squares[layer][count].amtSpan = left
    let right = document.createElement('span')
    left.style.padding = '2px'
    right.style.padding = '2px'
    left.id = `${layer}${count}-amount`
    left.textContent = `$${player.squares[layer][count].amount}`
    right.textContent = `[${layer}${count}]`
    idLabelSpan.appendChild(left)
    idLabelSpan.appendChild(right)
  }

  if (type === 'Generator') {

    let newImage = document.createElement('div')
    newImage.classList.add(type)
    newImage.style.margin = `auto`
    newSquare.appendChild(newImage)
    player.squares[layer][count].imageDiv = newImage




    let chargeDiv = document.createElement('div')
    let currentMax = document.createElement('span')
    currentMax.textContent = `${player.squares[layer][count].charges} / ${player.squares[layer][count].maxCharges} charges`
    chargeDiv.appendChild(currentMax)
    currentMax.style.fontSize = cardFontSize
    chargeDiv.appendChild(document.createElement('br'))
    chargeDiv.style.fontStyle = 'italic'
    chargeDiv.style.margin = 'auto'
    chargeDiv.style.textAlign = 'center'
    chargeDiv.style.color = primaryTextColor;
    player.squares[layer][count].chargeEl = chargeDiv
    newSquare.appendChild(chargeDiv)
  }

  newSquare.addEventListener('click', () => {
    openModal(newSquare.id, type)
  })

  newSquare.classList.add('active')
  let squareTypeLabel = document.createElement('span')
  squareTypeLabel.style.color = secondaryTextColor;
  squareTypeLabel.textContent = type
  newSquare.appendChild(squareTypeLabel)
  squaresEl[layer].push(newSquare)

  return newSquare;

}


document.addEventListener('click', function(event) { 
  // Check if the click is outside the popup 
  if (!cardModal.contains(event.target) && cardModal.style.display === 'block') { 
    // If outside, close the popup 
    openModal('close'); 
  } 
});

function openModal(id) {
  cardModal.style.display = id === 'close' ? 'none' : 'block';

  if (id !== 'close') {
    drawCard(id)

    const modalWidth = cardModal.clientWidth;
    const modalHeight = cardModal.clientHeight;
    const mouseX = event.pageX
    const mouseY = event.pageY

    const maxX = window.innerWidth - (modalWidth * .6)
    const maxY = window.innerHeight - (modalHeight * .6)

    let modalX = mouseX + modalWidth / 2;
    let modalY = mouseY + modalHeight / 2;

    modalX = Math.min(modalX, maxX)
    modalY = Math.min(modalY, maxY)

    cardModal.style.top = modalY + 'px';
    cardModal.style.left = modalX + 'px' 
  }
  event.stopPropagation();
}

function drawCard(squareId) {
  console.log(squareId)
  cardHeader.textContent = ''
  cardBody.textContent = ''
  let layer = squareId.charAt(0)
  let num = squareId.charAt(1)
  const square = player.squares[layer].find(obj => obj.id === squareId)
  cardHeader.textContent = `${squareId} - ${square.type === 'None' ? 'Empty' : square.type}`
  let cardName = document.createElement('strong')
  cardName.appendChild(document.createTextNode(square.type === 'None' ? 'Nothing here..' : square.type))
  cardBody.appendChild(cardName)

  if (square.type === 'Generator') {
    console.log(square)
    // draw Generator Card

    // charge Button
    let chargeBtn = document.createElement('button')
    chargeBtn.style.width = '100%'
    chargeBtn.style.height = '3rem'
    chargeBtn.textContent = `Charge [${square.charges} / ${square.maxCharges}]`
    chargeBtn.style.fontFamily = 'monospace'
    chargeBtn.id = `b${squareId}`
    activeChargeBtn = chargeBtn

    chargeBtn.addEventListener('click', () => {
      if (square.charges < square.maxCharges) {
        chargeBtn.style.transform = 'scale(1.05)'
        setTimeout(() => {chargeBtn.style.transform = `scale(1.0)`}, 100)
        square.charges++
        square.chargeEl.textContent = `${square.charges}/${square.maxCharges} Charges`
        square.chargeEl.style.fontSize = cardFontSize
        chargeBtn.textContent = `Charge [${square.charges} / ${square.maxCharges}]`
      }
    })
    cardBody.appendChild(chargeBtn)


    // upgrades 
    for (const key in player.squares[layer][num].upgrades) {
      //let upgradeButton = drawCardButton(buildings[square.type].upgrades[key], layer, square)
      let upgradeButton = document.createElement('button')
      upgradeButton.style.width = '100%'

      upgradeCost = player.squares[layer][num].upgrades[key].cost * player.squares[layer][num].upgrades[key].level
      upgradeButton.textContent = `${player.squares[layer][num].upgrades[key].id} - ${upgradeCost}`


      upgradeButton.id = `uBtn${squareId}`
      upgradeButton.addEventListener('click', () => {
        trytoupgrade(layer, num, player.squares[layer][num].upgrades[key])
        //console.log(`${layer} ${square.id} ${buildings[square.type].upgrades[key].id} ${upgradeButton}`)
        //buyUpgrade(layer, square.id, buildings[square.type].upgrades[key])
      })
      cardBody.appendChild(upgradeButton)
    }
  } else if (square.type === 'Home') {
    let actionLabel = document.createElement('p')
    actionLabel.textContent = 'Layer Upgrades'
    actionLabel.style.userSelect = 'none'

    for (const upgrade in boardUpgrades) {
      let upgradeButton = drawCardButton(boardUpgrades[upgrade], layer)
      upgradeButton.addEventListener('click', () => {
        buyBoardUpgrade(layer, boardUpgrades[upgrade], upgradeButton)
      })
      cardBody.appendChild(upgradeButton)

    }
  } else {
    let actionLabel = document.createElement('p')
    actionLabel.textContent = 'Build?'
    actionLabel.style.userSelect = 'none'
    cardBody.appendChild(actionLabel)

    for (const key in buildings) {
      let buildButton = drawCardButton(buildings[key], layer)
      buildButton.addEventListener('click', () => {
        buyBuilding(buildings[key], square)
      })
      cardBody.appendChild(buildButton)
    }
  }
}

function trytoupgrade(layer, num, upgrade) {
  console.log(`${layer} ${num} ${upgrade.id}`)
}

function buySquareUpgrade(squareId, squareType, key, upgradeButton) {
  let [layer, num] = [...squareId]
  let baseCost = buildings[squareType].upgrades[key].cost
  let finalCost = baseCost * (buildings[squareType].upgrades[key].levelCostMod ** (player.squares[layer][num].upgrades[key].level-1))
  if(player.money >= finalCost) {
    if (key === 'generated') {
      player.money -= finalCost
      player.squares[layer][num].upgrades[key].level++
      player.squares[layer][num].amount++
      drawCard(squareId)
      reDrawSquare(layer, num, squareType)
    }
  }
}

function buyBoardUpgrade(layer, upgrade, button) {
  if(!canAffordUpgrade(upgrade, layer)) {
    animateBrokeBitch(button)
  } else {   
    if (upgrade.id === 'gameSpeed') {
      let cost = upgrade.cost * (upgrade.layerCostMod ** (layer.charCodeAt(0) - 97)) * (upgrade.levelCostMod ** (player.boardUpgrades[layer][upgrade.id] - 1))
      player.money -= cost
      player.iterationSpeeds[layer] *= .7
      player.boardUpgrades[layer][upgrade.id]++
    }
  }
}

function animateBrokeBitch(button) {
  button.classList.add('cantAfford')
  setTimeout(() => button.classList.remove('cantAfford'),500)
}

function buyUpgrade(layer, squareId, upgrade, upgradeButton) {
  if (!canAffordSqUp(upgrade, layer, squareId)) {
    //animateBrokeBitch(upgradeButton)
    return
  } else {
    let playerSquare = player.squares[layer][squareId.charAt(1)]
    let level = playerSquare.upgrades[upgrade.id].level
    let cost = upgrade.cost * (upgrade.layerCostMod ** (layer.charCodeAt(0) - 97) * (upgrade.levelCostMod ** (level - 1)))

    console.log(`buy level ${level} on ${playerSquare.id}`)
    playerSquare.upgrades[upgrade.id].level++   
    player.money -= cost

    if (upgrade.id === 'generated') {
      playerSquare.amount *= 2
      playerSquare.amtSpan.textContent = `$${playerSquare.amount}`
    }
    if (upgrade.id === 'charges') {
      playerSquare.maxCharges += 4
      playerSquare.charges += 4
      playerSquare.chargeEl.textContent = `${playerSquare.charges}/${playerSquare.maxCharges} charges`      
    }

    drawCard(squareId)
    event.stopPropagation();
  }
}



function buyBuilding(building, square) {
  if (!canAffordBuilding(building.name, square.id.charAt(0))) return
  player.money -= building.cost
  let [layer, num] = [...square.id]
  player.squares[layer][num].type = building.name
  player.squares[layer][num].charges = building.charges
  player.squares[layer][num].maxCharges = building.maxCharges
  player.squares[layer][num].amount = building.amount
  player.squares[layer][num].upgrades = building.upgrades

  moneySpan.textContent = player.money.toFixed(2)

  reDrawSquare(layer, num, building.name)
  drawCard(square.id)
  //event.stopPropagation();
  
}



function reDrawSquare(layer, num, type) {

  let square = squaresEl[layer][num]
  square.innerHTML = ''

  let squareIdLabel = document.createElement('div')
  squareIdLabel.style.display = 'flex'
  squareIdLabel.style.width = '100%'
  squareIdLabel.style.justifyContent = 'space-between'
  squareIdLabel.style.fontSize = cardFontSize

  let left = document.createElement('span')
  player.squares[layer][num].amtSpan = left
  let right = document.createElement('span')
  left.textContent = `$${player.squares[layer][num].amount}`
  right.textContent = `[${layer}${num}]`
  squareIdLabel.style.color = secondaryTextColor

  square.appendChild(squareIdLabel)
  squareIdLabel.appendChild(left)
  squareIdLabel.appendChild(right)
  
  let newImage = document.createElement('div')
  newImage.classList.add(type)
  newImage.style.margin = `auto`
  player.squares[layer][num].imageDiv = newImage
  square.appendChild(newImage)


  //might need if generator
  let chargeDiv = document.createElement('div')
  let chargeSpan = document.createElement('span')
  chargeSpan.textContent = `${player.squares[layer][num].charges}/${player.squares[layer][num].maxCharges} charges`
  chargeDiv.appendChild(chargeSpan)
  chargeDiv.appendChild(document.createElement('br'))
  chargeDiv.style.fontStyle = 'italic'
  chargeDiv.style.margin = `auto`
  chargeDiv.style.textAlign = 'center'
  chargeDiv.style.fontSize = cardFontSize
  chargeDiv.style.color = primaryTextColor
  player.squares[layer][num].chargeEl = chargeSpan
  square.appendChild(chargeDiv)
  
  let squareTypeLabel = document.createElement('span')
  squareTypeLabel.style.color = secondaryTextColor;
  squareTypeLabel.textContent = type
  square.appendChild(squareTypeLabel)
}

function drawCardButton(obj, layer, square) {
  let layerNum = layer.charCodeAt(0)-97
  let newCost;
  if (square) {
    newCost = obj.cost * (obj.layerCostMod ** layerNum) * (obj.levelCostMod ** (square.upgrades[obj.id].level - 1))
  } else {
    newCost = obj.cost * (obj.layerCostMod ** layerNum)
  }

  // generic card button
  let newButton = document.createElement('button')
  let title = document.createElement('strong')
  let titleText = square ? `${obj.name} [Lv.${square.upgrades[obj.id].level}]` : `${obj.name}`
  title.appendChild(document.createTextNode(titleText))
  newButton.appendChild(title)
  newButton.appendChild(document.createElement('br'))
  let costText = document.createElement('em')
  costText.appendChild(document.createTextNode(`Cost : $${newCost.toFixed(2)}`))
  newButton.appendChild(costText)
  newButton.appendChild(document.createElement('br'))
  newButton.appendChild(document.createTextNode(obj.description))
  newButton.classList.add('cardButtons')

  return newButton
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
      let playerData = JSON.stringify(player);
      localStorage.setItem('savedGame', playerData);
  }


  if (currentPlayerSquare.type === 'Generator' && currentPlayerSquare.charges > 0) {
      player.squares[layer][counter[layer]].charges--
      player.money += player.squares[layer][counter[layer]].amount
      player.squares[layer][counter[layer]].chargeEl.textContent = `${player.squares[layer][counter[layer]].charges}/${player.squares[layer][counter[layer]].maxCharges} charges`
      let imageEl = player.squares[layer][counter[layer]].imageDiv
      playMoneyAnimation(squaresEl[layer][counter[layer]], player.squares[layer][counter[layer]].amount)
      let curr = `b${currentPlayerSquare.id}`     
      imageEl.classList.add('animate-rotation')
      setTimeout(() => {
              imageEl.classList.remove('animate-rotation')
      },1000)
  }



  let lastSelection = squaresEl[layer][(counter[layer] - 1 + squaresEl[layer].length) % squaresEl[layer].length]

      lastSelection.style.color = 'black'
      lastSelection.style.border = `1px solid ${menuColor}`
      lastSelection.style.backgroundColor = activeBgColor;

  currentElement.style.backgroundColor = menuColor
  currentElement.style.border = `1px dashed darkgray`
  currentElement.style.color = 'white'

  counter[layer] = (counter[layer] + 1) % squaresEl[layer].length

  moneySpan.textContent = player.money.toFixed(2)

  // convert to use gmLoop object?
  setTimeout(runGameStep, player.iterationSpeeds[layer], layer)
}


// let tempLoop = setInterval(() => {
//   saveGame();
//   saveButton.disabled = true;
//   saveButton.textContent = 'Saving...'
//   setTimeout(() => {
//     saveButton.textContent = 'Saved!'
//     setTimeout(() => {
//       saveButton.textContent = 'Save'
//       saveButton.disabled = false;
//     },1000)  
// },1000)
  
// }, 10000)

//initialize()