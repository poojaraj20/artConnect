const Artwork = require("../models/artworksModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

// Controller to get all artworks
exports.getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate("uploadedBy", "username profile") // get user info
      .sort({ createdAt: -1 }); // latest first
    res.json(artworks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    const userId = req.user.userId;
    const isLiked = artwork.likes.includes(userId);

    if (isLiked) {
      // Unlike
      artwork.likes = artwork.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      artwork.likes.push(userId);

      // Create notification if not liking own artwork
      if (artwork.uploadedBy.toString() !== userId) {
        const liker = await User.findById(userId);
        await Notification.create({
          toUser: artwork.uploadedBy,
          fromUser: userId,
          type: "like",
          artwork: artwork._id,
          message: `${liker.username} liked your artwork`,
        });
      }
    }

    await artwork.save();

    res.json({
      likes: artwork.likes.length,
      likedByUser: !isLiked, // toggle like status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
