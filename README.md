# AI-Powered Todo List

A modern, feature-rich todo list application with Claude AI integration, PWA support, and MongoDB backend.

## Features

- ✅ **Full CRUD Operations** - Create, read, update, and delete todos
- 🤖 **Claude AI Integration** - Get practical task briefs and continue conversations in separate threads
- 📱 **PWA Support** - Install on your phone as a native app
- 🔔 **Smart Reminders** - Date/time-based notifications
- 🎯 **Status & Priority** - Track progress with statuses and priorities
- 🔗 **URL Management** - Attach relevant links to tasks
- 💾 **MongoDB Storage** - Free tier MongoDB Atlas integration
- 🚀 **Vercel Deployment** - One-click deployment

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Click "Connect" and get your connection string
5. Add your connection string to `.env.local`

### 3. Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Create a new API key
3. Add it to `.env.local`

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todolist?retryWrites=true&w=majority
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Option 2: Manual Deploy

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `ANTHROPIC_API_KEY`

## PWA Installation

### On Mobile (iOS/Android)

1. Open the app in your browser
2. Tap the share/menu button
3. Select "Add to Home Screen"
4. The app will now work like a native app!

### On Desktop

1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install"

## How to Use

### Create a Todo

1. Click "Add New Todo"
2. Fill in the details:
   - **Title** (required)
   - **Description** (optional)
   - **Status** - pending, in-progress, or completed
   - **Priority** - low, medium, or high
   - **Due Date** - when the task should be completed
   - **Reminder** - when to receive a notification
   - **URLs** - related links (one per line)
   - **AI Checkbox** - enable Claude to generate a practical task brief

### Claude AI Integration

When you enable AI for a task:
- Claude automatically generates a practical, concise brief on how to accomplish the task
- A separate conversation thread is created for that specific task
- You can continue the conversation by clicking "Open Claude Thread"
- Each task has its own isolated thread for focused discussions

### Notifications

- Grant notification permission when prompted
- Set reminder dates/times on tasks
- Receive browser notifications at the scheduled time
- Works even when the app is in the background (PWA)

## Project Structure

```
todolist/
├── app/
│   ├── api/
│   │   ├── todos/          # CRUD endpoints for todos
│   │   └── claude/         # Claude AI integration
│   ├── layout.tsx          # Root layout with PWA meta
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── TodoList.tsx        # Main todo list component
│   ├── TodoForm.tsx        # Form to create todos
│   ├── TodoItem.tsx        # Individual todo item
│   └── ClaudeThread.tsx    # Claude conversation thread
├── lib/
│   ├── mongodb.ts          # MongoDB connection
│   ├── types.ts            # TypeScript types
│   └── notifications.ts    # Notification system
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/              # PWA icons
└── next.config.js          # Next.js + PWA config
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **AI**: Anthropic Claude API
- **PWA**: @ducanh2912/next-pwa
- **Deployment**: Vercel

## MongoDB Collections

### todos
```javascript
{
  _id: ObjectId,
  title: string,
  description: string,
  status: 'pending' | 'in-progress' | 'completed',
  priority: 'low' | 'medium' | 'high',
  dueDate: Date,
  reminderDate: Date,
  urls: string[],
  aiEnabled: boolean,
  claudeThreadId: string,
  claudeBrief: string,
  createdAt: Date,
  updatedAt: Date
}
```

### threads
```javascript
{
  _id: ObjectId,
  todoId: ObjectId,
  messages: [
    { role: 'user' | 'assistant', content: string }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Notes

- PWA icons are placeholders - replace `/public/icon-192x192.png` and `/public/icon-512x512.png` with your own
- Notifications require user permission and HTTPS (works in development on localhost)
- MongoDB Atlas free tier includes 512MB storage
- Claude API calls are metered - check your usage at [Anthropic Console](https://console.anthropic.com/)

## License

ISC
