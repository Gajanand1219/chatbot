

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get("https://chatbot-backend-th1d.onrender.com/api/sessions");
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchSession = async (sessionId) => {
    try {
      const response = await axios.get(`https://chatbot-backend-th1d.onrender.com/api/session/${sessionId}`);
      setCurrentSession(response.data);
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
  
    setIsTyping(true);
    try {
      const response = await axios.post("https://chatbot-backend-th1d.onrender.com/api/chat", {
        message: message,
        session_id: currentSession?.id
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      setCurrentSession({
        id: response.data.session_id,
        title: message.slice(0, 300) + (message.length > 30 ? "..." : ""),
        messages: response.data.messages
      });
      setMessage("");
      fetchSessions(); // Refresh session list
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          messages: [
            ...currentSession.messages,
            {
              sender: "bot",
              text: "Error: Could not get response from server",
              timestamp: new Date().toISOString()
            }
          ]
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const createNewChat = () => {
    setCurrentSession(null);
    setMessage("");
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`https://chatbot-backend-th1d.onrender.com/api/session/${sessionId}`);
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(null);
      }
      fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  

  return (
    
    <div className="app-container">
      {/* Sidebar */}
      
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            + New chat
          </button>
          <button 
            className="toggle-sidebar" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "◄" : "►"}
          </button>
        </div>
        
        <div className="session-list">
  {sessions.map((session) => (
    <div 
      key={session.id} 
      className={`session-item ${currentSession?.id === session.id ? "active" : ""}`}
      onClick={() => fetchSession(session.id)}
    >
      <div className="session-content">
        <span className="session-icon">💬</span>
        <div className="session-details">
          <div className="session-title">{session.title}</div>
          <div className="session-preview">{session.preview}</div>
        </div>
      </div>
      <button 
        className="delete-btn"
        onClick={(e) => { deleteSession(session.id);}}
      >
        🗑️
      </button>
    </div>
  ))}
</div>
      </div>

      {/* Main Chat Area */}
      <div className="main-content">
        {currentSession ? (
          <>
            <div className="chat-container">
              {currentSession.messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-avatar">
                    {msg.sender === "user" ? "👤" : "🤖"}
                  </div>
                  <div className="message-content">
                    {msg.text.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot typing-indicator">
                  <div className="message-avatar">🤖</div>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            <div className="input-area">
              <div className="input-container">
                <textarea
                  placeholder="Message ChatGPT..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!message.trim() || isTyping}
                  className="send-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
            </div>
          </>
        ) : (
          <div className="welcome-screen">
            <h1>AI Chatbot</h1>
            <div className="capabilities">
              <div className="capability-card">
                <div className="icon">🔍</div>
                <h3>Search</h3>
                <p>Find information across the web</p>
              </div>
              <div className="capability-card">
                <div className="icon">✍️</div>
                <h3>Write For Me</h3>
                <p>Generate content for any purpose</p>
              </div>
              <div className="capability-card">
                <div className="icon">❓</div>
                <h3>Ask me anything</h3>
                <p> I'll do my best to help.Try asking:</p>
              </div>
            </div>
            <div className="input-area">
              <div className="input-container">
                <textarea
                  placeholder="Ask anything"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!message.trim() || isTyping}
                  className="send-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
