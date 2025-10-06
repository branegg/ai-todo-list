'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/lib/types';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { scheduleNotification } from '@/lib/notifications';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    fetchTodos();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    // Schedule notifications for all todos with reminder dates
    todos.forEach(todo => {
      if (todo.reminderDate) {
        scheduleNotification(
          `Reminder: ${todo.title}`,
          todo.description || 'Task reminder',
          new Date(todo.reminderDate)
        );
      }
    });
  }, [todos]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todo: Omit<Todo, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      });
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);

      // If AI is enabled, generate brief
      if (todo.aiEnabled) {
        generateAIBrief(newTodo);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedTodo = await res.json();
      setTodos(todos.map(t => t._id?.toString() === id ? updatedTodo : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t._id?.toString() !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const generateAIBrief = async (todo: Todo) => {
    try {
      const res = await fetch('/api/claude/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId: todo._id?.toString() }),
      });
      const data = await res.json();

      // Update todo with brief and thread ID
      await updateTodo(todo._id!.toString(), {
        claudeBrief: data.brief,
        claudeThreadId: data.threadId,
      });
    } catch (error) {
      console.error('Error generating AI brief:', error);
    }
  };

  const filteredTodos = filter === 'all'
    ? todos
    : todos.filter(t => t.status === filter);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Todo List</h1>

      <TodoForm onAdd={addTodo} />

      <div className="flex gap-2 mb-4 mt-6">
        {(['all', 'pending', 'in-progress', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTodos.map(todo => (
          <TodoItem
            key={todo._id?.toString()}
            todo={todo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
          />
        ))}
      </div>

      {filteredTodos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No todos found. Create one to get started!
        </div>
      )}
    </div>
  );
}
