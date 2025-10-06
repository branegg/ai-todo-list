import { ObjectId } from 'mongodb';

export interface Todo {
  _id?: ObjectId;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  reminderDate?: Date;
  urls?: string[];
  aiEnabled: boolean;
  aiProvider?: 'claude' | 'gpt';
  threadId?: string;
  aiBrief?: string;
  createdAt: Date;
  updatedAt: Date;
}
