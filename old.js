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
