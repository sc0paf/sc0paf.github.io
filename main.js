import { Canvas, drawBG } from './draw.js';
import { initMergeBoard, drawMergeBoard, addMergeable, saveMergeBoard, mergeValue } from './Merge.js';
import { player } from './player.js';
const canvasElement = document.getElementById('main-canvas');
let canvas;
const progress = document.getElementById('progress-bar');
let fpsDisplay = document.getElementById('fps-display');
// let savebutton = document.getElementById('save-button') as HTMLButtonElement;
let resetbutton = document.getElementById('reset-button');
let moneyDisplay = document.getElementById('money');
let spawner = 0;
document.addEventListener('DOMContentLoaded', () => {
    console.log('dom fired');
    canvas = new Canvas(canvasElement);
    initMergeBoard(canvas);
    resetbutton.addEventListener('click', () => {
        localStorage.removeItem('mergeSlots');
        location.reload();
    });
    setInterval(() => {
        saveMergeBoard();
    }, 5000);
    requestAnimationFrame(gameloop);
});
let lastTime = 0;
let fpsInterval = 0;
let fpsDisplayInterval = 1;
let fpsAccumulatedTime = 0;
let fpsFrameCount = 0;
let fps = 0;
const gameloop = (ts) => {
    const delta = (ts - lastTime) / 1000;
    lastTime = ts;
    fpsAccumulatedTime += delta;
    fpsFrameCount++;
    if (fpsAccumulatedTime > fpsDisplayInterval) {
        fps = fpsFrameCount / fpsAccumulatedTime;
        fpsAccumulatedTime = 0;
        fpsFrameCount = 0;
        fpsDisplay.innerText = `FPS: ${fps.toFixed(2)}`;
    }
    player.playtime += delta;
    player.money += mergeValue * delta;
    spawner += delta;
    drawBG(canvas);
    moneyDisplay.innerText = `Money: ${player.money.toFixed(2)}`;
    drawMergeBoard(canvas);
    progress.style.width = Math.min(Math.max(spawner / player.spawnRate, 0), 1) * 100 + '%';
    if (spawner >= player.spawnRate) {
        if (addMergeable()) {
            spawner = 0;
        }
    }
    requestAnimationFrame(gameloop);
};
