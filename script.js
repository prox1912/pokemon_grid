const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const newGameButton = document.getElementById('newGameButton');
const messageElement = document.getElementById('message');
let maze = [];
let path = [];
let stopVisualization = false;

const cellSize = 25;
const mazeSize = 20;
const directions = [
    { x: 0, y: -2 }, // up
    { x: 2, y: 0 },  // right
    { x: 0, y: 2 },  // down
    { x: -2, y: 0 }  // left
];

const createMaze = () => {
    maze = Array.from({ length: mazeSize }, () => Array(mazeSize).fill(0));
    generateMaze(0, 0); // Generate maze starting from (0, 0)
    ensurePathToEnd(); // Ensure there's a clear path to the end
    drawMaze();
};

const generateMaze = (x, y) => {
    maze[y][x] = 1;
    shuffle(directions).forEach(direction => {
        const newX = x + direction.x;
        const newY = y + direction.y;
        const betweenX = x + direction.x / 2;
        const betweenY = y + direction.y / 2;
        if (
            newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize &&
            maze[newY][newX] === 0
        ) {
            maze[betweenY][betweenX] = 1;
            generateMaze(newX, newY);
        }
    });
};

const shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const drawMaze = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (maze[y][x] === 0) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
    // Draw start and end points
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, cellSize, cellSize); // Start point
    ctx.fillStyle = 'red';
    ctx.fillRect((mazeSize - 2) * cellSize, (mazeSize - 2) * cellSize, cellSize, cellSize); // End point
};

const drawPath = () => {
    ctx.fillStyle = 'yellow';
    path.forEach(([x, y]) => {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });
};

const ensurePathToEnd = () => {
    const start = [0, 0];
    const end = [mazeSize - 2, mazeSize - 2]; // Placing the end point at (mazeSize - 2, mazeSize - 2)
    const stack = [start];
    const visited = new Set();
    visited.add(start.toString());

    while (stack.length) {
        const [x, y] = stack.pop();
        if (x === end[0] && y === end[1]) break;
        shuffle(directions).forEach(direction => {
            const newX = x + direction.x;
            const newY = y + direction.y;
            const betweenX = x + direction.x / 2;
            const betweenY = y + direction.y / 2;
            if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize &&
                !visited.has(`${newX},${newY}`) && maze[newY][newX] === 0) {
                visited.add(`${newX},${newY}`);
                stack.push([newX, newY]);
                maze[betweenY][betweenX] = 1;
                maze[newY][newX] = 1;
            }
        });
    }
    maze[end[1]][end[0]] = 1; // Ensure the end point is open
};

const visualizeBacktracking = async (x, y) => {
    if (stopVisualization) return false;
    if (x === mazeSize - 2 && y === mazeSize - 2) { // Check for the end point
        path.push([x, y]);
        drawMaze();
        drawPath();
        return true;
    }
    maze[y][x] = 2; // Mark as visited
    path.push([x, y]);
    drawMaze();
    drawPath();
    await new Promise(resolve => setTimeout(resolve, 100));
    for (const direction of directions) {
        const newX = x + direction.x / 2;
        const newY = y + direction.y / 2;
        if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY][newX] === 1) {
            if (await visualizeBacktracking(newX, newY)) return true;
        }
    }
    path.pop();
    drawMaze();
    drawPath();
    await new Promise(resolve => setTimeout(resolve, 100));
    maze[y][x] = 1; // Unmark if backtracking
    return false;
};

startButton.addEventListener('click', async () => {
    stopVisualization = false;
    path = [];
    const foundPath = await visualizeBacktracking(0, 0);
    if (!stopVisualization) {
        messageElement.textContent = foundPath ? 'Hurray! Destination reached!!🥳' : 'No path found.';
    }
});

stopButton.addEventListener('click', () => {
    stopVisualization = true;
    messageElement.textContent = 'Visualization stopped.';
});

newGameButton.addEventListener('click', () => {
    stopVisualization = true;
    createMaze();
    messageElement.textContent = '';
});

createMaze();
