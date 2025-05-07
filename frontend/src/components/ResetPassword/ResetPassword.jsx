import React, { useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const { url } = React.useContext(StoreContext);
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${url}/api/user/reset-password`, { token, password });
      alert(response.data.message);
      if (response.data.success) {
        navigate('/'); // Redirect to login after success
      }
    } catch (error) {
      alert("Error resetting password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password">
      <form onSubmit={handleSubmit} className="reset-password-container">
        <h2>Reset Password</h2>
        <div className="reset-password-inputs">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;