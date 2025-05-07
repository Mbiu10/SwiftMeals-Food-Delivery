import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setRole } = useContext(StoreContext);
  const navigate = useNavigate();
  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    const response = await axios.post(newUrl, data);
    if (response.data.success) {
      setToken(response.data.token);
      setRole(response.data.role);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      setShowLogin(false);
      if (response.data.role === "admin") {
        navigate("/admin/add");
      } else {
        navigate("/");
      }
    } else {
      alert(response.data.message);
    }
  };

  const onForgotPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${url}/api/user/forgot-password`, { email: resetEmail });
      alert(response.data.message);
      setForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      alert("Error sending reset link: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-popup'>
      {forgotPassword ? (
        <form onSubmit={onForgotPassword} className="login-popup-container">
          <div className="login-popup-title">
            <h2>Forgot Password</h2>
            <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
          </div>
          <div className='login-popup-inputs'>
            <input
              type="email"
              placeholder='Your email'
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <button type='submit' disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <p>
            Back to login? <span onClick={() => setForgotPassword(false)}>Click here</span>
          </p>
        </form>
      ) : (
        <form onSubmit={onLogin} className="login-popup-container">
          <div className="login-popup-title">
            <h2>{currState}</h2>
            <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
          </div>
          <div className='login-popup-inputs'>
            {currState === "Login" ? <></> : (
              <input
                name='name'
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder='Your name'
                required
              />
            )}
            <input
              name='email'
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder='Your email'
              required
            />
            <input
              name='password'
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder='Password'
              required
            />
            <select name='role' onChange={onChangeHandler} value={data.role} required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type='submit'>{currState === "Sign Up" ? "Create account" : "Login"}</button>
          <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy</p>
          </div>
          {currState === "Login" ? (
            <>
              <p>
                Forgot Password? <span onClick={() => setForgotPassword(true)}>Click here</span>
              </p>
              <p>
                Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span>
              </p>
            </>
          ) : (
            <p>
              Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span>
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default LoginPopup;