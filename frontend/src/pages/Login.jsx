// export default function Login() {
//   return <h2>Login Page</h2>;
// }



// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/login', {
//         email,
//         password
//       });
      
//       // Token ko browser ki memory (localStorage) mein save karna
//       localStorage.setItem('token', response.data.token);
//       alert(response.data.message);
      
//       // Login hote hi Interview Dashboard par bhej do
//       navigate('/interview'); 
//     } catch (error) {
//       alert(error.response?.data?.error || 'Login failed');
//     }
//   };

//   return (
//     <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
//       <h2>Login to AdaptPrep</h2>
//       <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//         <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none' }}>
//           Login
//         </button>
//       </form>
//       <p>New user? <Link to="/register">Register here</Link></p>
//     </div>
//   );
// }




import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  // 1. Basic Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 2. Naye Alert States (Errors aur Success dikhane ke liye)
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 3. Forgot Password Flow States
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
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/interview'); 
    } catch (error) {
      // Ab 'alert' ki jagah form ke upar laal rang mein error aayega
      setErrorMsg(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  // SEND OTP FUNCTION (Forgot Password)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSuccessMsg(response.data.message); // OTP Sent success message
      setOtpSent(true); // OTP wale dabbe khol do
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Failed to send OTP.');
    }
  };

  // RESET PASSWORD FUNCTION (OTP Submit karna)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      
      setSuccessMsg(response.data.message); // Password reset success message
      
      // Sab kuch wapas reset kar do taaki normal login screen aa jaye
      setForgotPasswordMode(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setPassword(''); 
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Password reset failed.');
    }
  };

  // Wapas normal Login screen par aane ke liye
  const cancelForgotFlow = () => {
    setForgotPasswordMode(false);
    setOtpSent(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="card">
      <h2>{forgotPasswordMode ? 'Reset Password 🔑' : 'Welcome Back 🚀'}</h2>
      <p className="subtitle">
        {forgotPasswordMode 
          ? (otpSent ? 'Enter the 6-digit OTP sent to your email.' : 'Enter your email to receive an OTP.')
          : 'Log in to continue your tech interview prep.'}
      </p>

      {/* Smart Alerts: Error Laal rang mein, Success Hare rang mein */}
      {errorMsg && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>{successMsg}</div>}

      {/* CONDITIONAL UI: Yahan hum decide kar rahe hain ki kaunsa form dikhana hai */}
      
      {!forgotPasswordMode ? (
        /* ================= 1. NORMAL LOGIN FORM ================= */
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
          
          {/* Naya "Forgot Password" link */}
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
            onClick={() => { window.location.href = 'http://localhost:5000/api/auth/google' }}
            style={{ backgroundColor: '#db4437', color: 'white', marginTop: '15px', width: '100%', padding: '12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sign in with Google
          </button>
        </form>

      ) : !otpSent ? (
        /* ================= 2. FORGOT PASSWORD (EMAIL) FORM ================= */
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
        /* ================= 3. RESET PASSWORD (OTP & NEW PASS) FORM ================= */
        <form onSubmit={handleResetPassword}>
          <input 
            type="email" 
            value={email} 
            disabled 
            style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }} // Thoda grey look dikhane ke liye
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

      {/* Pehle wala Register link sirf Login mode mein dikhega */}
      {!forgotPasswordMode && (
        <p className="link-text" style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096' }}>
          New to AdaptPrep? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Create Account</Link>
        </p>
      )}
    </div>
  );
}