export const slots = {
    width: 136,
    height: 125,
    spacer: 20
};
const mergeLevelColors = ['green', 'blue', 'red', 'purple', 'orange', 'pink', 'yellow', 'cyan', 'brown', 'white'];
export class mergeable {
    level;
    value;
    x = 0;
    y = 0;
    isDragging = false;
    parent = null;
    constructor(value, x, y, level, parent) {
        this.value = value;
        this.level = level;
        this.x = x;
        this.y = y;
        this.parent = parent;
    }
}
const mergeSlots = [];
export const initMergeBoard = (canvas) => {
    const { width: w, height: h } = canvas;
    const { width: slotWidth, height: slotHeight, spacer } = slots;
    const columns = Math.floor((w - spacer) / (slotWidth + spacer));
    const rows = Math.floor((h - spacer) / (slotHeight + spacer));
    const startX = spacer;
    const startY = spacer;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = startX + col * (slotWidth + spacer);
            const y = startY + row * (slotHeight + spacer);
            mergeSlots.push({ x, y, contents: null, number: row * columns + col });
        }
    }
};
export function getSlotAtPos(x, y) {
    for (let i = 0; i < mergeSlots.length; i++) {
        const slot = mergeSlots[i];
        if (x > slot.x && x < slot.x + slots.width && y > slot.y && y < slot.y + slots.height) {
            return slot;
        }
    }
    return null;
}
export function getMergeableAtPos(x, y) {
    for (let i = 0; i < mergeSlots.length; i++) {
        const slot = mergeSlots[i];
        if (slot.contents) {
            const m = slot.contents;
            if (x > m.x && x < m.x + slots.width && y > m.y && y < m.y + slots.height) {
                return m;
            }
        }
    }
    return null;
}
export function addMergeable() {
    const emptySlots = mergeSlots.filter(slot => slot.contents === null);
    if (emptySlots.length === 0)
        return false;
    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    randomSlot.contents = new mergeable(1, randomSlot.x, randomSlot.y, 1, randomSlot);
    return true;
}
export function drawMergeBoard(canvas) {
    for (let i = 0; i < mergeSlots.length; i++) {
        const slot = mergeSlots[i];
        canvas.ctx.fillStyle = '#212121';
        canvas.ctx.beginPath();
        canvas.ctx.roundRect(slot.x, slot.y, slots.width, slots.height, [12]);
        canvas.ctx.fill();
    }
    let draggingMergeable = null;
    for (let i = 0; i < mergeSlots.length; i++) {
        const slot = mergeSlots[i];
        if (slot.contents) {
            const m = slot.contents;
            if (m.isDragging) {
                draggingMergeable = m;
            }
            else {
                drawMergeable(canvas, m);
                if (canvas.hoveredMergeable === m) {
                    canvas.ctx.strokeStyle = 'white';
                    canvas.ctx.lineWidth = 2;
                    canvas.ctx.stroke();
                }
            }
        }
    }
    if (draggingMergeable) {
        const m = draggingMergeable;
        drawMergeable(canvas, m);
        canvas.ctx.strokeStyle = 'white';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.stroke();
    }
}
function drawMergeable(canvas, m) {
    canvas.ctx.fillStyle = mergeLevelColors[m.level - 1];
    canvas.ctx.beginPath();
    canvas.ctx.roundRect(m.x, m.y, slots.width, slots.height, [12]);
    canvas.ctx.fill();
    canvas.ctx.fillStyle = 'black';
    canvas.ctx.font = '16px monospace';
    let tw = canvas.ctx.measureText(`Level ${m.level}`).width;
    canvas.ctx.fillText(`Level ${m.level}`, m.x + (slots.width - tw) / 2, m.y + 20);
    let vw = canvas.ctx.measureText(`${m.value}`).width;
    canvas.ctx.fillText(`${m.value}`, m.x + (slots.width - vw) / 2, m.y + (slots.height / 2) + 5);
}
