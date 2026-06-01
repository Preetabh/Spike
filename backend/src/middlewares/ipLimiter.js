import rateLimit from "express-rate-limit";

export const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 250,

  keyGenerator: (req) => {
    return req.user?.id ?? req.ip;
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      status: "error",
      message:
        "Too many requests. Please try again after 15 minutes.",
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
});
