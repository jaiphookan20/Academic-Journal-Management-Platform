import React, { useState } from 'react';
import { RiLockPasswordFill } from "react-icons/ri";
import { useParams, useNavigate} from 'react-router-dom';

const PasswordReset = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams(); // Capture the token from the URL
  const navigate = useNavigate();

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  
  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match.");
      return;
    }

    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_HOST}:8080/client/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      alert('Password has been reset successfully');
      navigate('/login');
    } catch (error) {
      alert('Failed to reset password');
    }
  };

  const containerStyle = {
    maxWidth: '600px',
    width: '100%',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#ad3232',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
  };

  const textStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
  };

  const underlineStyle = {
    width: '60px',
    height: '4px',
    margin: '10px auto 0',
    backgroundColor: '#ffffff',
  };

  const inputsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    maxWidth: '540px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingRight: '10px',
  };

  const iconStyle = {
    fontSize: '1.2rem',
    color: '#333',
    marginRight: '10px',
  };

  const passwordInputStyle = {
    flexGrow: 1,
    fontSize: '1rem',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };

  const submitStyle = {
    width: '100%',
    maxWidth: '300px',
    padding: '12px',
    fontSize: '1.1rem',
    marginTop: '20px',
    backgroundColor: 'black',
    color: 'white',
    textAlign: 'center',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };


  return (
    <div style={containerStyle}>
      <center>
        <div style={headerStyle}>
          <div style={textStyle}>Password Reset</div>
          <div style={underlineStyle}></div>
        </div>
      </center>
      <div style={inputsContainerStyle}></div>
      <div style={inputsContainerStyle}>
        <div className="left-container">
          <div style={inputStyle}>
            <RiLockPasswordFill style={iconStyle} />
            <input
              type="password"
              placeholder="Enter New Password*"
              value={password}
              onChange={handlePasswordChange}
              style={passwordInputStyle}
            />
          </div>
        </div>
        <div className="right-container">
          <div style={inputStyle}>
            <RiLockPasswordFill style={iconStyle} />
            <input
              type="password"
              placeholder="Confirm New Password*"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              style={passwordInputStyle}
            />
          </div>
        </div>
      </div>
      <div style={inputsContainerStyle}></div>
      <center>
        <div
          style={submitStyle}
          onClick={handleSubmit}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#333')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'black')}
        >
          Submit
        </div>
      </center>
    </div>
  );
};

export default PasswordReset;
