// src/app.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Routes
import userRouter from "./routes/user-route.js";
import workspaceRouter from "./routes/workspace-route.js";
import channelRouter from "./routes/channel-route.js";
import messageRouter from "./routes/message-route.js";
import groupRouter from "./routes/groups-route.js";
import callRouter from "./routes/call-route.js";
import dmRouter from "./routes/dm-route.js";

// Middlewares
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();


app.use(morgan("dev"));


/* ===============================
   GLOBAL MIDDLEWARES
================================ */

// Security headers
app.use(helmet());



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4000,

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
app.use(
  cors({
    origin: "http://localhost:3000",
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

/* ===============================
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

// 404
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
