import Order from "../models/orderModel.js";
import axios from "axios";

const getMpesaAccessToken = async () => {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching M-Pesa token:", error);
    throw new Error("Failed to get M-Pesa access token");
  }
};

const initiateSTKPush = async (phone, amount, orderId) => {
  const { MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");
  const accessToken = await getMpesaAccessToken();
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: `${MPESA_CALLBACK_URL}/${orderId}`,
    AccountReference: `SwiftMeals-${orderId}`,
    TransactionDesc: "Payment for food order",
  };
  console.log("STK Push Payload:", payload);

  try {
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("STK Push Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("STK Error Details:", error.response?.data || error.message);
    throw error;
  }
};

const placeOrder = async (req, res) => {
  try {
    const { 
      address: { firstName, lastName, email, street, apartmentHostel, location, floorNumber, roomNumber, phone }, 
      items, amount, paymentMethod, payment: paymentStatus 
    } = req.body;
    const userId = req.userId;
    console.log("User ID:", userId);

    const orderData = {
      userId,
      items,
      amount,
      payment: paymentStatus || false,
      paymentMethod: paymentMethod || "mpesa",
      address: { firstName, lastName, email, street, apartmentHostel, location, floorNumber, roomNumber, phone },
      mpesa: { CheckoutRequestID: null },
    };

    const order = new Order(orderData);
    await order.save();

    if (paymentMethod === "mpesa") {
      const stkResponse = await initiateSTKPush(phone, amount, order._id);
      order.mpesa.CheckoutRequestID = stkResponse.CheckoutRequestID;
      await order.save();
      console.log("Order placed successfully, STK Response:", stkResponse);
      res.json({
        success: true,
        message: "Order created, please complete payment on your phone",
        orderId: order._id,
        checkoutRequestID: stkResponse.CheckoutRequestID,
      });
    } else {
      console.log("Order placed successfully (Cash on Delivery):", order._id);
      res.json({
        success: true,
        message: "Order placed successfully",
        orderId: order._id,
      });
    }
  } catch (error) {
    console.error("Place Order Error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Error placing order: " + error.message });
  }
};

const handleMpesaCallback = async (req, res) => {
  const { Body } = req.body;
  const { CheckoutRequestID, ResultCode, CallbackMetadata } = Body.stkCallback;

  try {
    const order = await Order.findOne({ "mpesa.CheckoutRequestID": CheckoutRequestID });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (ResultCode === 0) {
      const metadata = CallbackMetadata.Item.reduce((acc, item) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});

      order.payment = true;
      order.mpesa = {
        CheckoutRequestID,
        MpesaReceiptNumber: metadata.MpesaReceiptNumber,
        TransactionDate: metadata.TransactionDate,
        PhoneNumber: metadata.PhoneNumber,
      };
      await order.save();
    } else {
      order.payment = false;
      order.mpesa = { CheckoutRequestID, ResultCode, ResultDesc: Body.stkCallback.ResultDesc };
      await order.save();
    }

    res.status(200).json({ message: "Callback processed" });
  } catch (error) {
    console.error("Error in callback:", error);
    res.status(500).json({ message: "Error processing callback" });
  }
};

const listOrders = async (req, res) => {
  try {
    console.log("listOrders function called"); 
    const userId = req.userId; // From verifyToken middleware
    const role = req.role; // From verifyToken middleware

    console.log("User ID from token:", userId);
    console.log("Role from token:", role);

    let orders;
    if (role === "admin") {
      orders = await Order.find().sort({ createdAt: -1 });
      console.log("Admin orders fetched:", orders.length);
    } else if (role === "user") {
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
      console.log("User orders fetched:", orders.length);
    } else {
      console.log("Invalid role, access denied");
      return res.status(403).json({ success: false, message: "Access denied: Invalid role" });
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error in listOrders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

export { placeOrder, handleMpesaCallback, listOrders };