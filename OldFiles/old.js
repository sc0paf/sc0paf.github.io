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