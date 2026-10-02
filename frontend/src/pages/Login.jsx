import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  // LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/interview'); 
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  // SEND OTP FUNCTION
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      setSuccessMsg(response.data.message);
      setOtpSent(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Failed to send OTP.');
    }
  };

  // RESET PASSWORD FUNCTION
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await apiClient.post('/api/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      
      setSuccessMsg(response.data.message);
      setForgotPasswordMode(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setPassword(''); 
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Password reset failed.');
    }
  };

  const cancelForgotFlow = () => {
    setForgotPasswordMode(false);
    setOtpSent(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Google OAuth URL handling
  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="card">
      <h2>{forgotPasswordMode ? 'Reset Password 🔑' : 'Welcome Back 🚀'}</h2>
      <p className="subtitle">
        {forgotPasswordMode 
          ? (otpSent ? 'Enter the 6-digit OTP sent to your email.' : 'Enter your email to receive an OTP.')
          : 'Log in to continue your tech interview prep.'}
      </p>

      {errorMsg && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>{successMsg}</div>}

      {!forgotPasswordMode ? (
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="College Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <div style={{ textAlign: 'right', marginBottom: '15px' }}>
            <span 
              onClick={() => setForgotPasswordMode(true)}
              style={{ color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
            >
              Forgot Password?
            </span>
          </div>

          <button type="submit">Enter Arena</button>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            style={{ backgroundColor: '#db4437', color: 'white', marginTop: '15px', width: '100%', padding: '12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sign in with Google
          </button>
        </form>
      ) : !otpSent ? (
        <form onSubmit={handleSendOtp}>
          <input 
            type="email" 
            placeholder="College Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit">Send OTP</button>
          <p onClick={cancelForgotFlow} style={{ textAlign: 'center', marginTop: '15px', color: '#718096', fontSize: '14px', cursor: 'pointer' }}>
            Back to Login
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <input 
            type="email" 
            value={email} 
            disabled 
            style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}
          />
          <input 
            type="text" 
            placeholder="Enter 6-Digit OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
          <button type="submit">Reset & Login</button>
          <p onClick={cancelForgotFlow} style={{ textAlign: 'center', marginTop: '15px', color: '#718096', fontSize: '14px', cursor: 'pointer' }}>
            Cancel
          </p>
        </form>
      )}

      {!forgotPasswordMode && (
        <p className="link-text" style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096' }}>
          New to AdaptPrep? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Create Account</Link>
        </p>
      )}
    </div>
  );
}