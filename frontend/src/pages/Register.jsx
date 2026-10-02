import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); 
    try {
      await apiClient.post('/api/auth/register', { name, email, password });
      alert('Welcome to the grind! Your account is ready.'); 
      navigate('/login'); 
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleGoogleSignup = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="card">
      <h2>Kickstart Your Prep</h2>
      <p className="subtitle">Join AdaptPrep and let AI guide your placement journey.</p>
      
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="College Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Start Preparing Now</button>

        <button 
          type="button" 
          onClick={handleGoogleSignup} 
          style={{ backgroundColor: '#db4437', color: 'white', marginTop: '15px', width: '100%', padding: '12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Sign up with Google
        </button>
      </form>
      
      <p className="link-text" style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096' }}>
        Already on the grind? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Log In</Link>
      </p>
    </div>
  );
}