// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
console.log("AuthProvider instance:", Math.random());


/**
 * Named export `auth` — use as: import { auth } from "../middleware/authMiddleware.js"
 * This middleware expects header: Authorization: Bearer <token>
 * If token is valid it sets req.user = userDocument and calls next()
 * If not valid, returns 401.
 */
export async function auth(req, res, next) {
  try {
    const header = req.headers["authorization"] || req.headers["Authorization"];
    if (!header) return res.status(401).json({ error: "Missing auth header" });

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid auth header format" });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || "devsecret";

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (!payload || !payload.id) return res.status(401).json({ error: "Invalid token payload" });

    // load user (optional: skip DB load and attach payload)
    const user = await User.findById(payload.id).lean();
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    return next();
  } catch (err) {
    console.error("auth middleware error:", err);
    return res.status(500).json({ error: "Server error in auth" });
  }
}
