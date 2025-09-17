const Notification = require("../models/notificationModel");


exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ toUser: req.user.userId })
      .populate("fromUser", "username profile")
      .populate("artwork", "caption images")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Only the recipient can mark as read
    if (notification.toUser.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

