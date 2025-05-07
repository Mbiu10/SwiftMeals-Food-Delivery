import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";
import { StoreContext } from "../../../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";

const AdminOrders = () => {
  const { url, role, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (role !== "admin") {
    navigate("/");
    return null;
  }

  const fetchOrders = async () => {
    try {
      console.log("Admin fetching orders with token:", token);
      const response = await axios.get(`${url}/api/order/list`, {
        headers: { token },
      });
      console.log("Admin orders response:", response.data);
      if (response.data.success) {
        setOrders(response.data.data || []);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error);
      setError(error.response?.data?.message || "Error fetching orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItems = (items) => {
    // Handle case where items is an array (new format)
    if (Array.isArray(items)) {
      return items.map((item, idx) => (
        <span key={idx}>
          {item.quantity} x {item.name || `Item ID ${item._id}`},{" "}
        </span>
      ));
    }
    // Handle case where items is an object (old format)
    if (typeof items === "object" && items !== null) {
      return Object.entries(items).map(([itemId, quantity], idx) => (
        <span key={idx}>
          {quantity} x Item ID {itemId},{" "}
        </span>
      ));
    }
    // Fallback if items is invalid
    return <span>No items available</span>;
  };

  return (
    <div className="app-content admin-layout">
      <Sidebar />
      <div className="main-content">
        <div className="orders add flex-col">
          <h3>Order List</h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="order-list">
              {orders.map((order, index) => (
                <div key={index} className="order-item">
                  <div>
                    <p>
                      <b>Order ID:</b> {order._id}
                    </p>
                    <p>
                      <b>Customer:</b> {order.address.firstName} {order.address.lastName}
                    </p>
                    <p>
                      <b>Total:</b> KSh {order.amount.toLocaleString()}
                    </p>
                    <p>
                      <b>Payment Status:</b> {order.payment ? "Paid" : "Pending/Failed"}
                    </p>
                    {order.mpesa && (
                      <>
                        <p>
                          <b>M-Pesa Receipt:</b> {order.mpesa.MpesaReceiptNumber || "N/A"}
                        </p>
                        <p>
                          <b>Phone:</b> {order.mpesa.PhoneNumber || "N/A"}
                        </p>
                      </>
                    )}
                    <p>
                      <b>Items:</b> {renderItems(order.items)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;