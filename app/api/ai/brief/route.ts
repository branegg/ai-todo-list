import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Todo } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { todoId } = await req.json();

    const db = await getDatabase();
    const todo = await db.collection<Todo>('todos').findOne({ _id: new ObjectId(todoId) });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Create a new conversation thread
    const threadId = new ObjectId().toString();

    // Build context for AI
    let prompt = `I need a practical, concise brief on how to accomplish this task:\n\nTitle: ${todo.title}`;

    if (todo.description) {
      prompt += `\nDescription: ${todo.description}`;
    }

    if (todo.urls && todo.urls.length > 0) {
      prompt += `\nRelated URLs: ${todo.urls.join(', ')}`;
    }

    prompt += `\n\nProvide a brief, actionable plan (3-5 steps max) on how to accomplish this task. Be practical and concise. Respond in the same language as the task title and description.`;

    let brief = '';
    const provider = todo.aiProvider || 'claude';

    console.log('Todo aiProvider:', todo.aiProvider);
    console.log('Using provider:', provider);

    if (provider === 'gpt') {
      // Use OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      brief = response.choices[0]?.message?.content || '';
    } else {
      // Use Claude
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20250929',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      brief = message.content[0].type === 'text' ? message.content[0].text : '';
    }

    // Store the thread in database
    await db.collection('threads').insertOne({
      _id: new ObjectId(threadId),
      todoId: new ObjectId(todoId),
      provider,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: brief },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ brief, threadId });
  } catch (error) {
    console.error('Error generating brief:', error);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}
