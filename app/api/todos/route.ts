import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Todo } from '@/lib/types';

export async function GET() {
  try {
    const db = await getDatabase();
    const todos = await db.collection<Todo>('todos')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const newTodo: Omit<Todo, '_id'> = {
      title: body.title,
      description: body.description || '',
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      reminderDate: body.reminderDate ? new Date(body.reminderDate) : undefined,
      urls: body.urls || [],
      aiEnabled: body.aiEnabled || false,
      aiProvider: body.aiProvider,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Todo>('todos').insertOne(newTodo as Todo);
    const todo = await db.collection<Todo>('todos').findOne({ _id: result.insertedId });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
