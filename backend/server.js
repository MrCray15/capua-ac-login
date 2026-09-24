// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5500"
}));
app.use(express.json());


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  allegiance: { type: String, required: true, enum: ['assassin', 'templar'] }
});

const User = mongoose.model("User", userSchema);




app.get("/", (req, res) => {
  res.json({ message: "Assassin's Creed Backend API is running." });
});


app.post("/api/register", async (req, res) => {
  try {
    const { username, password, allegiance } = req.body;

    if (!username || !password || !allegiance) {
      return res.status(400).json({ message: "All fields (username, password, allegiance) are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Cipher (password) must be at least 6 characters long." });
    }
    if (!['assassin', 'templar'].includes(allegiance)) {
        return res.status(400).json({ message: "Invalid allegiance chosen. Please select 'Assassin' or 'Templar'." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "This Creed Name is already taken. Please choose another." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      allegiance
    });

    res.status(201).json({ message: "Oath sworn successfully. You may now enter the Brotherhood." });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "An error occurred during registration. Please try again." });
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid Creed Name or Cipher." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Creed Name or Cipher." });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, allegiance: user.allegiance },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Welcome to the Sanctuary.",
      token,
      user: {
        username: user.username,
        allegiance: user.allegiance
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "An error occurred during login. Please try again." });
  }
});


app.get("/api/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      message: "Your credentials are valid.",
      user: {
        userId: decoded.userId,
        username: decoded.username,
        allegiance: decoded.allegiance
      }
    });
  } catch (error) {
    console.error("Profile Access Error:", error);
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Your session has expired. Please log in again." });
    }
    res.status(401).json({ message: "Unauthorized: Invalid token." });
  }
});


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Assassin's Creed Backend Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });