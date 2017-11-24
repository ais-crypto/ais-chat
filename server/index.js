import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import router from './router';

const app = express();
const server = http.createServer(app);
const io = new socketio(server);

app.set('port', process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build'));
}

app.use('/api', router);

app.listen(app.get('port'));
