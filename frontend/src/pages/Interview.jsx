
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const boilerplate = {
  javascript: '// Write your optimized code here...\n\nfunction solve() {\n  \n}',
  python: '# Write your optimized code here...\n\ndef solve():\n    pass',
  cpp: '// Write your optimized code here...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
  java: '// Write your optimized code here...\nclass Solution {\n    public void solve() {\n        \n    }\n}'
};

export default function Interview() {
  const [question, setQuestion] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState(''); 
  
  // 🔄 NAYA STATE: Round Type
  const [roundType, setRoundType] = useState('coding'); // 'coding' or 'behavioral'
  
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(boilerplate['javascript']); 
  
  const [verbalAnswer, setVerbalAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null); 

  const [aiFeedback, setAiFeedback] = useState(null); 
  const [isEvaluating, setIsEvaluating] = useState(false); 

  const navigate = useNavigate();

  // 1. BUG 1 FIX: Missing Language Change Handler
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(boilerplate[selectedLang] || '');
  };

  // 2. BUG 2 FIX: Google OAuth Token Extraction & Clean URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      // URL se token hata do taaki refresh karne par issue na aaye
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    startInterview("Data Structures"); // Default topic
  }, []);

  const startInterview = async (selectedTopic) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      
      setQuestion(null);
      setAiFeedback(null);
      
      const response = await axios.post('http://localhost:5000/api/interview/next-question', 
        { topic: selectedTopic, previousAnswerContext: "" }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setQuestion({
        text: response.data.questionText,
        topic: response.data.topic || selectedTopic,
        difficulty: "AI Adapted"
      });
    } catch (error) {
      setQuestion({
        text: roundType === 'behavioral' 
          ? "Fallback: Tell me about a time you showed leadership in a team project." 
          : "Fallback: Write a function to reverse a linked list.",
        topic: roundType === 'behavioral' ? "Behavioral" : "Linked List",
        difficulty: "Medium"
      });
    }
  };

  const handleRoundChange = (type) => {
    setRoundType(type);
    if(type === 'behavioral') {
      startInterview("Behavioral & Leadership");
    } else {
      startInterview("Data Structures");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { alert("Use Google Chrome for voice."); return; }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; 

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setVerbalAnswer(currentTranscript); 
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    
    // Agar coding round hai toh Code bhejo, warna sirf Voice explanation bhejo
    const finalAnswer = roundType === 'coding' 
      ? `CODE:\n${code}` 
      : `VERBAL ANSWER:\n${verbalAnswer}`;

    try {
      const token = localStorage.getItem('token');
      const evalResponse = await axios.post('http://localhost:5000/api/interview/evaluate', {
        topic: question.topic,
        questionText: question.text,
        userAnswer: finalAnswer, 
        language: roundType === 'coding' ? language : 'spoken-english'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAiFeedback(evalResponse.data.evaluation);
    } catch (error) {
      alert("Failed to evaluate.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!question && !aiFeedback) return (<div style={{ textAlign: 'center', marginTop: '100px' }}><h2 style={{ color: '#3b82f6' }}>AI is preparing the round... 🧠</h2></div>);

  // FEEDBACK SCREEN (Usi tarah rahega)
  if (aiFeedback) return (
    <div className="card dashboard-card" style={{ maxWidth: '800px', margin: '20px auto', padding: '30px' }}>
      <h2 style={{ color: aiFeedback.isCorrect ? '#10b981' : '#ef4444' }}>{aiFeedback.isCorrect ? '✅ Nailed It!' : '❌ Needs Improvement'}</h2>
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ color: '#1e293b', marginBottom: '10px' }}>AI Interviewer's Feedback:</h4>
        <p style={{ lineHeight: '1.6', fontSize: '16px' }}>{aiFeedback.feedback}</p>
      </div>
      <button className="btn-success" onClick={() => startInterview(question.topic)} style={{ marginTop: '20px', width: '100%', padding: '15px' }}>Next Question 🚀</button>
    </div>
  );

  return (
    <div className="card dashboard-card" style={{ maxWidth: '1000px', margin: '20px auto' }}>
      
      {/* 🔄 NAYA ROUND TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => handleRoundChange('coding')} 
          style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: roundType === 'coding' ? '#3b82f6' : '#e2e8f0', color: roundType === 'coding' ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer' }}
        >
          💻 Coding Round
        </button>
        <button 
          onClick={() => handleRoundChange('behavioral')} 
          style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: roundType === 'behavioral' ? '#8b5cf6' : '#e2e8f0', color: roundType === 'behavioral' ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🗣️ HR / Behavioral Round
        </button>
      </div>

      <div className="question-box" style={{ marginBottom: '20px' }}>
        <span className="tag">{question?.topic}</span>
        <p style={{ fontSize: '18px', fontWeight: '500', marginTop: '10px' }}>{question?.text}</p>
      </div>

      {/* CONDITIONAL RENDERING: Agar Coding round hai tabhi Editor dikhega */}
      {roundType === 'coding' && (
        <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', background: '#1e1e1e', padding: '5px' }}>
            <select value={language} onChange={handleLanguageChange} style={{ background: '#333', color: 'white', border: 'none', padding: '5px' }}>
              <option value="javascript">JavaScript</option><option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option>
            </select>
          </div>
          <Editor height="100%" language={language} theme="vs-dark" value={code} onChange={setCode} options={{ minimap: { enabled: false } }} />
        </div>
      )}

      {/* CONDITIONAL RENDERING: Agar Behavioral round hai toh bada Voice box dikhega */}
      {roundType === 'behavioral' && (
        <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '2px dashed #8b5cf6', textAlign: 'center' }}>
          <h3 style={{ color: '#6d28d9', marginBottom: '15px' }}>🎙️ Speak Your Answer</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>The AI will evaluate your communication, tone, and situation handling skills.</p>
          
          <button 
            onClick={toggleRecording}
            style={{ background: isRecording ? '#ef4444' : '#8b5cf6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            {isRecording ? '🛑 Stop Recording' : '🎤 Start Speaking'}
          </button>
          
          <textarea 
            value={verbalAnswer} onChange={(e) => setVerbalAnswer(e.target.value)}
            placeholder="Your transcribed answer will appear here..."
            style={{ width: '100%', height: '120px', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', marginTop: '20px' }}
          />
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-success" onClick={handleSubmit} disabled={isEvaluating} style={{ padding: '12px 24px', fontSize: '16px' }}>
          {isEvaluating ? 'Evaluating... 🤔' : '🚀 Submit Answer'}
        </button>
      </div>
    </div>
  );
}