const AdminNotification = require('../models/adminNotificationModel');

// Create/save a new admin notification (user -> admin)
exports.createNotification = async (req, res) => {
  try {
    const { type, name, email, message } = req.body;

    if (!type || !['app_issue', 'user_complaint', 'general_query'].includes(type)) {
      return res.status(400).json({ message: 'Invalid or missing type' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const doc = new AdminNotification({
      type,
      name: name || undefined,
      email: email || undefined,
      message,
      fromUser: req.user?.userId || undefined,
      meta: {
        ip: req.ip,
        userAgent: req.get('User-Agent') || ''
      }
    });

    await doc.save();
    res.status(201).json({ success: true, notification: doc });
  } catch (err) {
    console.error('createNotification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin view of all notifications (ADMIN only ideally)

exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .populate('fromUser', 'username profile') // <-- populate username & profile
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get notifications submitted by the logged-in user
// exports.getMyNotifications = async (req, res) => {
//   try {
//     const notifications = await AdminNotification.find({ fromUser: req.user.userId })
//       .sort({ createdAt: -1 });
//     res.json(notifications);
//   } catch (err) {
//     console.error('getMyNotifications error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// Update status (read/resolved) - typically admin only
exports.markAsRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.status = "read";
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



