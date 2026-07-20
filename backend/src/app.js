// src/app.js

import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import dmRouter from "./modules/dms/dm-route.js";
import userRouter from "./modules/users/user-route.js";
import callRouter from "./modules/calling/call-route.js";
import channelRouter from "./modules/channels/channel-route.js";
import groupRouter from "./modules/groups/groups-route.js";
import messageRouter from "./modules/messages/message-route.js";
import workspaceRouter from "./modules/workspaces/workspace-route.js";

// Middlewares
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";

const app = express();

app.set("trust proxy", 1);

app.use(morgan("dev"));

/* ===============================
   GLOBAL MIDDLEWARES
================================ */

// Security headers
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000000,

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      message:
        "Too many requests from this IP. Please try again after 15 minutes.",
    });
  },
});

app.use(limiter);

// Logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ===============================
   HEALTH CHECK
================================ */

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Slack Clone API running 🚀",
  });
});

/* ==============================x=
   ROUTES
================================ */

app.use("/api/v1/users", userRouter);
app.use("/api/v1/workspaces", workspaceRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/calls", callRouter);
app.use("/api/v1/dm", dmRouter);

/* ===============================
   ERROR HANDLING
================================ */

// Serve favicon.ico dummy/empty response to prevent 404 log clutter
app.get("/favicon.ico", (req, res) => res.status(204).end());

// 404
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
