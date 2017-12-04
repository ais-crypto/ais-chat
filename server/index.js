import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';
import passport from 'passport';
import socketio from 'socket.io';
import SQLiteStore from 'connect-sqlite3';
import passportSocketIo from 'passport.socketio';
import cookieParser from 'cookie-parser';
import router from './router';
import auth from './auth';

const app = express();
const server = http.createServer(app);
const io = new socketio(server);
const store = SQLiteStore(session);
const sess = {
  store: new store(),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {},
};

const serializer = (user, done) => {
  done(null, user);
};

// Use secure cookies only on production
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

// Initial app setup
app.set('port', process.env.PORT || 3001);
app.use(cookieParser(sess.secret));
app.use(session(sess));
app.use(bodyParser.urlencoded({ extended: false }));

// Passport setup
passport.serializeUser(serializer);
passport.deserializeUser(serializer);
app.use(passport.initialize());
app.use(passport.session());

// Expose auth routes first
app.use('/auth', auth);
app.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'login.html'));
});

// Protect the rest of the app
app.use(auth.isLoggedIn);

// API Routing is handled externally
app.use('/api', router);

// All remaining requests return the React app, so it can handle routing
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

// socket.io security layer
io.use(passportSocketIo.authorize({
  passport,
  key: 'connect.sid',
  secret: sess.secret,
  store: sess.store,
  cookieParser,
  success: (data, accept) => {
    console.log('successful authentication');
    accept();
  },
  fail: (data, message, error, accept) => {
    console.log('failed authentication:', message);
    accept(new Error(`authentication error: ${message}`));
  },
}));

io.on('connection', (socket) => {
  console.log(`${socket.request.user.displayName} has connected`);

  socket.on('request_identity', (signature_key) => {
    const identity = Object.assign(socket.request.user, { signature_key });

    // TODO: GENERATE SERVER SIGNATURES & sign
    const server_signature = 'SERVER SIGNATURE FOR IDENTITY OBJECT HERE';

    const signed_identity = Object.assign(identity, { server_signature });

    console.log(`Sending ${socket.request.user.displayName}'s signed identity.`);

    socket.emit('identity', signed_identity);
  });

  socket.on('hello', (message) => {
    socket.join(message.room);

    console.log(`${message.identity.displayName} has joined room  ${message.room}`);

    socket.broadcast
      .to(message.room)
      .emit('hello', { socket: socket.id, identity: message.identity });
  });

  socket.on('welcome', (message) => {
    const room_users = io.sockets.adapter.rooms[message.room];
    socket.broadcast.to(message.to_socket).emit('welcome', {
      room_size: room_users.length,
      identity: message.identity,
    });
  });

  socket.on('message', (message) => {
    console.log(`Message received from ${socket.request.user.displayName}:`);
    console.log(message);
    io.to(message.room).emit('message', message.body);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.request.user.displayName} has disconnected`);
  });
});

server.listen(app.get('port'));

console.log(`Listening on: ${app.get('port')}`);
