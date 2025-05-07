import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";

// Login user
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verify role
    if (user.role !== role) {
      return res.json({ success: false, message: `Invalid role. You are not an ${role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id, user.role);
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    res.json({ success: false, message: "Error" });
  }
};

// Create JWT token with role
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

// Register user
const registerUser = async (req, res) => {
  const { name, password, email, role } = req.body;
  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validate email format and password strength
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    // Validate role (default to user if not provided)
    const validRole = role === "admin" ? "admin" : "user";

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: validRole,
    });

    const user = await newUser.save();
    const token = createToken(user._id, user.role);
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.error("Register Error:", error);
    res.json({ success: false, message: "Error" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Save token and expiration to user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const resetUrl = `http://localhost:5173/reset-password/${token}`; // Vite default port
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SwiftMeals Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your SwiftMeals account.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link expires in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.json({ success: false, message: "Error sending reset link" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.json({ success: false, message: "Error resetting password" });
  }
};

export { loginUser, registerUser, forgotPassword, resetPassword };