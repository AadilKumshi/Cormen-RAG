import { useState, useRef, useEffect } from 'react'
import './App.css'
import Answer from './components/Answer'

const API_URL = 'http://127.0.0.1:8000';

const suggestionTopics = [
  'Asymptotic Notations',
  'Merge Sort',
  'Linked Lists',
  'Recursion',
  'Dynamic Programming'
];


const UserIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  )
}

const BotIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-icon lucide-bot"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
  )
}
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const sendMessage = async (query) => {
    const trimmedQuery = query || input.trim();

    if (!trimmedQuery || isLoading) return;

    // Hide welcome screen
    if (showWelcome) {
      setShowWelcome(false);
    }

    // Add user message
    const userMessage = { type: 'user', content: trimmedQuery };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Set loading state
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: trimmedQuery,
          k: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage = {
        type: 'assistant',
        content: data.answer,
        sources: data.sources
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please make sure the server is running and try again.',
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <header className="top-bar">
        <div className="user-profile"></div>
      </header>

      {showWelcome && messages.length === 0 ? (
        <div className="welcome-container">
          <h1 className="greeting-text">
            <span className="gradient-text">Hello!</span>
          </h1>
          <h2 className="sub-greeting">What do you need help in?</h2>

          <div className="suggestions-container">
            {suggestionTopics.map((topic, index) => (
              <div
                key={index}
                className="suggestion-card"
                onClick={() => handleSuggestionClick(topic)}
              >
                {topic}
              </div>
            ))}
          </div>

          <div className="input-container">
            <div className="input-box">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your question here"
                disabled={isLoading}
              />
              <span
                className="material-symbols-outlined send-icon"
                onClick={() => sendMessage()}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
              >
                send
              </span>
            </div>
            <p className="disclaimer">
              Agent may display inaccurate info, including about people, so double-check its responses.
            </p>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className={`message-avatar ${message.type}-avatar`}>
                  {message.type === 'user' ? <UserIcon /> : <BotIcon />}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {message.type === 'assistant' ? (
                      <Answer text={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="sources-section">
                      <div className="sources-title">📖 Sources from CLRS</div>
                      <div className="sources-list">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="source-item">
                            <strong>Page {source.page}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message assistant-message">
                <div className="message-avatar assistant-avatar">🤖</div>
                <div className="message-content">
                  <div className="loading-indicator">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-box-chat">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your question here"
                rows="1"
                disabled={isLoading}
              />
              <span
                className="material-symbols-outlined send-icon-chat"
                onClick={() => sendMessage()}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
              >
                send
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
