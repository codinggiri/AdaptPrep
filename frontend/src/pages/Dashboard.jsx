import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await apiClient.get('/api/interview/history');
        setDashboardData(response.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#3b82f6' }}>Loading your Arena Stats... 📊</h2>
      </div>
    );
  }

  const solvedCount = dashboardData?.stats?.totalQuestionsSolved || 0;
  const currentLPA = 3.5 + (solvedCount * 0.5);

  let currentTier = "Service Based";
  let tierColor = "#64748b";
  
  if (currentLPA >= 15) {
    currentTier = "FAANG / HFT";
    tierColor = "#8b5cf6";
  } else if (currentLPA >= 7) {
    currentTier = "Product Based";
    tierColor = "#f59e0b";
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b' }}>🚀 AdaptPrep Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Track your placement journey in real-time</p>
        </div>
        <button 
          onClick={() => navigate('/interview')}
          style={{ background: '#10b981', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
        >
          ⚔️ Enter Arena
        </button>
      </header>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: 1, padding: '25px', background: '#fff', borderRadius: '12px', border: `2px solid ${tierColor}`, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '16px', textTransform: 'uppercase' }}>Current Tier</h3>
          <p style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: tierColor }}>
            {currentTier}
          </p>
        </div>
        
        <div style={{ flex: 1, padding: '25px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '16px', textTransform: 'uppercase' }}>Current Package</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            {currentLPA.toFixed(1)} LPA
          </p>
        </div>
        
        <div style={{ flex: 1, padding: '25px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '16px', textTransform: 'uppercase' }}>Questions Solved</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
            {solvedCount}
          </p>
        </div>
      </div>

      <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>📜 Recent Interview Activity</h3>
      
      {dashboardData?.history && dashboardData.history.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {[...dashboardData.history].reverse().map((item, index) => (
            <div key={index} style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#334155' }}>
                  Topic ID: {item.questionId || 'AI Generated Code'}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                  Reward: {item.reward || 0}
                </span>
                <span style={{ 
                  background: item.isSolved ? '#dcfce7' : '#fee2e2', 
                  color: item.isSolved ? '#166534' : '#991b1b', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {item.isSolved ? 'Cleared ✅' : 'Failed ❌'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#f8fafc', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '20px' }}>
          <h3 style={{ color: '#64748b', margin: '0 0 10px 0' }}>No interview history found.</h3>
          <p style={{ color: '#94a3b8', margin: 0 }}>Click on 'Enter Arena' to start your first tech round!</p>
        </div>
      )}
    </div>
  );
}