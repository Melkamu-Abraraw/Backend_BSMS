const passport = require('passport');
const User = require('./models/Users');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: YOUR_GOOGLE_CLIENT_ID,
    clientSecret: YOUR_GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback', 
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function(err, user) {
      if (err) { return done(err); }
      return done(null, user);
    });
  }
));
