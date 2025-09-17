
const User = require("../models/userModel");
const Artwork = require("../models/artworksModel");

const getDashboardStats = async (req, res) => {
  try {
    // Users joined per month
    const usersPerMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Artworks posted per month
    const artworksPerMonth = await Artwork.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalArtworks = await Artwork.countDocuments();

    res.json({
      usersPerMonth,
      artworksPerMonth,
      totalUsers,
      totalArtworks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboardStats };
