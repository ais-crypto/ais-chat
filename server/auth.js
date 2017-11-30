import { Router } from 'express';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

const router = Router();
const in_prod = process.env.NODE_ENV === 'production';
const callbackOrigin = in_prod
  ? 'https://ais-chat.herokuapp.com'
  : 'http://localhost:3001';

const redirectOrigin = in_prod
  ? 'https://ais-chat.herokuapp.com'
  : 'http://localhost:3000';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackOrigin + '/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, true);
    }
  )
);

// ------------------- ROUTES -------------------

router.get('/google', passport.authenticate('google', { scope: 'profile' }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: redirectOrigin + '/login'
  }),
  function(req, res) {
    res.redirect(redirectOrigin);
  }
);

// Middleware for authentication checks
router.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect(redirectOrigin + '/login');
};

export default router;
