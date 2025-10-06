'use client';

import { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeThreadProps {
  todoId: string;
  threadId: string;
}

export default function ClaudeThread({ todoId, threadId }: ClaudeThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [threadId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/ai/thread/${threadId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          todoId,
          message: input,
        }),
      });

      const data = await res.json();
      setMessages([...messages, userMessage, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h3 className="font-semibold mb-3">AI Conversation</h3>

      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded ${
              msg.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900 ml-8'
                : 'bg-purple-100 dark:bg-purple-900 mr-8'
            }`}
          >
            <p className="text-xs font-medium mb-1">
              {msg.role === 'user' ? 'You' : 'AI'}
            </p>
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask AI anything about this task..."
          className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 text-sm"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
