import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';
import passport from 'passport';
import socketio from 'socket.io';
import router from './router';
import auth from './auth';

const app = express();
const server = http.createServer(app);
const io = new socketio(server);
const sess = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
};

const serializer = function(user, done) {
  done(null, user);
};

// Use secure cookies only on production
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

// Initial app setup
app.set('port', process.env.PORT || 3001);
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

server.listen(app.get('port'));

console.log(`Listening on: ${app.get('port')}`);

io.on('connection', socket => {
  console.log(`a user connected`);
  socket.on('disconnect', () => {
    console.log(`a user has disconnected`);
  });
});
