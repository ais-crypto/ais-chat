import express from 'express';
import socketio from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

app.set('port', (process.env.PORT || 3001));

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.use('/api', apiRouter);

app.listen(app.get('port'));
server.listen(process.env.PORT || 3002);

console.log(`listening on ${app.get('port')}`);
