const googleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../DB/Schema/user.schema.js");

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, callback) => {
      let user = await User.findOne({
        email: profile.emails[0].value,
      });

      if (!user) {
        user = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
        });
        user.save();
      }

      callback(null, user._id);
    },
  ),
);
passport.serializeUser((userID, callback) => {
  callback(null, userID);
});
passport.deserializeUser(async (userID, callback) => {
  try {
    const userData = await User.findById(userID);
    callback(null, userData);
  } catch (error) {
    callback(error, null);
  }
});
