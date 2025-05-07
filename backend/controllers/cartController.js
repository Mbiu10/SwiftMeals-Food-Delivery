import userModel from "../models/userModel.js";

// Add items to user cart
const addToCart = async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware
    const { itemId } = req.body;

    let userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.json({ success: false, message: "Error adding to cart" });
  }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;

    let userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.json({ success: false, message: "Error removing from cart" });
  }
};

// Fetch user cart data
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    let userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.json({ success: false, message: "Error fetching cart" });
  }
};

// Clear user cart
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.json({ success: false, message: "Error clearing cart" });
  }
};

export { addToCart, removeFromCart, getCart, clearCart };