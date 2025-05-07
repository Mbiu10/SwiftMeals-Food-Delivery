import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./PlaceOrder.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, cartItems, setCartItems, url, food_list } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    apartmentHostel: "",
    location: "",
    floorNumber: "",
    roomNumber: "",
    phone: "", // Must be in 2547XXXXXXXXX format
  });

  const [paymentMethod, setPaymentMethod] = useState("CASH ON DELIVERY"); // Default to Cash on Delivery
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Validate phone format for M-Pesa
    if (paymentMethod === "PAY WITH MPESA" && !data.phone.match(/^2547\d{8}$/)) {
      setError("Phone number must be in the format 2547XXXXXXXXX");
      setLoading(false);
      return;
    }

    // Transform cartItems into items array expected by backend
    if (!food_list || food_list.length === 0) {
      setError("Food list not loaded. Please try again.");
      setLoading(false);
      return;
    }

    const items = Object.keys(cartItems).reduce((acc, itemId) => {
      if (cartItems[itemId] > 0) {
        const foodItem = food_list.find((item) => item._id === itemId);
        if (foodItem) {
          acc.push({ ...foodItem, quantity: cartItems[itemId] });
        }
      }
      return acc;
    }, []);

    if (items.length === 0) {
      setError("Cart is empty. Add items to place an order.");
      setLoading(false);
      return;
    }

    const orderDetails = {
      address: data,
      items,
      amount: getTotalCartAmount() + 30, // Total with delivery fee
    };

    try {
      if (paymentMethod === "CASH ON DELIVERY") {
        // Cash on Delivery: Complete order immediately
        const response = await axios.post(
          `${url}/api/order/place`,
          {
            ...orderDetails,
            paymentMethod: "cash",
            payment: true, // Mark as paid (cash handled on delivery)
          },
          { headers: { token } }
        );

        if (response.data.success) {
          alert("Order placed successfully! Pay cash on delivery.");
          setCartItems({}); // Clear frontend cart
          await axios.post(`${url}/api/cart/clear`, {}, { headers: { token } }); // Clear backend cart
          navigate("/myorders");
        } else {
          throw new Error(response.data.message || "Failed to place order");
        }
      } else {
        // Pay with M-Pesa: Trigger STK Push
        const response = await axios.post(
          `${url}/api/order/place`,
          {
            ...orderDetails,
            paymentMethod: "mpesa",
            payment: false, // Payment pending until callback
          },
          { headers: { token } }
        );

        if (response.data.success) {
          alert("Payment request sent to your phone. Please enter your M-Pesa PIN.");
          const orderId = response.data.orderId;
          const maxAttempts = 30; // 60 seconds (30 attempts * 2 seconds)
          let attempts = 0;

          const checkPayment = setInterval(async () => {
            try {
              attempts++;
              const statusResponse = await axios.get(`${url}/api/order/list`, { headers: { token } });
              const order = statusResponse.data.data.find((o) => o._id === orderId);

              if (order && order.payment) {
                clearInterval(checkPayment);
                setCartItems({}); // Clear frontend cart
                await axios.post(`${url}/api/cart/clear`, {}, { headers: { token } }); // Clear backend cart
                navigate("/myorders");
              } else if (attempts >= maxAttempts) {
                clearInterval(checkPayment);
                setError("Payment timed out. Please try again or contact support.");
              }
            } catch (err) {
              console.error("Error checking payment status:", err);
              clearInterval(checkPayment);
              setError("Error checking payment status. Please try again.");
            }
          }, 2000);
        } else {
          throw new Error(response.data.message || "Failed to place order");
        }
      }
    } catch (error) {
      console.error("Detailed Error placing order:", error.response?.data || error.message);
      setError("Error initiating payment: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="place-order">Please sign in to place an order.</div>;
  }

  if (!food_list || food_list.length === 0) {
    return <div className="place-order">Loading food list...</div>;
  }

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        {error && <p className="error">{error}</p>}
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="apartmentHostel"
            onChange={onChangeHandler}
            value={data.apartmentHostel}
            type="text"
            placeholder="Apartment/Hostel"
          />
          <input
            required
            name="location"
            onChange={onChangeHandler}
            value={data.location}
            type="text"
            placeholder="Location"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="floorNumber"
            onChange={onChangeHandler}
            value={data.floorNumber}
            type="text"
            placeholder="Floor Number"
          />
          <input
            required
            name="roomNumber"
            onChange={onChangeHandler}
            value={data.roomNumber}
            type="text"
            placeholder="Room Number"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Phone (e.g., 254712345678)"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>KSh {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>KSh 30</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>KSh {getTotalCartAmount() + 30}</b>
            </div>
          </div>
        </div>
        <div className="payment-method">
          <label htmlFor="paymentMethod">Payment Method:</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading}
          >
            <option value="PAY WITH MPESA">Pay with M-Pesa</option>
            <option value="CASH ON DELIVERY">Cash on Delivery</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : paymentMethod === "CASH ON DELIVERY" ? "PLACE ORDER" : "PAY WITH M-PESA"}
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;