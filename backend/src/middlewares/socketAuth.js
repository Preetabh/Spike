import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const parseCookieHeader = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((cookie) => cookie.trim().split("="))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1] ||
      parseCookieHeader(socket.handshake.headers.cookie)?.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, fullName: true, email: true, avatar: true },
    });

    if (!user) {
      return next(new Error("Authentication error"));
    }

    socket.data.user = user;
    return next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
};
