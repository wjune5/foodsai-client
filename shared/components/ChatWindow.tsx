import React, { useState, useRef, useEffect } from 'react';
import { Maximize, Minimize, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChatMessage {
  text: string;
  role: 'user' | 'bot';
}
interface ChatWindowProps {
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (msg: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, messages, onSend }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend(input);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className={`card-cute overflow-hidden relative flex flex-col`}
      style={{
        height: collapsed
          ? '40vh'
          : 'min(72vh, 480px)', // 70vh or max 480px, whichever is smaller
        minHeight: collapsed ? '40vh' : '320px', // reasonable min height
        maxHeight: collapsed ? '40vh' : '80vh', // don't let it get too tall
      }}
    >
      <div className="flex justify-between items-center p-3 border-b">
        <span className="font-semibold">{t('chat.title')}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-gray-500 hover:text-pink-500 text-lg"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-pink-500 text-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        className="flex-1 p-3 overflow-y-auto space-y-2"
        style={{
          minHeight: collapsed ? '0' : '32vh',
          maxHeight: collapsed
            ? 'calc(40vh - 56px - 56px)' // 40vh minus header/footer
            : 'calc(100% - 56px - 56px)', // header/footer approx 56px each
        }}
      >
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">{t('chat.content')}</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="flex items-end mr-2">
                  <span className="inline-block w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-pink-700 font-bold">🤖</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2 shadow
                  ${msg.role === 'user'
                    ? 'bg-pink-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  } max-w-[70%] break-words`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="flex items-end ml-2">
                  <span className="inline-block w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white font-bold">🧑</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] bg-gray-50 absolute bottom-0 left-0 right-0 w-full">
        <input
          ref={inputRef}
          type="text"
          className="w-full border rounded px-2 py-1"
          placeholder={t('chat.placeholder')}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
      </div>
    </div>
  );
};

export default ChatWindow; 