// export default function Register() {
//   return <h2>Register Page</h2>;
// }


// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';

// export default function Register() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault(); // Page refresh hone se rokta hai
//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/register', {
//         name,
//         email,
//         password
//       });
//       alert(response.data.message); // Success message
//       navigate('/login'); // Register hote hi login page par bhej dega
//     } catch (error) {
//       alert(error.response?.data?.error || 'Registration failed');
//     }
//   };

//   return (
//     <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
//       <h2>Create an Account</h2>
//       <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//         <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
//         <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
//           Register
//         </button>
//       </form>
//       <p>Already have an account? <Link to="/login">Login here</Link></p>
//     </div>
//   );
// }




import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); 
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      alert('Welcome to the grind! Your account is ready.'); 
      navigate('/login'); 
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    }
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

        <button type="button" onClick={() => { window.location.href = 'http://localhost:5000/api/auth/google' }} style={{ backgroundColor: '#db4437', color: 'white', marginTop: '15px', width: '100%', padding: '12px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Sign up with Google
        </button>
      </form>
      
      <p className="link-text" style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096' }}>
        Already on the grind? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Log In</Link>
      </p>
    </div>
  );
}