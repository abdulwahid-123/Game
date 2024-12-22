const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Server setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  players[socket.id] = { snake: [{ x: 100, y: 100 }], direction: 'RIGHT' };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, data: players[socket.id] });

  socket.on('move', (data) => {
    players[socket.id] = data;
    socket.broadcast.emit('playerMoved', { id: socket.id, data });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    socket.broadcast.emit('playerDisconnected', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});