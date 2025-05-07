import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      setError("Please sign in to view your orders.");
      return;
    }
    try {
      console.log("Fetching orders with token:", token);
      const response = await axios.get(`${url}/api/order/list`, {
        headers: { token },
      });
      console.log("Orders response:", response.data);
      if (response.data.success) {
        setOrders(response.data.data || []);
        setError(null);
      } else {
        console.error('Failed to fetch orders:', response.data.message);
        setOrders([]);
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error);
      setOrders([]);
      setError(error.response?.data?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOrders([]);
    setLoading(true);
    setError(null);
    fetchOrders();
  }, [token]);

  if (!token) {
    return <div className="orders">Please sign in to view your orders.</div>;
  }

  return (
    <div className="orders">
      <h2>Your Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-item">
              <p>Order ID: {order._id}</p>
              <p>Amount: KSh {order.amount.toLocaleString()}</p>
              <p>Payment: {order.payment ? 'Paid' : 'Pending'}</p>
              <p>Payment Method: {order.paymentMethod === "cash" ? "Cash on Delivery" : "M-Pesa"}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              {order.mpesa && order.mpesa.MpesaReceiptNumber && (
                <p>M-Pesa Receipt: {order.mpesa.MpesaReceiptNumber}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;