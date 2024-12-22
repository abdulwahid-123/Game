const socket = io();

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;

let snake = [{ x: 100, y: 100 }];
let direction = 'RIGHT';
let players = {};

// Draw player snakes
function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.keys(players).forEach((id) => {
    players[id].snake.forEach((segment, index) => {
      ctx.fillStyle = id === socket.id ? 'green' : 'blue';
      ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
    });
  });
}

// Move the snake
function moveSnake() {
  const head = { ...snake[0] };

  if (direction === 'UP') head.y -= boxSize;
  if (direction === 'DOWN') head.y += boxSize;
  if (direction === 'LEFT') head.x -= boxSize;
  if (direction === 'RIGHT') head.x += boxSize;

  snake.unshift(head);
  snake.pop();

  socket.emit('move', { snake, direction });
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// Socket events
socket.on('currentPlayers', (serverPlayers) => {
  players = serverPlayers;
  players[socket.id] = { snake, direction };
});

socket.on('newPlayer', (newPlayer) => {
  players[newPlayer.id] = newPlayer.data;
});

socket.on('playerMoved', (playerData) => {
  players[playerData.id] = playerData.data;
});

socket.on('playerDisconnected', (id) => {
  delete players[id];
});

// Game loop
setInterval(() => {
  moveSnake();
  drawPlayers();
}, 150);