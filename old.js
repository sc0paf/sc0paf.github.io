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