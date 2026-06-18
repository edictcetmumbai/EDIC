const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../DB/Schema/user.schema.js');

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return done(null, false, { message: 'Wrong Credentials' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error , null);
    }
});