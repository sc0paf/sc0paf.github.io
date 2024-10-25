import { getMergeableAtPos, getSlotAtPos, mergeable } from "./Merge.js";
// draw.ts
export class Canvas {
    canvas;
    ctx;
    width;
    height;
    hoveredSlot = -1;
    canTrack = false;
    down = true;
    hoveredMergeable = null;
    draggingMergeable = null;
    mousePosition = { x: 0, y: 0 };
    dragOffsetX = 0;
    dragOffsetY = 0;
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.canvas.addEventListener('mousemove', this.track);
        this.canvas.addEventListener('mousedown', this.doMouseDown);
    }
    track = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        if (!this.draggingMergeable) {
            const m = getMergeableAtPos(this.mousePosition.x, this.mousePosition.y);
            this.hoveredMergeable = m ? m : null;
        }
    };
    getMouse() {
        return this.mousePosition;
    }
    doMouseDown = (event) => {
        if (this.hoveredMergeable) {
            this.hoveredMergeable.isDragging = true;
            this.draggingMergeable = this.hoveredMergeable;
            this.dragOffsetX = this.mousePosition.x - this.hoveredMergeable.x;
            this.dragOffsetY = this.mousePosition.y - this.hoveredMergeable.y;
            window.addEventListener('mousemove', this.onDrag);
            window.addEventListener('mouseup', this.doMouseUp);
        }
    };
    onDrag = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        if (this.draggingMergeable && this.draggingMergeable.isDragging) {
            this.draggingMergeable.x = this.mousePosition.x - this.dragOffsetX;
            this.draggingMergeable.y = this.mousePosition.y - this.dragOffsetY;
        }
    };
    doMouseUp = (event) => {
        try {
            if (this.draggingMergeable && this.draggingMergeable.isDragging) {
                this.draggingMergeable.isDragging = false;
                const slot = getSlotAtPos(this.mousePosition.x, this.mousePosition.y);
                // move to empty slot
                if (slot && slot.contents === null) {
                    this.draggingMergeable.x = slot.x;
                    this.draggingMergeable.y = slot.y;
                    if (this.draggingMergeable.parent) {
                        this.draggingMergeable.parent.contents = null;
                    }
                    slot.contents = this.draggingMergeable;
                    this.draggingMergeable.parent = slot;
                }
                else if (slot && slot.contents) {
                    if (this.draggingMergeable.level === slot.contents.level && this.draggingMergeable !== slot.contents) {
                        if (this.draggingMergeable.parent) {
                            this.draggingMergeable.parent.contents = null;
                        }
                        slot.contents = new mergeable(this.draggingMergeable.value * 3, slot.x, slot.y, this.draggingMergeable.level + 1, slot);
                    }
                    this.draggingMergeable.x = this.draggingMergeable.parent.x;
                    this.draggingMergeable.y = this.draggingMergeable.parent.y;
                }
                else {
                    this.draggingMergeable.x = this.draggingMergeable.parent.x;
                    this.draggingMergeable.y = this.draggingMergeable.parent.y;
                }
            }
        }
        finally {
            this.draggingMergeable = null;
            window.removeEventListener('mousemove', this.onDrag);
            window.removeEventListener('mouseup', this.doMouseUp);
        }
    };
}
/** Draws flat background ok */
export function drawBG(canvas, color = '#3c3c3c') {
    canvas.ctx.fillStyle = color;
    canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);
}
