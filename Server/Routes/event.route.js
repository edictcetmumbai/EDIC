const express = require('express');
const router = express.Router();
const { getAllEvents, purchaseEvent, getUserPurchasedEvents  , verifyPayment } = require('../Controllers/event.controller.js');
const { isAuthenticated } = require('../Middlewares/auth.middleware.js');

router.get('/all', getAllEvents);
router.post('/purchase/:eventId', isAuthenticated, purchaseEvent);
router.post('/verify-payment', isAuthenticated, verifyPayment);
router.get('/my-purchases', isAuthenticated, getUserPurchasedEvents);

module.exports = router;