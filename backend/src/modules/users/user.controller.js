import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOtpEmail } from "../../../config/email.verification.js";
import prisma from "../../db/db.js";
import { generateJWT } from "../../services/generate.cookie.js";
import { log } from "console";

/* ===============================
   REGISTER USER
================================ */
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, contact } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    const token = generateJWT(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   LOGIN USER
================================ */
export const loginUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email ) {
      return res.status(400).json({ message: "Something is missing" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    const token = generateJWT(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Login successfull",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   LOGOUT USER
================================ */
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token");

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   SEND OTP
================================ */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Delete old OTPs for this email
    await prisma.otp.deleteMany({
      where: { email },
    });

    // Save OTP in temporary collection
    const expiry = Date.now() + 5 * 60 * 1000;

    await prisma.otp.create({
      data: {
        email,
        otp,
        expiresAt: new Date(expiry),
      },
    });

    // Send Email
    await sendOtpEmail(email, "Your OTP Code", otp);

    return res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ OTP ERROR:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

/* ===============================
   VERIFY OTP
================================ */
export const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const record = await prisma.otp.findFirst({
      where: {
        email,
        otp,
      },
    });

    if (!record) {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < Date.now()) {
      return res.status(400).json({
        status: "error",
        message: "OTP expired",
      });
    }

    // Delete OTP after verification
    await prisma.otp.deleteMany({
      where: { email },
    });

    // Check or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

 if (!user) {
  user = await prisma.user.create({
    data: {
      email,
      fullName: "New User",
      password: "",
      isVerified: true,
    },
  });
}


    // Generate token
    const token = generateJWT(user.id);
    if (!token) {
      return res.status(500).json({
        status: "error",
        message: "Failed to generate token",
      });
    }

    // 🔥 ✅ SET COOKIE HERE
    res.cookie("token", token, {
      httpOnly: true, // 🔒 secure (no JS access)
      secure: false, // ⚠️ localhost (true in production)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      data: {
        user, // ✅ token remove kar sakta hai (optional)
      },
    });
  } catch (error) {
    console.error("❌ VERIFY ERROR:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      console: error.message,
    });
  }
};

/* ===============================
   GET LOGGED-IN USER PROFILE
================================ */
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        theme: true,
        appearanceMode: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   UPDATE PROFILE
================================ */
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, theme, profilePic } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        fullName: fullName || user.fullName,
        theme: theme || user.theme,
        avatar: profilePic || user.avatar,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   CHANGE PASSWORD
================================ */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET USER BY ID
================================ */
export const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.userId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   SEARCH USERS
================================ */
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query)
      return res.status(400).json({ message: "Search query is required" });

    const users = await prisma.user.findMany({
      where: {
        fullName: {
          contains: query,
          mode: "insensitive",
        },
        NOT: {
          id: req.user.id,
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   ThemeChange USERS
================================ */
export const themeChange = async (req, res, next) => {
  try {
    const user = req.user.id;
    const { mode, theme } = req.body;
    console.log("THEME CHANGE REQUEST:", { user, mode, theme });

    const updatedUser = await prisma.user.update({
      where: {
        id: user,
      },
      data: {
        theme,
        appearanceMode: mode,
      },
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      status: "success",
      message: "Theme updated successfully",
    });
  } catch (error) {
    console.error("❌ THEME CHANGE ERROR:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
