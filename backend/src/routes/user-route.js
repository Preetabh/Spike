import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  searchUsers,
  sendOtp,
  verifyOtp,
  themeChange
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/authMiddleware.js";
import otpLimiter from "../middlewares/otpLimiter.js";


const router = express.Router();

// 🔓 Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.post("/sendOtp", otpLimiter,  sendOtp);
router.post("/verifyOtp", verifyOtp);


// 👤 Profile Routes
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.put("/change-password", protect, changePassword);


// 🔍 User Search (for DM / Add members)
router.get("/search", protect, searchUsers);

// 📄 Get user by ID
router.get("/:userId", protect, getUserById);

// Change Themes - This route allows users to change their theme preference
router.patch("/theme",protect,themeChange);

export default router;
