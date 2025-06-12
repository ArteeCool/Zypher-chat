import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../scemas/user.scema.ts";
import crypto from "crypto";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const userByEmail = await User.findOne({ email });
    const userByUsername = await User.findOne({ username });

    if (userByEmail || userByUsername) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isConfirmed: false,
      confirmationToken: confirmationToken,
    });

    await newUser.save();

    res.status(201).json({
      msg: "User registered successfully",
      data: {
        email: newUser.email,
        confirmationToken: newUser.confirmationToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error", error: error });
  }
});

router.post("/confirm-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ confirmationToken: token });

    if (user) {
      user.confirmationToken = null;
      await user.save();
    }

    res.json({ msg: "Email confirmed successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const token = jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          confirmationToken: user.confirmationToken,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.confirmationToken !== null) {
      return res.status(400).json({ msg: "Email is not confirmed" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 1000 * 60 * 60;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpiry;

    await user.save();

    res.json({
      msg: "Password reset link generated",
      resetLink: `https://arteecool.com.ua/reset-password/?token=${resetToken}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({ msg: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
