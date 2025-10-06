'use client';

import { useState } from 'react';
import { Todo } from '@/lib/types';
import ClaudeThread from './ClaudeThread';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showThread, setShowThread] = useState(false);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed') => {
    onUpdate(todo._id!.toString(), { status: newStatus });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{todo.title}</h3>
            {todo.aiEnabled && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                AI
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded ${statusColors[todo.status]}`}>
              {todo.status}
            </span>
            {todo.priority && (
              <span className={`text-xs px-2 py-1 rounded ${priorityColors[todo.priority]}`}>
                {todo.priority}
              </span>
            )}
          </div>

          {todo.dueDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Due: {new Date(todo.dueDate).toLocaleString()}
            </p>
          )}

          {todo.reminderDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Reminder: {new Date(todo.reminderDate).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
          <button
            onClick={() => onDelete(todo._id!.toString())}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t pt-3 dark:border-gray-700">
          {todo.description && (
            <div>
              <h4 className="font-medium text-sm mb-1">Description:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{todo.description}</p>
            </div>
          )}

          {todo.urls && todo.urls.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-1">URLs:</h4>
              <ul className="list-disc list-inside text-sm">
                {todo.urls.map((url, idx) => (
                  <li key={idx}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {todo.claudeBrief && (
            <div>
              <h4 className="font-medium text-sm mb-1">Claude's Brief:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                {todo.claudeBrief}
              </p>
              {todo.claudeThreadId && (
                <button
                  onClick={() => setShowThread(!showThread)}
                  className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {showThread ? 'Hide' : 'Open'} Claude Thread
                </button>
              )}
            </div>
          )}

          <div>
            <h4 className="font-medium text-sm mb-2">Update Status:</h4>
            <div className="flex gap-2">
              {(['pending', 'in-progress', 'completed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded text-sm ${
                    todo.status === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showThread && todo.claudeThreadId && (
        <div className="mt-4 border-t pt-4 dark:border-gray-700">
          <ClaudeThread todoId={todo._id!.toString()} threadId={todo.claudeThreadId} />
        </div>
      )}
    </div>
  );
}
