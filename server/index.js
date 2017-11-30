import express from 'express';
import path from 'path';
import http from 'http';
import socketio from 'socket.io';
import router from './router';

const app = express();
const server = http.createServer(app);
const io = new socketio(server);

app.set('port', process.env.PORT || 3001);

// API Routing is handled externally
app.use('/api', router);

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client/build')));
}

server.listen(app.get('port'));

console.log(`Listening on: ${app.get('port')}`);

io.on('connection', socket => {
  console.log(`a user connected`);
  socket.on('disconnect', () => {
    console.log(`a user has disconnected`);
  });
});
