const Notification = require("../models/notificationModel");
const Artwork = require('../models/artworksModel');
const User = require("../models/userModel");
const Order = require("../models/orderModel")
const Stripe = require("stripe");

const stripe = new Stripe("sk_test_51S4btTJRatU77xlLCa2QbSy2seaKj6Ripo2R0ceDkwR1sodbVXkyENCQ7pCZY7GtULHIoB07ANGIT0w25zz1ZQwT00cIt5iDrf");


exports.uploadArtwork = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const { caption, description, quantity, price } = req.body;


    const images = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));


    const artwork = await Artwork.create({
      caption,
      description,
      quantity: Number(quantity),
      price: Number(price),
      images,
      uploadedBy: req.user.userId
    });


    res.status(201).json({ success: true, data: artwork });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getArtworkById = async (req, res) => {
  try {
    const art = await Artwork.findById(req.params.id)
      .populate("uploadedBy", "username profile")
      .populate({ path: "comments.user", select: "username profile" });

    if (!art) return res.status(404).json({ message: "Artwork not found" });
    return res.json(art);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.addCommentToArtwork = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment text required" });

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    const comment = { user: req.user.userId, text: text.trim() };
    artwork.comments.unshift(comment);
    await artwork.save();

    await artwork.populate({ path: "comments.user", select: "username profile" });

    const newComment = artwork.comments[0];

    if (artwork.uploadedBy.toString() !== req.user.userId) {
      const commentedUser = await User.findById(req.user.userId);
      await Notification.create({
        toUser: artwork.uploadedBy,
        fromUser: req.user.userId,
        type: "comment",
        artwork: artwork._id,
        message: `${commentedUser.username} commented on your artwork`,
      });
    }

    return res.status(201).json({ comment: newComment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMyUploads = async (req, res) => {
  try {
    const userId = req.user.userId;

    const myArtworks = await Artwork
      .find({ uploadedBy: userId })
      .populate("uploadedBy", "username profile")
      .sort({ createdAt: -1 });

    res.json(myArtworks);
  } catch (err) {
    console.error("Error fetching user uploads:", err);
    res.status(500).json({ message: "Server error fetching uploads" });
  }
};



exports.updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { price, quantity } = req.body;

    // find artwork
    const artwork = await Artwork.findById(id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    // ownership check
    if (artwork.uploadedBy.toString() !== userId)
      return res.status(403).json({ message: "You are not allowed to edit this artwork" });

    // validate and update price
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      artwork.price = parsedPrice;
    }

    // validate and update quantity
    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity, 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      artwork.quantity = parsedQuantity;
    }

    await artwork.save();

    // return populated object (optional)
    const updated = await Artwork.findById(artwork._id).populate("uploadedBy", "username profile");
    res.json(updated);
  } catch (err) {
    console.error("updateArtwork error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: delete artwork
exports.deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const artwork = await Artwork.findById(id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    if (artwork.uploadedBy.toString() !== userId)
      return res.status(403).json({ message: "You are not allowed to delete this" });

    await Artwork.findByIdAndDelete(id);
    res.json({ message: "Artwork deleted" });
  } catch (err) {
    console.error("deleteArtwork error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.makePayment = async (req, res) => {
  try {
    const { artworkId, quantity } = req.body;
    const userId = req.user.userId;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: artwork.caption,
            },
            unit_amount: artwork.price,
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment-error`,
      metadata: {
        artworkId: artwork._id.toString(),
        userId: userId,
        quantity: quantity.toString(),
      },
    });

    const order = await Order.create({
      user: userId,
      artwork: artwork._id,
      quantity,
      amount: artwork.price * quantity,
      paymentId: session.id,
      status: "pending",
    });
    await Notification.create({
      toUser: artwork.uploadedBy,
      fromUser: userId,
      type: "order",
      artwork: artwork._id,
      message: `You have a order for the artwork: "${artwork.caption}" `,
    });

    res.status(200).json({ id: session.id, orderId: order._id });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Payment initiation failed", error });
  }
};
