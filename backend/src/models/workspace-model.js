import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      index: true,
    },

    logo: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // Workspace Owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    

    // All members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Role system per workspace
    roles: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member", "guest"],
          default: "member",
        },
      },
    ],

    // Pending invites
    invites: [
      {
        email: String,
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Subscription Plan
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

    // Limits (future scalable)
    limits: {
      maxMembers: {
        type: Number,
        default: 50,
      },
      maxChannels: {
        type: Number,
        default: 100,
      },
    },

    // Workspace Settings
    settings: {
      allowPublicChannels: {
        type: Boolean,
        default: true,
      },
      allowPrivateChannels: {
        type: Boolean,
        default: true,
      },
      allowGuestInvites: {
        type: Boolean,
        default: false,
      },
    },

    // Status flags
    isArchived: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
workspaceSchema.pre("save", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }
});

export default mongoose.model("Workspace", workspaceSchema);
