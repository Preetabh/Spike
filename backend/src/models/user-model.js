import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 100,
      default: "Spike-User",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    // 🔥 User can belong to multiple workspaces
    workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],

    // 🔥 Account status
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },

    // 🔥 UI preferences
    appearance: {
  mode: {
    type: String,
    enum: ["light", "dark", "system"],
    default: "dark",
  },
  theme: {
    type: String,
    enum: [
      "iceBlue",
      "forest",
      "sunset",
      "midnight",
      "rose",
      "neon",
      "cosmic",
      "chillVibes",
      "bigBusiness",
      "fallingLeaves"
    ],
    default: "rose",
  }
},

    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // 🔥 Online presence
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    // OTP / Email verification (future ready)
    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
    themeColor: {
      type: String,
      default: "#4A154B", // Slack's signature purple
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
