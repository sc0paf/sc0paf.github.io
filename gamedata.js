class Blank {
    constructor(sID, type) {
        this.id = sID
        this.type = type
        this.availableBuildings = [
        {
            type: 'Generator',  
            typeClass: Generator,
            cost: 5,
            description: 'Generates $2.',
            layerCostMod: 1.5
        }, 
        {
            type: 'Multi (not implemented)',
            typeClass: Multi,
            cost: 15,
            description: 'Idk - multiplies something IG.',
            layerCostMod: 2.5
        }
    ]
    }

    toJSON() {
        return {
          cName: this.type,
          id: this.id,
          type: this.type
        }
    }

    getBuildingCost(buildingType, layer) {
        let layerNum = layer.charCodeAt(0) - 97
        const building = this.availableBuildings.find(building => building.type === buildingType)
        return building.cost * (building.layerCostMod ** layerNum)
    }

    canBuyBuilding(buildingType, layer) {
        const building = this.availableBuildings.find(building => building.type === buildingType)
        return player.money >= this.getBuildingCost(buildingType, layer)
    }

    getBuilding(buildingType, layer) {
        if (this.canBuyBuilding(buildingType, layer)) {
            const building = this.availableBuildings.find(building => building.type === buildingType)
            const newClass = building.typeClass

            return newClass
        }   
    }
}

class Multi extends Blank {

}




class Home {
    constructor(sID, type, element, upgraded) {
        this.id = sID
        this.type = type
        this.element = element
        this.upgrades = {
            layerSpeed: {
                name: 'Layer Speed',
                id: 'layerSpeed',
                description: 'vroooooom',
                baseCost: 150,
                layerCostMod: 3,
                levelCostMod: 2.5,
                level: upgraded[0],
                maxLevel: 10
            },
            addLayer: {
                name: 'Add Layer',
                id: 'addLayer',
                description: 'Reset everything and gain another layer.',
                level: upgraded[1],
                layerCostMod: 5,
                levelCostMod: 1,
                maxLevel: 2,
                baseCost: 1000
            }
        }
    }

    canAffordUpgrade(upgradeID, layer) {
        return player.money >= this.getUpgradeCost(upgradeID, layer)
    }

    canBuyLayer (layer) {
        return player.activeSquares.length > (layer.charCodeAt(0) - 96)
    }

    buyUpgrade(upgradeID, layer) {
        if (upgradeID === 'layerSpeed') {
            if (this.upgrades[upgradeID].level < this.upgrades[upgradeID].maxLevel) {
                this.upgrades[upgradeID].level++
                player.layerData[layer].iterationSpeeds *= .9
                this.element.innerHTML = ''
                let redraw = populateSquare(this)
                this.element.appendChild(redraw)
            }
        } else if (upgradeID === 'addLayer') {
            if (this.upgrades[upgradeID].level < this.upgrades[upgradeID].maxLevel) {
                player.activeSquares.forEach((layer) => {
                    clearTimeout(timers[layer])
                })
                let thisLayer = layer.charCodeAt(0)+1
                let nextLayer = String.fromCharCode(thisLayer)
                player.activeSquares.push(nextLayer)
                resetBoard(player.activeSquares)
            }
        }
    }

    getUpgradeCost(upgradeID, layer) {
        let layerNumb = layer.charCodeAt(0) - 97
        let baseCost = this.upgrades[upgradeID].baseCost
        let levelMod = this.upgrades[upgradeID].levelCostMod
        let layerMod = this.upgrades[upgradeID].layerCostMod
        let level = this.upgrades[upgradeID].level

        return baseCost * (levelMod ** (level - 1)) * (layerMod ** layerNumb)
        // return this.upgrades[upgradeID].baseCost * (this.upgrades[upgradeID].levelCostMod ** (this.upgrades[upgradeID].level - 1)) * (this.upgrades[upgradeID].layerCostMod ** layerNumb)
    }

    toJSON() {
        return {
            cName: 'Home',
            id: this.id,
            upgrades: {
                layerSpeed: this.upgrades.layerSpeed.level,
                addLayer: this.upgrades.addLayer.level
            }
        }
    }
}

class Charger extends Blank {
    constructor(sID, type, element, upgrades) {
        super(sID, type)
        this.classType = Charger
        this.element = element
        this.cost = 25
        this.chargeRate = 10000
        this.description = `Charges surrounding blocks once every ${this.chargeRate} seconds`
        this.chargeAmount = 1
        this.upgrades = {
            fastCharge: {
                name: 'Faster Charging',
                id: 'fastCharge',
                description: 'Charges surrounding blocks faster.',
                level: 1,
                maxLevel: 5,
                layerCostMod: 1.7,
                levelCostMod: 1.5,
                cost: 50
            },
            chargeAmt: {
                name: 'Charge More',
                id: 'chargeAmt',
                description: 'Charges surrounding blocks at 1.5x rate.',
                layerCostMod: 1.7,
                levelCostMod: 1.5,
                level: 1,
                maxLevel: 5,
                cost: 200
            }
        }

    }
    toJSON() {
        return {
            cName: 'Charger',
            id: this.id,
            upgrades: {
                fastCharge: this.upgrades.fastCharge.level,
                chargeAmt: this.upgrades.fastCharge.level
            }
        }
    }

    getSurroundingSquares(layer) {
        let squid = this.id
        let squareNum = squid.substring(1)
        let layerLength = Object.keys(player.squares[layer]).length
        let prevSquare = (squareNum - 1 + layerLength) % layerLength
        let nextSquare = (squareNum + 1 + layerLength) % layerLength
        if (player.squares[layer][prevSquare].type === 'Generator' && player.squares[layer][prevSquare].charges < player.squares[layer][prevSquare].maxCharges) {
            player.squares[layer][prevSquare].charges++
        }
                console.log(`Previous: ${prevSquare} Next: ${nextSquare}`)

    }
  }


class Generator extends Blank {
    constructor(sID, type, element, charges, maxCharges, amount, upgrades) {
        super(sID, type)
        this.classType = Generator
        this.element = element
        this.description = 'Generates $2';
        this.cost = 5;
        this.charges = charges;
        this.maxCharges = maxCharges;
        this.layerCostMod = 1.75;
        this.amount = amount;
        this.chargeAmt = 1;
        this.upgrades = {
            generated: {
                name: 'Amount Generated',
                id: 'generated',
                description: 'Adds 2 to the amount this generator produces.',
                layerCostMod: 1.6,
                levelCostMod: 1.4,
                cost: 15,
                level: upgrades[0],
                maxLevel: 100
            },
            maxCharges: {
                name: 'Max Charges',
                id: 'maxCharges',
                description: 'Increases the maximum charges for this Generator.',
                layerCostMod: 1.6,
                levelCostMod: 1.4,
                cost: 20,
                level: upgrades[1],
                maxLevel: 20
            }
        }
    }

    toJSON() {
        return {
            cName: 'Generator',
            charges: this.charges,
            id: this.id,
            maxCharges: this.maxCharges,
            amount: this.amount,
            upgrades: {
                generated: this.upgrades.generated.level,
                maxCharges: this.upgrades.maxCharges.level
            }
        }
    }

    charge(chargeButton) {
        if (this.charges < this.maxCharges) {
            chargeButton.style.transform = 'scale(1.05)'
            setTimeout(() => {
                chargeButton.style.transform = `scale(1.0)`
            },100)
            this.charges += this.chargeAmt

            chargeButton.textContent = `Charge [${this.charges} / ${this.maxCharges}]`
            this.element.innerHTML = ''
            let redraw = populateSquare(this)
            this.element.appendChild(redraw)
        }
    }

    getUpgradeCost(upgrade, layer) {
        let layerNum = layer.charCodeAt(0) - 97
        let baseCost = this.upgrades[upgrade].cost
        let levelMod = this.upgrades[upgrade].levelCostMod
        let layerMod = this.upgrades[upgrade].layerCostMod
        let currentLevel = this.upgrades[upgrade].level
        
        return baseCost * (levelMod ** (currentLevel - 1)) * (layerMod ** layerNum)
    }

    canBuyUpgrade(upgrade, layer) {
        return player.money >= this.getUpgradeCost(upgrade, layer)
    }

    doUpgrade(upgrade, layer) {
        if (this.canBuyUpgrade(upgrade, layer)) {
            player.money -= this.getUpgradeCost(upgrade, layer)
            this.upgrades[upgrade].level++
            if (upgrade === 'generated') {
                this.amount += 2
            } else if (upgrade === 'maxCharges') {
                this.charges += 2
                this.maxCharges += 2
            }
        }
    }

    buyUpgrade(upgrade) {
        if (player.money >= this.currentUpgradeCost(upgrade, layer)) {
            player.money -= this.upgrades[upgrade].cost
            this.upgrades[upgrade].level++
            this.element.innerHTML = this.upgrades[upgrade].level          
        }
    }
}

const classMap = {
    Blank,
    Generator,
    Multi,
    Charger,
    Home
}


