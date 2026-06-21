import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const AIChatWidget = ({ queueState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm the Clinic Assistant. How can I help you today?", isBot: true }
  ]);
  const messagesEndRef = useRef(null);

  const predefinedQuestions = [
    {
      id: 1,
      text: "How do I join the queue?",
      answer: "You can join the queue by generating a token directly from the Live Queue page. Simply enter your name and phone number."
    },
    {
      id: 2,
      text: "What are the clinic hours?",
      answer: "The clinic is open from 9:00 AM to 5:00 PM, Monday to Friday."
    },
    {
      id: 3,
      text: "How many people are ahead of me?",
      answer: (state) => `There are currently ${state?.waitingTokens?.length || 0} people waiting in the queue.`
    },
    {
      id: 4,
      text: "What if I miss my turn?",
      answer: "If you miss your turn, please inform the receptionist upon arrival. They can re-add you to the queue."
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleQuestionClick = (q) => {
    // Add user question
    setMessages(prev => [...prev, { text: q.text, isBot: false }]);
    
    // Simulate slight delay for bot answer
    setTimeout(() => {
      const responseText = typeof q.answer === 'function' ? q.answer(queueState) : q.answer;
      setMessages(prev => [...prev, { text: responseText, isBot: true }]);
    }, 500);
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window fade-in">
          <div className="chat-header">
            <div className="chat-header-title">
              <MessageSquare size={18} />
              <span>Clinic Assistant</span>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-area">
            <div className="chat-chips-container">
              {predefinedQuestions.map(q => (
                <button 
                  key={q.id} 
                  className="chat-chip"
                  onClick={() => handleQuestionClick(q)}
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button 
          className="chat-toggle-btn bounce-in"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
