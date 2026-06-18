require('dotenv').config();
const app = require('./app');
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
const connectDB = require('./Services/DB/connect.DB');
const passportSetup = require('./Services/GoogleAuth/passport.js');
const localStrategy = require('./Services/GoogleAuth/local.strategy.js');
const authRoutes = require('./Routes/auth.route.js');
const eventRoutes = require('./Routes/event.route.js');
connectDB();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use( (req , res , next) => {
    if(req.session && !req.session.regenerate) {
        req.session.regenerate = (callback) => {
            callback();
        }  }
    if(req.session && !req.session.save) {
        req.session.save = (callback) => {
            callback();
        }       
    }
    next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth' , authRoutes);
app.use('/events', eventRoutes);
app.listen(process.env.PORT , () => {
    console.log(`Server running on port http://localhost:${process.env.PORT}/` )
})