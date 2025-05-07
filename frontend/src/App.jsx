import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Admin/Components/Sidebar/Sidebar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Orders from "./components/Orders/Orders";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import Add from "./components/Admin/Pages/Add/Add";
import List from "./components/Admin/Pages/List/List";
import AdminOrders from "./components/Admin/Pages/AdminOrders/AdminOrders"; 
import StoreContextProvider from "./context/StoreContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  // Check if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <StoreContextProvider>
      <ToastContainer />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <div className="app-content">
          {isAdminRoute && <Sidebar />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/myorders" element={<Orders />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/admin/add" element={<Add />} />
            <Route path="/admin/list" element={<List />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </StoreContextProvider>
  );
};

export default App;