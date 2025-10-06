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
  claudeThreadId?: string;
  claudeBrief?: string;
  createdAt: Date;
  updatedAt: Date;
}
