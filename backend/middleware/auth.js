import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("token");
    console.log("Received token:", token);
    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.userId = decoded.id;
    req.role = decoded.role; 
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.json({ success: false, message: "Invalid token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.role !== "admin") {
    return res.json({ success: false, message: "Access denied: Admins only" });
  }
  next();
};

export { authMiddleware, adminMiddleware };