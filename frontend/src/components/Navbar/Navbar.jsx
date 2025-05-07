import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const { getTotalCartAmount, token, setToken, setSearchQuery: setContextSearchQuery, role, setRole } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("cartItems");
    setToken("");
    setRole("");
    navigate("/");
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setContextSearchQuery(query);
  };

  const goToOrders = () => {
    navigate(role === 'admin' ? '/admin/orders' : '/myorders');
  };

  const goToAddFood = () => {
    navigate('/admin/add');
  };

  return (
    <div className='navbar'>
      <Link to={role === 'admin' ? '/admin/add' : '/'}><img src={assets.logo} alt="" className="logo" /></Link>
      {role !== 'admin' && (
        <ul className="navbar-menu">
          <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
          <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</a>
          <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</a>
          <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>contact us</a>
        </ul>
      )}
      <div className="navbar-right">
        {role !== 'admin' && (
          <>
            <div className="navbar-search">
              <input
                type="text"
                placeholder="Search food..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              <img src={assets.search_icon} alt="search" className="search-icon" />
            </div>
            <div className="navbar-search-icon">
              <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
              <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
            </div>
          </>
        )}
        {!token ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className='navbar-profile'>
            <img src={role === 'admin' ? assets.profile_image : assets.profile_icon} alt="" />
            <ul className='nav-profile-dropdown'>
              {role === 'admin' && (
                <li onClick={goToAddFood}>
                  <img src={assets.add_icon} alt="" />
                  <p>Add Food Item</p>
                </li>
              )}
              <li onClick={goToOrders}>
                <img src={assets.bag_icon} alt="" />
                <p>{role === 'admin' ? 'Manage Orders' : 'Orders'}</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;