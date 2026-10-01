import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Interview from './pages/Interview';
import Dashboard from './pages/Dashboard'; // <-- NAYA IMPORT

function App() {
  return (
    <Router>
      <Routes>
        {/* Koi direct website kholega toh seedha login par bhej do */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* NAYA ROUTE */}
        <Route path="/dashboard" element={<Dashboard />} /> 
        
        <Route path="/interview" element={<Interview />} />
      </Routes>
    </Router>
  );
}

export default App;