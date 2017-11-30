import { Router } from 'express';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

const router = Router();
const callbackOrigin =
  process.env.NODE_ENV === 'production'
    ? 'https://ais-chat.herokuapp.com'
    : 'http://localhost:3001';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackOrigin + '/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      return done();
    }
  )
);

// ------------------- ROUTES -------------------

router.get('/google', passport.authenticate('google', { scope: 'profile' }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);

// Middleware for authentication checks
router.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
};

export default router;
