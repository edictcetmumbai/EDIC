const express = require('express');
const router = express.Router();
const passport = require('passport');
const {login , Signup} = require('../Controllers/manual.auth.controller.js')
const {loginFailed , loginSuccess , logout} = require('../Controllers/google.auth.controller.js');




router.get('/login/failed' , loginFailed);  
router.get('/login/success' , loginSuccess);
router.get('/google/callback' , passport.authenticate('google', { successRedirect: process.env.CLIENT_URL, failureRedirect: '/login/failed' }));
router.get('/google' , passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/logout' , logout);
router.post('/signup' , Signup);
router.post('/login' , passport.authenticate('local', {failureRedirect: '/login/failed' }) , login);






module.exports = router;