import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { placeOrder, handleMpesaCallback, listOrders } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/callback/:orderId", handleMpesaCallback);
orderRouter.get("/list", authMiddleware, listOrders);

export default orderRouter;