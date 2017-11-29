import express from 'express';
import path from 'path';
import http from 'http';
import socketio from 'socket.io';
import router from './router';

const app = express();
const server = http.createServer(app);
const io = new socketio(server);

app.set('port', process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client/build')));
}

// API Routing is handled externally
app.use('/api', router);

// All remaining requests return the React app, so it can handle routing.
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(app.get('port'));

server.listen(process.env.PORT || 3002);

console.log(`Listening on: ${app.get('port')}`);

io.on('connection', (socket) => {
  console.log(`a user connected`);
  socket.on('disconnect', () => {
    console.log(`a user has disconnected`)
  });
});
