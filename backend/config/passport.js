const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = function (passport) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // If Google OAuth credentials are not set, skip strategy registration
  if (!clientID || !clientSecret) {
    console.warn(
      "Google OAuth credentials (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) are missing. Skipping GoogleStrategy registration."
    );
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          const newUser = {
            googleId: profile.id,
            username: profile.displayName,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          };

          try {
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              done(null, user);
            } else {
              user = await User.findOne({ email: profile.emails[0].value });
              if (user) {
                // Link the account if user exists with the same email
                user.googleId = profile.id;
                user.avatar = user.avatar || profile.photos[0].value;
                await user.save();
                done(null, user);
              } else {
                // Create a new user
                user = await User.create(newUser);
                done(null, user);
              }
            }
          } catch (err) {
            console.error(err);
            done(err, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
