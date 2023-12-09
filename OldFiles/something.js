function coordsToCell (x: number, y: number): string | undefined {
    const distFromCenter = Math.max(Math.abs(x), Math.abs(y));
  
    if (!distFromCenter) return undefined;
  
    let side: number;
    let offset: number;
  
    if (x < distFromCenter && y === -distFromCenter) {
      side = 0;
      offset = x + distFromCenter;
    } else if (x === distFromCenter && y < distFromCenter) {
      side = 1;
      offset = y + distFromCenter;
    } else if (x > -distFromCenter && y === distFromCenter) {
      side = 2;
      offset = distFromCenter - x;
    } else /* if (x === -distFromCenter && y > -distFromCenter) */ {
      side = 3;
      offset = distFromCenter - y;
    }
  
    return distFromCenter ? (String.fromCharCode(96 + distFromCenter) + `${2 * side + offset + 1}`) : undefined;
  }
  function cellToCoords (cell: string): [number, number] {
    const distFromCenter = cell.charCodeAt(0) - 96;
    const index = Number(cell.substring(1)) - 1;
    const side = Math.floor(index / distFromCenter / 2);
    const subindex = index % (2 * distFromCenter);
  
    if (side === 0) {
      return [-distFromCenter + subindex, -distFromCenter];
    } else if (side === 1) {
      return [distFromCenter, -distFromCenter + subindex];
    } else if (side === 2) {
      return [distFromCenter - subindex, distFromCenter];
    } else {
      return [-distFromCenter, distFromCenter - subindex];
    }
  }
  
  describe('scopaf', () => {
    it.each([
      [0, 0, undefined],
      [-1, -1, 'a1'],
      [0, -1, 'a2'],
      [1, -1, 'a3'],
      [1, 0, 'a4'],
      [1, 1, 'a5'],
      [0, 1, 'a6'],
      [-1, 1, 'a7'],
      [-1, 0, 'a8'],
      [-2, -2, 'b1'],
      [-2, -3, 'c2'],
    ])('should calculate cell from coordinates', (x, y, cell) => {
      expect(coordsToCell(x, y)).toBe(cell);
    });
  
    it.each([
      ['a1', [-1, -1]],
      ['a2', [0, -1]],
      ['a3', [1, -1]],
      ['a4', [1, 0]],
      ['a5', [1, 1]],
      ['a6', [0, 1]],
      ['a7', [-1, 1]],
      ['a8', [-1, 0]],
      ['b1', [-2, -2]],
      ['c2', [-2, -3]],
    ])('should calculate coordinates from cell', (cell, coords) => {
      expect(cellToCoords(cell)).toEqual(coords);
    });
  });




//                1   2  3   4   5   6  7  
//                24  1  2   3   4   5  8
//                23  16 1   2   3   6  9
//                22  15 8   5   4   7  10
//                21  14 7   6   5   8  11
//                20  13 12  11  10  9  12
//                19  18 17  16  15  14 13

let thisSquare = 8
let nextSquare = 16

let thisSquaresSides = 8/4  (2)
let nextSquareSides = 16/4  (4)

function neighborsOf(num) {
    if (num === 1) { return [nextSquare, 2] }
    else {
        if (num % thisSquareSides === 0) {
            //corner 
            if ((num / thisSquare * thisSquareSides) === .75) { return [nextSquareSides + 1, nextSquareSides - 1] }
        } else {
            // not a corner
            if ((num / thisSquare * thisSquareSides) < .26) {
                return [1 + num]
            } else if (num / thisSquare * thisSquareSides < .51) {
                return [3 + num]
            } else if ((num / thisSquare * thisSquareSides < .76)) {
                return [5 + num]
            } else {
                return [7 + num]
            }
        }
    }
}
