const users = require('../models/userModel')
const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');

// register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(401).json("User already exists");
    }

    const newUser = new users({ username, email, password });
    await newUser.save();

    // generate token
    const token = jwt.sign({ userId: newUser._id }, 'superkey2025', { expiresIn: "1d" });

    res.status(200).json({
      message: "Register successful",
      user: newUser,
      token
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await users.findOne({ email });
    if (!existingUser) {
      return res.status(401).json("User not found");
    }

    if (existingUser.password !== password) {
      return res.status(402).json("Password mismatch");
    }

    const token = jwt.sign({ userId: existingUser._id }, 'superkey2025', { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      user: existingUser,
      token
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// google login
exports.googleAuth = async (req, res) => {
  const { username, email, password, photo } = req.body;

  try {
    let existingUser = await users.findOne({ email });

    if (!existingUser) {

      existingUser = new users({ username, email, password, profile: photo });
      await existingUser.save();
    }

    const token = jwt.sign({ userId: existingUser._id }, 'superkey2025', { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      user: existingUser,
      token
    });
  } catch (err) {
    res.status(500).json(err);
  }
};



exports.getProfileById = async (req, res) => {
  try {
    const user = await users.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.uploadProfile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Build the file URL
    const profilePath = `/uploads/${req.file.filename}`;

    // Update user in DB
    const user = await users.findByIdAndUpdate(
      req.user.userId,
      { profile: profilePath },
      { new: true }
    ).select('-password');

    res.json(user);
    
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT middleware
    const { username, bio } = req.body;

    const updatedUser = await users.findByIdAndUpdate(
      userId,
      { username, bio },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


//change password

// Change password
exports.changePassword = async (req, res) => {
  try {
    // req.user.userId comes from your auth middleware (adjust if your middleware sets a different key)
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await users.findById(userId).select('+password'); // include password if you excluded it in schema selection
    if (!user) return res.status(404).json({ message: 'User not found' });

   

    
    user.password = newPassword
    await user.save();

    // Optionally: you can force client to re-login by returning a flag
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};







