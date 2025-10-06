import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { threadId, todoId, message } = await req.json();

    const db = await getDatabase();

    // Get the thread
    const thread = await db.collection('threads').findOne({ _id: new ObjectId(threadId) });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Get the todo for context
    const todo = await db.collection('todos').findOne({ _id: new ObjectId(todoId) });

    // Build conversation history
    const messages = thread.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add new user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Claude
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: `You are a helpful assistant helping with task: "${todo?.title}". Provide practical, concise advice. Keep responses brief and actionable.`,
      messages: messages,
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    // Update thread with new messages
    await db.collection('threads').updateOne(
      { _id: new ObjectId(threadId) },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: message },
              { role: 'assistant', content: assistantMessage },
            ],
          },
        },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
