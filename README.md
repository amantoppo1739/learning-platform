# Synta — AI-Powered Programming Tutor

An interactive AI-powered tutor (Groq Llama 3.3) for learning programming through AI chat, curated videos, and generated quizzes.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI (Radix Primitives)
- **AI:** Vercel AI SDK + Groq (Llama 3.3 70B)
- **Videos:** YouTube Data API v3

## 📁 Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── api/             # API routes (NextAuth, Chat, Quiz)
│   ├── dashboard/       # User dashboard
│   ├── learn/           # Learning interface
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/
│   └── ui/              # Shadcn UI components
├── lib/
│   ├── db.ts            # Database connection
│   ├── schema.ts        # Drizzle schema
│   └── utils.ts         # Utility functions
├── drizzle/             # Database migrations (auto-generated)
└── drizzle.config.ts    # Drizzle configuration
```

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required credentials:
- **DATABASE_URL**: Get from [Neon](https://neon.tech) (free tier available)
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **GROQ_API_KEY**: Get from [Groq Console](https://console.groq.com/) (Llama 3.3)
- **YouTube API Key**: Get from [Google Cloud Console](https://console.cloud.google.com)
- **OAuth Credentials**: Set up Google/GitHub OAuth apps

### 3. Set Up Database

Push the schema to your Neon database:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The app uses the following main tables:

- **users**: User accounts (NextAuth)
- **accounts**: OAuth provider data (NextAuth)
- **sessions**: User sessions (NextAuth)
- **learning_paths**: Track learning progress per language
- **chat_sessions**: Save AI chat conversations
- **quiz_results**: Store quiz attempts and scores

## 🎨 UI Design Philosophy

This project follows a **"Linear-style" / Engineered Elegance** design:

- Dark mode by default (Zinc-950 background)
- Geist Sans typography for optimal readability
- Subtle borders (`border-white/10`)
- Smooth animations with Framer Motion
- Skeleton loaders (no spinners)
- Active button feedback (`active:scale-95`)

## 🔑 Key Features (Status)

- ✅ Phase 1: Project setup with Neon + Drizzle
- ✅ Phase 2: NextAuth with Google/GitHub
- ✅ Phase 3: AI Chat with streaming responses
- ✅ Phase 4: YouTube video integration
- ✅ Phase 5: Quiz generation and tracking
- ✅ Phase 6: User dashboard and progress tracking

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio (GUI)
```

## 🤝 Contributing

This is a learning platform project. Feel free to fork and customize for your needs!

## 📄 License

MIT

