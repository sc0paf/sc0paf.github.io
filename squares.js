// Elements
const gridContainer = document.getElementById('gridContainer');
const cardModal = document.getElementById('cardContainer');
const cardHeader = document.getElementById('cardHeader');
const cardBody = document.getElementById('cardBody');
const saveButton = document.getElementById('saveButton');
let moneySpan, activeChargeBtn;


// CSS Variables
const rootStyles = getComputedStyle(document.documentElement);
const activeBgColor = rootStyles.getPropertyValue('--active-bg-color');
const menuColor = rootStyles.getPropertyValue('--menu-color');
const primaryTextColor = rootStyles.getPropertyValue('--primary-text');
const secondaryTextColor = rootStyles.getPropertyValue('--secondary-text');
let cardFontSize = () => { return player.activeSquares.length < 2 ? '1rem' : '.6rem' };

let squaresEl = {}, counter = {}, timers = {}, player = {};
let modalState = false;

function viewSave() {
  let mySave = localStorage.getItem('savedPlayerData');
  let output = JSON.parse(mySave)
  console.log(output)

}

function startGame() {
  let loadPlayerData = localStorage.getItem('savedPlayerData');
  let loadedData;
  
  if (loadPlayerData) {
    console.log('Data detected: Load Player')
    // save detected, load player data.
    let loadedPlayerData = JSON.parse(loadPlayerData)
    player.money = loadedPlayerData.money
    player.activeSquares = loadedPlayerData.activeSquares
    player.intervals = loadedPlayerData.intervals
    player.layerData = loadedPlayerData.layerData
    player.squares = {}
    for (const layer in loadedPlayerData.squares) {
      counter[layer] = 1
      clearTimeout(timers[layer])
      player.squares[layer] = {}
      for (const playerSquares in loadedPlayerData.squares[layer]) {

        let thisObj = loadedPlayerData.squares[layer][playerSquares]

        if (thisObj.cName === 'Home') {
          player.squares[layer][playerSquares] = new Home(thisObj.id, thisObj.cName, '', [thisObj.upgrades.layerSpeed, thisObj.upgrades.addLayer])
        }
        if (thisObj.cName === 'Blank') {
         player.squares[layer][playerSquares] = new Blank(thisObj.id, thisObj.cName)
        } 
        if (thisObj.cName === 'Generator') {
          player.squares[layer][playerSquares] = new Generator(thisObj.id, thisObj.cName, '', thisObj.charges, thisObj.maxCharges, thisObj.amount, [thisObj.upgrades.generated, thisObj.upgrades.maxCharges])
        } 
        if (thisObj.cName === 'Charger') {
          player.squares[layer][playerSquares] = new Charger(thisObj.id, thisObj.cName, '', [thisObj.upgrades.fastCharge, thisObj.upgrades.chargeAmt])
        }
      }
    }


  } else {
    // no save, draw player object
    console.log('No data: create Player')
    player.money = 10;
    player.intervals = {};
    player.activeSquares = ['a'];
    player.layerData = {
      a: {
        iterationSpeeds: 1000,
        boardUpgrades: [],
      },
      b: {
        iterationSpeeds: 1000,
        boardUprades: []
      }
    };
    player.squares = {};


    player.activeSquares.forEach((layer) => {
      let layerSize = (layer.charCodeAt(0) - 96) * 8
      counter[layer] = 1
      player.squares[layer] = {}
      for (let i = 0; i < layerSize; i++) {
        if (i === 0) {
          let sid = `${layer}${i}`
          player.squares[layer][i] = new Home(sid, 'Home', '', [1,1])
        } else {
        let sid = `${layer}${i}`
        player.squares[layer][i] = new Blank(sid, 'Blank')
        }
      }
    })
  }
  console.log('player data loaded, drawing board...')
  let boardSize = player.activeSquares.length * 2 + 1;
  drawBoard(boardSize);

  setPadding();

  populateBoard();

  setInitialSquares();

  player.activeSquares.forEach((layer) => {
    clearTimeout(timers[layer])
    gameStep(layer)
  })
}


function resetBoard(newActive) {
  console.log('Resetting...')
  player.money = 10;
  player.intervals = {}
  player.activeSquares = newActive;
  player.layerData = {}
  player.squares = {}
  console.log(player.squares)

  player.activeSquares.forEach((layer) => {
    player.layerData[layer] = {}
    player.layerData[layer].iterationSpeeds = 1000
    player.layerData[layer].boardUprades = []

    let layerSize = (layer.charCodeAt(0) - 96) * 8
    counter[layer] = 1
    player.squares[layer] = {}
    for (let i = 0; i < layerSize; i++) {
      if (i === 0) {
        let sid = `${layer}${i}`
        player.squares[layer][i] = new Home(sid, 'Home', '', [1,1])
      } else {
      let sid = `${layer}${i}`
      player.squares[layer][i] = new Blank(sid, 'Blank')
      }
    }
  })

  console.log('player data loaded, drawing board...')
  let boardSize = player.activeSquares.length * 2 + 1;
  drawBoard(boardSize);

  setPadding();

  populateBoard();

  setInitialSquares();

  player.activeSquares.forEach((layer) => {
    clearTimeout(timers[layer])
    gameStep(layer)
  })
}

window.addEventListener('resize', setPadding);

// returns 'a2' as an object with properties layer (a) number (2) and id (a2)
function splitId(id) {
  let layer = id.charAt(0);
  let number = parseInt(id.slice(1), 10);
  return { id, layer, number };
}


// draw a square, blank
function drawBlankSquare(area, layer, count) {
  let newSquare = document.createElement('div')
  newSquare.classList.add('grid-item')
  newSquare.style.gridArea = area
  newSquare.id = `${layer}${count}`

  newSquare.classList.add('active')
  return newSquare
}

// Draw the current board, blank
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

// dynamic padding for mobile - make this better
function setPadding() {
  if (window.innerWidth > 600) {
    // Larger screens
    if (player.activeSquares.length < 2) {
      gridContainer.style.padding = `0 25%`;
    } else if (player.activeSquares.length < 3) {
      gridContainer.style.padding = `5%`;
    }
  } else {
    // Smaller screens (e.g., mobile devices)
    gridContainer.style.padding = `0%`;
  }
}

function populateSquare(playerSquare) {
  let squareID = splitId(playerSquare.id)

  let returnSquare = document.createDocumentFragment();
  let headerDiv = document.createElement('div')
  let left = document.createElement('span')
  let right = document.createElement('span')

  headerDiv.style.display = 'flex'
  headerDiv.style.width = '100%'
  headerDiv.style.justifyContent  = 'space-between'
  headerDiv.style.margin = '0 0 auto auto'

  switch (playerSquare.type) {
    case 'Generator':
      left.textContent = `$${playerSquare.amount}`
      break;
    case 'Multi':
      left.textContent = `x${playerSquare.amount}`
      break;
    default:
      left.textContent = ''
      break;
  }

  right.textContent = `[${playerSquare.id}]`
  headerDiv.append(left, right)
  returnSquare.appendChild(headerDiv)


  let imageDiv = document.createElement('div')
  imageDiv.classList.add(playerSquare.type)
  imageDiv.style.margin = 'auto'
  returnSquare.appendChild(imageDiv)

  if (playerSquare.type === 'Generator') {
    let chargeDiv = document.createElement('div')
    chargeDiv.textContent = `[${playerSquare.charges}/${playerSquare.maxCharges}]`
    returnSquare.appendChild(chargeDiv)

  } else if (playerSquare.type === 'Home') {
    let layerInfo = document.createElement('div')
    layerInfo.style.display = 'flex'
    layerInfo.style.height = '100%'
    layerInfo.style.width = '100%'
    layerInfo.style.alignItems = 'center'
    layerInfo.style.justifyContent = 'center'
    let layerSpeedText = document.createElement('strong')
    layerSpeedText.textContent = `${squareID.layer.charAt(0)} speed: ${(player.layerData[squareID.layer].iterationSpeeds/1000).toFixed(2)}/s`
    layerInfo.appendChild(layerSpeedText)
    returnSquare.appendChild(layerInfo)
  }

  let squareTypeLabel = document.createElement('div')
  squareTypeLabel.textContent = playerSquare.type

  returnSquare.appendChild(squareTypeLabel)

  return returnSquare;
}

// FILL EM UP
function populateBoard() {
  for (const layer in player.squares) {

    for (const square in player.squares[layer]) {
      let currentElement = player.squares[layer][square].element
      currentElement.innerHTML = ''
      let thisPlayerSquare = player.squares[layer][square]
      let newSquare = populateSquare(player.squares[layer][square])
      
      currentElement.appendChild(newSquare)

      currentElement.addEventListener('click', () => {
        cardDraw(thisPlayerSquare.id)
        runModal(thisPlayerSquare.id)
      });
    };
  };
}

function setInitialSquares() {
  player.activeSquares.forEach((layer) => {
    console.log(`set ${squaresEl[layer][0].id}`)
    let square = player.squares[layer][0].element
    square.classList.add('selected')
  })
}

function cardDraw(psquare) {
  cardHeader.textContent = ''
  cardBody.textContent = ''
  let squareID = splitId(psquare)

  const playerSquare = player.squares[squareID.layer][squareID.number]

  //header
  cardHeader.textContent = `${playerSquare.id} - ${playerSquare.type}`

  // flavor text
  let cardName = document.createElement('strong')
  cardName.appendChild(document.createTextNode(playerSquare.type === 'Blank' ? 'Nothing here...' : playerSquare.type)) 

  if (playerSquare.type === 'Home') {
    let layerLabel = document.createElement('div')
    layerLabel.textContent = 'Upgrade?'
    cardBody.appendChild(layerLabel)

    for (const upgrade in playerSquare.upgrades) {

      let newbtn = document.createElement('button')
      if (upgrade === 'addLayer') { 
        newbtn.disabled = playerSquare.canBuyLayer(squareID.layer)
      }
      let uid = document.createElement('strong')
      uid.textContent = `${playerSquare.upgrades[upgrade].name} - Lv. ${playerSquare.upgrades[upgrade].level - 1}`
      newbtn.classList.add('cardButtons')

      newbtn.style.disabled = playerSquare.upgrades[upgrade].level < playerSquare.upgrades[upgrade].maxLevel
      
      cardBody.append(newbtn)
      newbtn.appendChild(uid)
      newbtn.appendChild(document.createElement('br'))
      let costText = document.createElement('span')
      costText.textContent = `Cost: ${playerSquare.getUpgradeCost(upgrade, squareID.layer)}`
      costText.style.fontStyle = 'italic'

      let descText = document.createElement('span')
      descText.textContent = playerSquare.upgrades[upgrade].description
      newbtn.append(costText, document.createElement('br'), descText)

      newbtn.addEventListener('click', () => {
        if (playerSquare.canAffordUpgrade(upgrade, squareID.layer)) {
          playerSquare.buyUpgrade(upgrade, squareID.layer)
          cardDraw(psquare)
        } else {
          animateBrokeBitch(newbtn)
        }
      })
    }
  }

  

  if (playerSquare.type === 'Generator') {
    let chargeBtn = document.createElement('button')
    chargeBtn.style.width = '100%'
    chargeBtn.style.height = '3rem'
    chargeBtn.textContent = `Charge [${playerSquare.charges} / ${playerSquare.maxCharges}]` // finish this
    chargeBtn.style.fontFamily = 'monospace'

    chargeBtn.addEventListener('click', () => {
      playerSquare.charge(chargeBtn)
    })

    chargeBtn.id = playerSquare.id

    activeChargeBtn = chargeBtn

    cardBody.appendChild(chargeBtn)

    let upgradesLabel = document.createElement('p')
    upgradesLabel.textContent = 'Upgrades:'
    cardBody.appendChild(upgradesLabel)
    for (const upgrade in playerSquare.upgrades) {
      let upgradeBtn = document.createElement('button')
      let upgradeTitle = document.createElement('strong')
      upgradeTitle.textContent = `${playerSquare.upgrades[upgrade].name} Lv.${playerSquare.upgrades[upgrade].level - 1}`
      let costDisplay = document.createElement('span')
      costDisplay.textContent = `Cost: ${playerSquare.getUpgradeCost(playerSquare.upgrades[upgrade].id, squareID.layer).toFixed(2)}`
      costDisplay.style.fontStyle = 'italic'
      let description = document.createElement('span')
      description.textContent = playerSquare.upgrades[upgrade].description
      upgradeBtn.classList.add('cardButtons')

      upgradeBtn.addEventListener('click', () => {
        if (playerSquare.canBuyUpgrade(upgrade, squareID.layer)) {
          playerSquare.doUpgrade(upgrade, squareID.layer)
          cardDraw(psquare)
          let newBoardSquare = populateSquare(player.squares[squareID.layer][squareID.number])
          player.squares[squareID.layer][squareID.number].element.innerHTML = ''
          player.squares[squareID.layer][squareID.number].element.appendChild(newBoardSquare)
        } else {
          animateBrokeBitch(upgradeBtn)
        }
      })
      
      upgradeBtn.append(upgradeTitle, document.createElement('br'), costDisplay, document.createElement('br'), description)
      cardBody.appendChild(upgradeBtn)
    }

    
  } else if (playerSquare.type === 'Blank') {
    let flavorText = document.createElement('p')
    flavorText.textContent = 'Build?'
    cardBody.appendChild(flavorText)

    for (const building in playerSquare.availableBuildings) {
      let current = playerSquare.availableBuildings[building]
      let buildingButton = document.createElement('button')
      buildingButton.classList.add('cardButtons')
      let buildingName = document.createElement('strong')
      let buildingCost = document.createElement('span')
      buildingCost.style.fontStyle = 'italic'
      let buildingDescription = document.createElement('span')

      buildingName.textContent = current.type
      buildingCost.textContent = `Cost: $${playerSquare.getBuildingCost(current.type, squareID.layer)}`
      buildingDescription.textContent = current.description

      buildingButton.append(buildingName, document.createElement('br'), buildingCost, document.createElement('br'), buildingDescription)
      buildingButton.addEventListener('click', ()=> {

        if (playerSquare.canBuyBuilding(current.type, squareID.layer)) {
          let newBuilding = playerSquare.getBuilding(current.type, squareID.layer)
          let newCost = playerSquare.getBuildingCost(current.type, squareID.layer)
          player.money -= newCost
          moneySpan.textContent = player.money.toFixed(2)
          if (current.type === 'Generator') {
          player.squares[squareID.layer][squareID.number] = new newBuilding(psquare, current.type, playerSquare.element, 5, 5, 2, [1, 1])
          } else if (current.type === 'Charger') {
            player.squares[squareID.layer][squareID.number] = new newBuilding(psquare, current.type, playerSquare.element, [1, 1])
          }

          cardDraw(psquare)
          let newBoardSquare = populateSquare(player.squares[squareID.layer][squareID.number])
          player.squares[squareID.layer][squareID.number].element.innerHTML = ''
          player.squares[squareID.layer][squareID.number].element.appendChild(newBoardSquare)
      
        } else {
          animateBrokeBitch(buildingButton)
        }
      })
      cardBody.appendChild(buildingButton)
      
    }
  } else if (playerSquare.type === 'Charger') {
    let chargerDescription = document.createElement('div')
    chargerDescription.textContent = playerSquare.description
    cardBody.appendChild(chargerDescription)
    let newThing = document.createElement('button')
    newThing.textContent = 'Aheu'
    newThing.classList.add('cardButtons')
    cardBody.appendChild(newThing)
    newThing.addEventListener('click', () => {
      playerSquare.getSurroundingSquares(squareID.layer)
    }) 
  }
}


function saveMe() {
  let savePlayerData = JSON.stringify(player)
  localStorage.setItem('savedPlayerData', savePlayerData)
  console.log('Saving...')
  saveButton.disabled = true
  saveButton.textContent = 'Saving...'
  setTimeout(() => {
    saveButton.disabled = false
    saveButton.textContent = 'Save'
  },1000)
}

function kill() {
  localStorage.removeItem('savedPlayerData')
}


// Just open and close.
// TODO : Click outside closes?
function runModal (squareID) {
  if (squareID == 'close') {
    cardModal.style.display = 'none'
  }

  if (squareID !== 'close') {
    cardModal.style.display = 'block'

    const modalWidth = cardModal.clientWidth;
    const modalHeight = cardModal.clientHeight;
    const mouseX = event.pageX;
    const mouseY = event.pageY;

    const maxX = window.innerWidth - (modalWidth * .6)
    const maxY = window.innerHeight - (modalHeight * .6)

    let modalX = mouseX + modalWidth / 2;
    let modalY = mouseY + modalHeight / 2;

    modalX = Math.min(modalX, maxX);
    modalY = Math.min(modalY, maxY);

    cardModal.style.top = modalY + 'px';
    cardModal.style.left = modalX + 'px';
  }
}





startGame()


function animateBrokeBitch(button) {
  button.classList.add('cantAfford')
  setTimeout(() => button.classList.remove('cantAfford'),500)
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

function gameStep(layer) {
  let thisLength = Object.keys(player.squares[layer]).length

  let currentPlayerSquare = player.squares[layer][counter[layer]]

  let currentElement = player.squares[layer][counter[layer]].element


  if (layer === 'a' && counter[layer] === 0) {
    saveMe()
  }

  if (currentPlayerSquare.type === 'Generator' && currentPlayerSquare.charges > 0) {
    player.money += currentPlayerSquare.amount
    moneySpan.textContent = player.money
    currentPlayerSquare.charges--
    if (activeChargeBtn && activeChargeBtn.id === currentPlayerSquare.id) {
      activeChargeBtn.textContent = `[Charge ${currentPlayerSquare.charges} / ${currentPlayerSquare.maxCharges}]`
    }

    
    currentElement.innerHTML = ''
    let redraw = populateSquare(currentPlayerSquare)
    currentElement.appendChild(redraw)
    playMoneyAnimation(currentElement, currentPlayerSquare.amount)
  }


  let lastSelection = player.squares[layer][(counter[layer] - 1 + thisLength) % thisLength].element



  if (lastSelection) {
    lastSelection.classList.remove('selected')
  }

  currentElement.classList.add('selected')

  counter[layer] = (counter[layer] + 1) % thisLength


  moneySpan.textContent = player.money.toFixed(2)


  timers[layer] = setTimeout(() => {
    gameStep(layer)
  }, player.layerData[layer].iterationSpeeds)
}