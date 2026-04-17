import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/user.js";

// ✅ ENV MUST BE FIRST
dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// ---------------- CONNECT MONGODB ----------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ DB Error:", err.message);
    process.exit(1);
  }
};

connectDB(); // 🔥 IMPORTANT

// ---------------- PATH SETUP ----------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ msg: "missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ msg: "user exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hash,
      todos: {}
    });

    await user.save();

    res.json({ msg: "registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "error" });
  }
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "no user" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ msg: "wrong password" });

    res.json({ userId: user._id });
  } catch (err) {
    res.status(500).json({ msg: "error" });
  }
});

// ---------------- SAVE DATA ----------------
app.post("/save", async (req, res) => {
  try {
    const { userId, data } = req.body;

    await User.findByIdAndUpdate(userId, { todos: data });

    res.json({ msg: "saved" });
  } catch (err) {
    res.status(500).json({ msg: "error" });
  }
});

// ---------------- GET DATA ----------------
app.get("/data/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.json(user?.todos || {});
  } catch (err) {
    res.status(500).json({ msg: "error" });
  }
});

// ---------------- FRONTEND FALLBACK ----------------
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});