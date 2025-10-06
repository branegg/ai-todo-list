import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
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

    const provider = thread.provider || 'claude';
    let assistantMessage = '';

    if (provider === 'gpt') {
      // Build conversation history for OpenAI
      const messages = thread.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add new user message
      messages.push({
        role: 'user',
        content: message,
      });

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 2048,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant helping with task: "${todo?.title}". Provide practical, concise advice. Keep responses brief and actionable.`,
          },
          ...messages,
        ],
      });

      assistantMessage = response.choices[0]?.message?.content || '';
    } else {
      // Build conversation history for Claude
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
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20250929',
        max_tokens: 2048,
        system: `You are a helpful assistant helping with task: "${todo?.title}". Provide practical, concise advice. Keep responses brief and actionable.`,
        messages: messages,
      });

      assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';
    }

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
          } as any,
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
