import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const otpLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 2, // max 2 requests per 15 sec

  message: {
    success: false,
    message: "Too many OTP requests. Please wait 15 seconds.",
  },

  standardHeaders: true,
  legacyHeaders: false,

  // Safe IPv6 compatible key generator
  keyGenerator: (req) => {
    return req.body.email || ipKeyGenerator(req.ip);
  },
});

export default otpLimiter;
