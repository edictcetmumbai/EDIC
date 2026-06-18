const Event = require("../Services/DB/Schema/event.schema.js");
const Purchase = require("../Services/DB/Schema/ticket.purchase.schema.js");

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();

    if (req.isAuthenticated()) {
      const eventsWithPurchaseStatus = await Promise.all(
        events.map(async (event) => {
          const purchase = await Purchase.findOne({
            userId: req.user._id,
            eventId: event._id,
          });

          return {
            ...event.toObject(),
            isPurchased: !!purchase,
          };
        }),
      );

      return res.status(200).json({
        error: false,
        events: eventsWithPurchaseStatus,
      });
    }

    const eventsWithoutPurchase = events.map((event) => ({
      ...event.toObject(),
      isPurchased: false,
    }));

    res.status(200).json({
      error: false,
      events: eventsWithoutPurchase,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      error: true,
      message: "Server error fetching events",
    });
  }
};

exports.purchaseEvent = async (req, res) => {
  try {
    const razorpayInstance = require("../Services/razorpay.service.js");
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        error: true,
        message: "Event not found",
      });
    }

    const existingPurchase = await Purchase.findOne({
      userId: userId,
      eventId: eventId,
    });

    if (existingPurchase) {
      return res.status(400).json({
        error: true,
        message: "You already purchased this event",
      });
    }

    const options = {
      amount: event.price * 100, // Razorpay expects amount in paise (multiply by 100)
      currency: "INR",
      receipt: `${eventId.toString().slice(-8)}`,
      notes: {
        eventId: eventId.toString(),
        userId: userId.toString(),
        eventTitle: event.title,
      },
    };
    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
      error: false,
      message: "Ticket purchased successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error("Error purchasing ticket:", error);
    res.status(500).json({
      error: true,
      message: "Server error purchasing ticket",
    });
  }
};

exports.getUserPurchasedEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const purchases = await Purchase.find({ userId }).populate("eventId");

    const events = purchases.map((purchase) => ({
      ...purchase.eventId.toObject(),
      isPurchased: true,
      whatsappLink: purchase.eventId.whatsappLink,
    }));

    res.status(200).json({
      error: false,
      events: events,
    });
  } catch (error) {
    console.error("Error fetching purchased events:", error);
    res.status(500).json({
      error: true,
      message: "Server error fetching purchased events",
    });
  }
};
exports.verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;
        const { eventId } = req.params;
        const userId = req.user._id;
        const razorpayInstance = require('../Services/razorpay.service.js');
        const crypto = require('crypto');

        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({
                error: true,
                message: 'Payment verification failed'
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                error: true,
                message: 'Event not found'
            });
        }

        const purchase = new Purchase({
            userId: userId,
            eventId: eventId
        });

        await purchase.save();

        res.status(201).json({
            error: false,
            message: 'Payment verified and purchase completed please join the whatsapp group for event updates',
            whatsappLink: event.whatsappLink
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            error: true,
            message: 'Server error verifying payment'
        });
    }
};