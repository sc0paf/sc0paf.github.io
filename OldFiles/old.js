const theLoop = setInterval(() => {
    let currentSelectionA = squaresEl.a[iterator];


    if (player.activeSquares.includes('b')) {
        currentSelectionB = squaresEl.b[iteratorB];

        let lastSelectionB = squaresEl.b[(iteratorB - 1 + squaresEl.b.length) % squaresEl.b.length]
        if (lastSelectionB) {
            lastSelectionB.style.backgroundColor = '#ccc'
            lastSelectionB.style.color = 'black'
        }

        currentSelectionB.style.backgroundColor = 'black'
        currentSelectionB.style.color = 'white'
        iteratorB = (iteratorB + 1) % squaresEl.b.length
                
    }

    
    let lastSelection = squaresEl.a[(iterator - 1 + squaresEl.a.length) % squaresEl.a.length];
    
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

    iterator = (iterator + 1) % squaresEl.a.length;
    
}, 500)












 // /upgrades


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
} else if (square.type === 'Multi') {
    cardBody.appendChild(drawCardBody('Multi', 'Upgrades'))

    // draw buttons
    for (const key in buildings.Multi.upgrades) {
        let upgradeButton = drawCardButton(buildings.Multi.upgrades[key])
        upgradeButton.addEventListener('click', () => {
            console.log(buildings.Multi.upgrades[key].name)
        })
        cardBody.appendChild(upgradeButton)

    }     
} else {
    // blank card

}






// old gameloop
function runGameLoop(pause) {
    if (pause === true) { 
        clearInterval (gmLoop)
        return
    }

    gmLoop = setInterval(() => {
        player.activeSquares.forEach((layer) => {
            
            let currentSelection = squaresEl[layer][counter[layer]]
                        

            if(player.squares[layer][counter[layer]].type === 'Generator' && player.squares[layer][counter[layer]].charges > 0) {
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
                if (lastSelection) {
                    lastSelection.style.color = 'black'
                    lastSelection.style.border = `1px solid ${menuColor}`
                    lastSelection.style.backgroundColor = buttonBackground;
                }

                currentSelection.style.backgroundColor = menuColor
                currentSelection.style.border = `1px dashed darkgray`
                currentSelection.style.color = 'white'

                
                counter[layer] = (counter[layer] + 1) % squaresEl[layer].length
        })
        moneySpan.textContent = player.money.toFixed(2)

    },1000)
}


// find neighbors

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




// initializerizationizer. idk about this function is kinda sucks
function init() {
    saveData = localStorage.getItem('saveGame');
    if (saveData) {
      console.log('save data detected')
      let playerData = JSON.parse(saveData)
      player = playerData
      player.activeSquares.reverse()
    } else {
      console.log('no save data')
      player.activeSquares.forEach((layer) => {
        player.squares[layer] = [];
        player.layerMultis[layer] = 1;
        player.iterationSpeeds[layer] = 1000;
        player.boardUpgrades[layer] = {};
        for (const key in boardUpgrades) {
          player.boardUpgrades[layer][key] = 1
        }
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




  // dem bonez
function drawBoard(size) {
    // clear
    gridContainer.innerHTML = ''
    // set size
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`
    let howManyLayers = player.activeSquares.length
    let thisLayerOffset = 0
    let calcLength = size + 1
    let thisLayerLength = size
    if (player.activeSquares.length < 2) {
      gridContainer.style.padding = `5% 10%`
    } else if (player.activeSquares.length < 3) {
      gridContainer.style.padding = `5%`
    } 
    // build outside in bc feeble human brain
    player.activeSquares.reverse().forEach((letter) => {
      let count = 0
      if (!squaresEl[letter]) {squaresEl[letter] = []}
  
      // i bet this could be more efficient, but feeble human brain
      //top
      for (let top = 1; top < thisLayerLength; top++) {
        let gridArea = `${thisLayerOffset+1} / ${top+thisLayerOffset} / ${thisLayerOffset+2} / ${top+thisLayerOffset+1}`
        let sId = `${letter}${count}`
        let newSquare = drawBlankSquare(gridArea, letter, count)
        newSquare.id = sId;
        count++
        gridContainer.appendChild(newSquare)
      }
  
      //right 
      for (let right = 1; right < thisLayerLength; right++) {
        let gridArea = `${right + thisLayerOffset} / ${thisLayerLength+thisLayerOffset} / ${right + thisLayerOffset + 1} / ${thisLayerLength + 1 + thisLayerOffset}`
        let sId = `${letter}${count}`
        let newSquare = drawBlankSquare(gridArea, letter, count)
        newSquare.id = sId;
        count++
        gridContainer.appendChild(newSquare)
      }
  
      // bottom
      for (let bottom = 1; bottom < thisLayerLength; bottom++) {
        let gridArea = `${calcLength - 1} / ${calcLength - bottom} / ${calcLength} / ${calcLength - bottom + 1}`
        let sId = `${letter}${count}`
        let newSquare = drawASquare(gridArea, letter, count)
        newSquare.id = id;
        count++
        gridContainer.appendChild(newSquare)
      }
  
      //left
      for (let left = 1; left < thisLayerLength; left++) {
        let gridArea = `${calcLength - left} / ${thisLayerOffset + 1} / ${calcLength - left + 1} / ${thisLayerOffset + 2}`
        let sId = `${letter}${count}`
        let newSquare = drawASquare(gridArea, letter, count)
        newSquare.id = sId;
  
        count++
        gridContainer.appendChild(newSquare)
      }
    
    calcLength--
    thisLayerLength -= 2
    thisLayerOffset++
    })
  
    // draw the center. why is this so long? wtf?
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





  function generateColorSequence(count) {
    const startColor = [255, 0, 0]; // RGB values for the starting color (e.g., red)
    const endColor = [0, 0, 255];   // RGB values for the ending color (e.g., blue)
  
    const colorSequence = [];
  
    for (let i = 0; i < count; i++) {
      // Interpolate between startColor and endColor
      const interpolatedColor = interpolateColors(startColor, endColor, i / (count - 1));
      colorSequence.push(`${interpolatedColor.join(',')}`);
    }
  
    return colorSequence;
  }
  
  // Helper function to interpolate between two RGB colors
  function interpolateColors(color1, color2, ratio) {
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(Math.round(color1[i] + ratio * (color2[i] - color1[i])));
    }
    return result;
  }
  
  // Example: generate color sequence for 5 objects
  const colorSequence = generateColorSequence(5);
  colorSequence.forEach((color, index) => {
    console.log(`${color}`);
  });




  function fillCard(squareID) {
    cardHeader.textContent = ''
    cardBody.textContent = ''
  
    let idObj = splitId(squareID)
  
    const playerSquare = player.squares[idObj.layer][idObj.number]
  
    // header..
    cardHeader.textContent = `${idObj.id} - ${playerSquare.type}`
  
    // flavor text
    let cardName = document.createElement('strong')
    cardName.appendChild(document.createTextNode(playerSquare.type === 'None' ? 'Nothing here...' : playerSquare.type))
  
  
    if (playerSquare.type === 'Generator') {
      let chargeBtn = document.createElement('button');
  
      // Flesh out charge button
      chargeBtn.style.width = '100%';
      chargeBtn.style.height = '3rem';
      chargeBtn.textContent = 'Charge?'
  
      chargeBtn.addEventListener('click', () => {
        // flesh out charge action.
        console.log(`Charge ${playerSquare.id}`)
      })
  
      cardBody.append(chargeBtn, cardName)
  
    } else if (playerSquare.type === 'None') {
      let flavorText = document.createElement('p')
      flavorText.textContent = 'Build?'
      cardBody.appendChild(flavorText)
  
      
  
      for (const building in buildings) {
        let buildingButton = document.createElement('button')
        buildingButton.classList.add('cardButtons')
        let buildingName = document.createElement('strong')
        let buildingCost = document.createElement('span')
        buildingCost.style.fontStyle = 'italic'
        let buildingDescription = document.createElement('span')
  
  
        buildingName.textContent = buildings[building].name
        buildingCost.textContent = `Cost: $${buildings[building].cost}`
        buildingDescription.textContent = buildings[building].description
  
        buildingButton.append(buildingName, document.createElement('br'), buildingCost, document.createElement('br'), buildingDescription)
        buildingButton.addEventListener('click', ()=> {
          createBuilding(buildings[building], playerSquare, buildingButton)
        })
        cardBody.appendChild(buildingButton)
        
      }
    }
  
  }

// function createBuilding(buildingObj, playerSquareObj, buildButton) {
//   if (player.money >= buildingObj.cost) {
//     let whichSquare = splitId(playerSquareObj.id)
//     let squareEle = playerSquareObj.element
//     player.squares[whichSquare.layer][whichSquare.number] = new Generator(whichSquare.id, 'Generator', playerSquareObj.element)
//     let newInner = populateSquare(player.squares[whichSquare.layer][whichSquare.number])
//     squareEle.innerHTML = ''
//     squareEle.appendChild(newInner)
//     fillCard(whichSquare.id)

//   } else { 
//     animateBrokeBitch(buildButton)
//   }
// }





// ternary stuff 
// THIS MIGHT BE USEFUL LATER
function canAffordBuilding(building, layer) { return player.money >= buildings[building].cost * (buildings[building].layerCostMod ** (layer.charCodeAt(0)-97)) }                                                                     
function canAffordUpgrade(upgrade, layer) { return player.money >= upgrade.cost * (upgrade.layerCostMod ** (layer.charCodeAt(0) - 97)) * (1.4 ** player.boardUpgrades[layer][upgrade.id]) }
function canAffordSqUp (upgrade, layer, id) { 
  let squareIndex = id.charAt(1)
  let level = player.squares[layer][squareIndex].upgrades[upgrade.id].level
  let fetchCost = upgrade.cost * (upgrade.layerCostMod ** (layer.charCodeAt(0) - 97) * (1.4 ** (level - 1)))
  return player.money >= fetchCost
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


// document.addEventListener('click', function(event) { 
//   // Check if the click is outside the popup 
//   if (!cardModal.contains(event.target) && cardModal.style.display === 'block') { 
//     // If outside, close the popup 
//     openModal('close'); 
//   } 
// });

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