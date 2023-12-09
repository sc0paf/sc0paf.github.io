// Elements
const gridContainer = document.getElementById('gridContainer');
const cardModal = document.getElementById('cardContainer');
const cardHeader = document.getElementById('cardHeader');
const cardBody = document.getElementById('cardBody');
let moneySpan;
let activeChargeBtn
let saveButton = document.getElementById('saveButton')

// CSS Variables
const rootStyles = getComputedStyle(document.documentElement);
const activeBgColor = rootStyles.getPropertyValue('--active-bg-color');
const menuColor = rootStyles.getPropertyValue('--menu-color');
const primaryTextColor = rootStyles.getPropertyValue('--primary-text');
const secondaryTextColor = rootStyles.getPropertyValue('--secondary-text');

// various Data
let saveData;
let squaresEl = {};
let counter = {};
let modalState = false;

let player = {
  money: 5,
  intervals: {},
  iterationSpeeds: {},
  layerMultis: {},
  activeSquares: ['a'],
  squares: {}
}


function saveGame() {
  let playerData = JSON.stringify(player);
  localStorage.setItem('saveGame', playerData)
}

function dS() {
  localStorage.removeItem('saveGame')
}

function init() {
  saveData = localStorage.getItem('saveGame');
  if (saveData) {
    console.log('save data detected')
    let playerData = JSON.parse(saveData)
    player = playerData
  } else {
    console.log('no save data')
    player.activeSquares.forEach((layer) => {
      player.squares[layer] = [];
      player.layerMultis[layer] = 1;
      player.iterationSpeeds[layer] = 1000;
    })
  }

  let currentBoardSize = player.activeSquares.length * 2 + 1;

  drawBoard(currentBoardSize);

  player.activeSquares.forEach((layer) => {
    counter[layer] = 0;
    squaresEl[layer][counter[layer]].style.backgroundColor = menuColor
    squaresEl[layer][counter[layer]].style.border = `1px dashed darkgray`
    squaresEl[layer][counter[layer]].style.color = 'white'

    counter[layer]++

    setTimeout(() => {
      runGameStep(layer)
    }, player.iterationSpeeds[layer])
  })

}



function drawBoard(size) {
  // clear
  gridContainer.innerHTML = ''

  // set size
  gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`
  gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`

  // might not need this?
  let howManyLayers = player.activeSquares.length

  let thisLayerOffset = 0
  let calcLength = size + 1
  let thisLayerLength = size

  if (player.activeSquares.length < 2) {
    gridContainer.style.padding = `10% 25%`
  } else if (player.activeSquares.length < 3) {
    gridContainer.style.padding = `10%`
  }

  player.activeSquares.reverse().forEach((letter) => {
    let count = 0
    if (!squaresEl[letter]) {squaresEl[letter] = []}

    //top
    for (let top = 1; top < thisLayerLength; top++) {
      let gridArea = `${thisLayerOffset+1} / ${top+thisLayerOffset} / ${thisLayerOffset+2} / ${top+thisLayerOffset+1}`
      let id = `${letter}${count}`
      let newSquare = drawASquare(gridArea, letter, count)
      // how to handle saves???
      count++
      gridContainer.appendChild(newSquare)
    }

    //right 
    for (let right = 1; right < thisLayerLength; right++) {
      let gridArea = `${right + thisLayerOffset} / ${thisLayerLength+thisLayerOffset} / ${right + thisLayerOffset + 1} / ${thisLayerLength + 1 + thisLayerOffset}`
      let id = `${letter}${count}`
      let newSquare = drawASquare(gridArea, letter, count)
      count++
      gridContainer.appendChild(newSquare)
    }

    // bottom
    for (let bottom = 1; bottom < thisLayerLength; bottom++) {
      let gridArea = `${calcLength - 1} / ${calcLength - bottom} / ${calcLength} / ${calcLength - bottom + 1}`
      let id = `${letter}${count}`
      let newSquare = drawASquare(gridArea, letter, count)
      count++
      gridContainer.appendChild(newSquare)
  }

    //left
    for (let left = 1; left < thisLayerLength; left++) {
      let gridArea = `${calcLength - left} / ${thisLayerOffset + 1} / ${calcLength - left + 1} / ${thisLayerOffset + 2}`
      let id = `${letter}${count}`
      let newSquare = drawASquare(gridArea, letter, count)


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
  currentMoney.textContent = player.money
  centerDiv.appendChild(moneyLabel)
  centerDiv.appendChild(document.createElement('br'))
  centerDiv.appendChild(currentMoney)
  moneyLabel.style.width = `90%`
  currentMoney.style.width = `90%`
  gridContainer.appendChild(centerDiv)
  moneySpan = currentMoney
  centerDiv.style.lineHeight = '1.5rem'
}

function drawASquare(area, layer, count) {
  //generic square stuff
  let newSquare = document.createElement('div')
  newSquare.classList.add('grid-item')
  newSquare.style.gridArea = area
  newSquare.id = `${layer}${count}`

  let idLabelSpan = document.createElement('span')
  idLabelSpan.style.margin = `0 0 auto auto`
  idLabelSpan.style.color = secondaryTextColor
  idLabelSpan.textContent = `[${layer}${count}]`
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

  if (type === 'Generator') {
    let newImage = document.createElement('div')
    newImage.classList.add(type)
    newImage.style.margin = `auto`
    newSquare.appendChild(newImage)
    player.squares[layer][count].imageDiv = newImage

    let chargeDiv = document.createElement('div')
    let currentMax = document.createElement('span')
    currentMax.textContent = `${player.squares[layer][count].charges}`
    chargeDiv.appendChild(currentMax)
    chargeDiv.appendChild(document.createElement('br'))
    let chargeLabel = document.createElement('span')
    chargeLabel.textContent = 'Charges'
    chargeDiv.appendChild(chargeLabel)
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

function openModal(id, type) {
  cardModal.style.display = id === 'close' ? 'none' : 'block';
  if (id !== 'close') {
    drawCard(id)
    cardModal.style.top = (event.pageY + cardModal.clientHeight / 2) + 'px';
    cardModal.style.left = (event.pageX + cardModal.clientWidth / 2) + 'px';    
  }
  event.stopPropagation();
}

function drawCard(id) {
  cardHeader.textContent = ''
  cardBody.textContent = ''
  let layer = id.charAt(0)
  const square = player.squares[layer].find(obj => obj.id === id)
  cardHeader.textContent = `${id} - ${square.type}`
  let cardName = document.createElement('strong')
  cardName.appendChild(document.createTextNode(square.type === 'None' ? 'Nothing here..' : square.type))
  cardBody.appendChild(cardName)

  if (square.type === 'Generator') {
    // draw Generator Card
    let chargeBtn = document.createElement('button')
    chargeBtn.style.width = '100%'
    chargeBtn.style.height = '3rem'
    chargeBtn.textContent = `Charge [${square.charges} / ${square.maxCharges}]`
    chargeBtn.style.fontFamily = 'monospace'
    chargeBtn.id = `b${id}`
    activeChargeBtn = chargeBtn
    chargeBtn.addEventListener('click', () => {
      if (square.charges < square.maxCharges) {
        chargeBtn.style.transform = 'scale(1.05)'
        setTimeout(() => {chargeBtn.style.transform = `scale(1.0)`}, 100)
        square.charges++
        square.chargeEl.textContent = `${square.charges} Charges`
        chargeBtn.textContent = `Charge [${square.charges} / ${square.maxCharges}]`
      }
    })
    cardBody.appendChild(chargeBtn)

    for (const key in buildings[square.type].upgrades) {
      let upgradeButton = drawCardButton(buildings[square.type].upgrades[key])
      upgradeButton.addEventListener('click', () => {
        buyUpgrade(square, buildings[square.type].upgrades[key].id)
      })
      cardBody.appendChild(upgradeButton)
    }




  } else if (square.type === 'Home') {
    //draw home card
  } else {
    let actionLabel = document.createElement('p')
    actionLabel.textContent = 'Build?'
    actionLabel.style.userSelect = 'none'
    cardBody.appendChild(actionLabel)

    for (const key in buildings) {
      let buildButton = drawCardButton(buildings[key])
      buildButton.addEventListener('click', () => {
        buyBuilding(buildings[key], square)
      })
      cardBody.appendChild(buildButton)
    }

  }
}

function canAffordBuilding(building) {
  console.log(buildings.cost)
  return player.money >= buildings[building].cost ? true : false
}

function buyBuilding(building, square) {
  if (!canAffordBuilding(building.name)) return
  player.money -= building.cost
  let [layer, num] = [...square.id]
  player.squares[layer][num].type = building.name
  player.squares[layer][num].charges = building.charges
  player.squares[layer][num].maxCharges = building.maxCharges
  player.squares[layer][num].amount = building.amount
  player.squares[layer][num].upgrades = building.upgrades

  moneySpan.textContent = player.money
  reDrawSquare(layer, num, building.name)
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
  player.squares[layer][num].imageDiv = newImage
  square.appendChild(newImage)


  //might need if generator
  let chargeDiv = document.createElement('div')
  let currentMax = document.createElement('span')
  currentMax.textContent = `5`
  chargeDiv.appendChild(currentMax)
  chargeDiv.appendChild(document.createElement('br'))
  let chargeLabel = document.createElement('span')
  chargeLabel.textContent = 'Charges'
  chargeDiv.appendChild(chargeLabel)
  chargeDiv.style.fontStyle = 'italic'
  chargeDiv.style.margin = `auto`
  chargeDiv.style.textAlign = 'center'
  chargeDiv.style.color = primaryTextColor
  player.squares[layer][num].chargeEl = chargeDiv
  square.appendChild(chargeDiv)
  
  let squareTypeLabel = document.createElement('span')
  squareTypeLabel.style.color = secondaryTextColor;
  squareTypeLabel.textContent = type
  square.appendChild(squareTypeLabel)
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


let tempLoop = setInterval(() => {
  saveGame();
  saveButton.disabled = true;
  saveButton.textContent = 'Saving...'
  setTimeout(() => {
    saveButton.textContent = 'Saved!'
    setTimeout(() => {
      saveButton.textContent = 'Save'
      saveButton.disabled = false;
    },1000)  
},1000)
  console.log('saved')
  
}, 10000)

init()