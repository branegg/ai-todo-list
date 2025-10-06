'use client';

import { useState } from 'react';
import { Todo } from '@/lib/types';

interface TodoFormProps {
  onAdd: (todo: Omit<Todo, '_id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [urls, setUrls] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState<'claude' | 'gpt'>('claude');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const urlArray = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    onAdd({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
      urls: urlArray,
      aiEnabled,
      aiProvider: aiEnabled ? aiProvider : undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
    setDueDate('');
    setReminderDate('');
    setUrls('');
    setAiEnabled(false);
    setAiProvider('claude');
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 font-medium"
        >
          + Add New Todo
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
          <div>
            <input
              type="text"
              placeholder="Todo title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reminder</label>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URLs (one per line)</label>
            <textarea
              placeholder="https://example.com"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="aiEnabled"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="aiEnabled" className="ml-2 text-sm font-medium">
                Enable AI to generate task brief
              </label>
            </div>

            {aiEnabled && (
              <div className="ml-6 flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="claude"
                    checked={aiProvider === 'claude'}
                    onChange={(e) => setAiProvider(e.target.value as 'claude' | 'gpt')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="ml-2 text-sm">Claude (Anthropic)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="gpt"
                    checked={aiProvider === 'gpt'}
                    onChange={(e) => setAiProvider(e.target.value as 'claude' | 'gpt')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="ml-2 text-sm">GPT-4 (OpenAI)</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Todo
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
