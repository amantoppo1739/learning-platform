# Synta — AI-Powered Programming Learning Platform

A full-stack web application that provides an interactive AI-powered tutoring experience for learning programming languages. Built with Next.js, TypeScript, and deployed on Vercel, featuring real-time AI chat, automated quiz generation, video integration, and comprehensive progress tracking.

**Live Demo:** https://synta.vercel.app

---

## 🎯 Project Overview

Synta is a modern, production-ready learning platform that combines AI-powered tutoring with interactive learning tools. The platform supports **12 programming languages**, provides personalized learning experiences through AI chat, generates quizzes dynamically, integrates educational videos, and tracks user progress comprehensively.

### Key Highlights

- **AI-Powered Tutoring**: Real-time streaming chat with Groq's Llama 3.1 8B model
- **12 Programming Languages**: Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin
- **Automated Quiz Generation**: AI-generated quizzes with instant feedback
- **Video Integration**: Curated YouTube tutorials for each topic
- **Progress Tracking**: Comprehensive dashboard with analytics and streaks
- **Production Ready**: Fully deployed with CI/CD, database migrations, and monitoring

---

## ✨ Features & Functionalities

### 1. **AI-Powered Chat Interface**
- **Real-time Streaming**: Server-sent events for instant AI responses
- **Language-Specific Tutors**: Custom system prompts for each programming language
- **Code Formatting**: Syntax-highlighted code blocks with markdown rendering
- **Context Management**: Intelligent message trimming to stay within token limits
- **Auto-save**: Automatic chat session persistence to database
- **Chat History**: View and resume previous conversations

### 2. **Interactive Quiz System**
- **AI-Generated Questions**: Dynamic quiz creation based on topics
- **Multiple Choice Format**: User-friendly question interface
- **Instant Feedback**: Immediate results with explanations
- **Score Tracking**: Persistent storage of quiz results
- **Performance Analytics**: Track accuracy and improvement over time

### 3. **Video Learning Integration**
- **YouTube API Integration**: Curated educational videos for each topic
- **Topic-Based Recommendations**: Relevant videos based on learning context
- **Video Carousel**: Easy browsing and selection interface
- **Activity Logging**: Track video watch history

### 4. **User Dashboard & Analytics**
- **Progress Overview**: Visual statistics for chats, quizzes, and videos
- **Language Tracking**: Monitor progress across multiple programming languages
- **Activity Timeline**: Recent activity feed with timestamps
- **Streak Tracking**: Daily activity streaks to encourage consistent learning
- **Performance Metrics**: Quiz scores, completion rates, and learning velocity
- **Recommendations**: AI-powered suggestions for next learning steps

### 5. **Authentication & User Management**
- **OAuth Integration**: Sign in with Google or GitHub
- **Session Management**: Secure JWT-based authentication with NextAuth.js v5
- **User Profiles**: Persistent user data and preferences
- **Protected Routes**: Middleware-based route protection

### 6. **Database & Data Persistence**
- **PostgreSQL Database**: Serverless Neon PostgreSQL for scalability
- **ORM Integration**: Type-safe database queries with Drizzle ORM
- **Migration System**: Version-controlled database schema changes
- **Data Models**: User accounts, chat sessions, quiz results, and activity logs

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.1
- **Styling**: Tailwind CSS 3.4.1
- **Components**: Shadcn/UI (Radix Primitives)
- **Icons**: Lucide React
- **Markdown**: React Markdown with syntax highlighting

### Backend
- **Runtime**: Node.js 20+
- **API Routes**: Next.js API Routes (Serverless Functions)
- **Authentication**: NextAuth.js v5 (OAuth 2.0)
- **AI Integration**: Vercel AI SDK 6.0.64
- **AI Model**: Groq (Llama 3.1 8B Instant)

### Database
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM 0.45.1
- **Migrations**: Drizzle Kit 0.31.8
- **Connection**: @neondatabase/serverless

### DevOps & Infrastructure
- **Deployment**: Vercel (Serverless Functions)
- **CI/CD**: GitHub Actions
- **Container Registry**: GitHub Container Registry (GHCR)
- **Security Scanning**: Trivy (SARIF integration)
- **Infrastructure as Code**: Terraform (AWS ECS Fargate ready)
- **Containerization**: Docker (multi-stage builds)

### External APIs
- **AI**: Groq API (Llama 3.1 8B)
- **Videos**: YouTube Data API v3
- **OAuth**: Google OAuth 2.0, GitHub OAuth

---

## 📁 Project Structure

```
learning-platform/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   └── signin/          # Sign-in page
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── chat/            # Chat API (save, history)
│   │   ├── quiz/            # Quiz generation and saving
│   │   ├── youtube/         # YouTube video search
│   │   └── activity/        # Activity logging
│   ├── dashboard/           # User dashboard
│   ├── learn/               # Learning interface
│   ├── profile/             # User profile
│   └── layout.tsx           # Root layout
├── components/
│   ├── auth/                # Authentication components
│   ├── chat/                # Chat interface components
│   ├── quiz/                # Quiz components
│   ├── video/               # Video carousel
│   └── ui/                  # Shadcn UI components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                 # Database connection
│   ├── schema.ts             # Drizzle schema definitions
│   └── utils.ts              # Utility functions
├── drizzle/                  # Database migrations
├── infra/                    # Terraform infrastructure
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Local development setup
└── SETUP.md                  # Detailed setup guide
```

---

## 🛠️ Setup Instructions

For the full guide (setup, development, deployment, Docker, CI/CD, Terraform, observability), see **[SETUP.md](./SETUP.md)**.

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
- **GROQ_API_KEY**: Get from [Groq Console](https://console.groq.com/) (Llama 3.1 8B)
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

### 5. Run with Docker (optional)

For local dev parity with app + PostgreSQL in containers:

```bash
docker compose up --build
```

App: [http://localhost:3000](http://localhost:3000) · DB: `localhost:5432` (user: `synta`, db: `synta`). See `.env.example` for `DATABASE_URL` when using Docker.

---

## 📊 Database Schema

The application uses a PostgreSQL database with the following schema:

### Core Tables
- **`users`**: User accounts (NextAuth)
- **`accounts`**: OAuth provider data (Google, GitHub)
- **`sessions`**: User session management
- **`verification_tokens`**: Email verification tokens

### Application Tables
- **`chat_sessions`**: Saved AI chat conversations with full message history
- **`quiz_results`**: Quiz attempts, scores, and detailed question/answer data
- **`activity_log`**: Comprehensive activity tracking (chats, quizzes, videos)

### Key Features
- **Cascade Deletes**: Automatic cleanup of related data
- **Timestamps**: Created/updated tracking on all tables
- **JSON Storage**: Flexible JSONB columns for complex data structures
- **Indexes**: Optimized queries with proper indexing

---

## 🎨 UI Design Philosophy

This project follows a **"Linear-style" / Engineered Elegance** design:

- Dark mode by default (Zinc-950 background)
- Geist Sans typography for optimal readability
- Subtle borders (`border-white/10`)
- Smooth animations with Framer Motion
- Skeleton loaders (no spinners)
- Active button feedback (`active:scale-95`)

---

## 🎓 Supported Programming Languages

1. **Python** - Beginner-friendly, versatile for web, data science & AI
2. **JavaScript** - Essential for web development, runs in browsers
3. **TypeScript** - JavaScript with types, better for large projects
4. **Java** - Enterprise apps, Android development, robust
5. **C++** - High-performance systems, game development
6. **C#** - Microsoft stack, Unity game development, .NET
7. **Go** - Fast, concurrent, great for backend services
8. **Rust** - Memory-safe systems programming, blazing fast
9. **Ruby** - Elegant syntax, Rails framework for web apps
10. **PHP** - Server-side scripting, powers WordPress & Laravel
11. **Swift** - iOS/macOS app development, modern & safe
12. **Kotlin** - Modern Android development, concise Java alternative

Each language includes:
- Custom AI tutor with language-specific prompts
- Curated learning roadmaps
- Topic-based quiz generation
- Relevant video recommendations

---

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (zero warnings policy)
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Apply database migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

---

## 🚢 Deployment

### Current Deployment
- **Platform**: Vercel
- **Database**: Neon (Serverless PostgreSQL)
- **CDN**: Vercel Edge Network
- **Serverless Functions**: Next.js API routes

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Workflow Triggers**: 
  - Lint & build on every PR
  - Docker build, security scan, and push to GHCR on main/master
- **Security**: Trivy vulnerability scanning with SARIF upload
- **Container Registry**: GitHub Container Registry (GHCR)

### Infrastructure Options
- **Terraform**: Ready-to-deploy AWS ECS Fargate infrastructure
- **Docker**: Multi-stage container builds for production
- **Monitoring**: CloudWatch logs integration (AWS) or Vercel Analytics

---

## 📈 Key Technical Achievements

### Architecture & Design
- ✅ **Full-Stack TypeScript**: End-to-end type safety
- ✅ **Serverless Architecture**: Scalable serverless functions
- ✅ **Real-time Streaming**: Efficient SSE implementation for AI responses
- ✅ **Database Optimization**: Proper indexing and query optimization
- ✅ **Error Handling**: Comprehensive error boundaries and fallbacks

### Code Quality
- ✅ **Zero Linter Warnings**: Strict ESLint configuration
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Component Reusability**: Modular component architecture
- ✅ **API Design**: RESTful API routes with proper status codes

### DevOps & Infrastructure
- ✅ **CI/CD Pipeline**: Automated testing and deployment
- ✅ **Security Scanning**: Automated vulnerability detection
- ✅ **Database Migrations**: Version-controlled schema changes
- ✅ **Infrastructure as Code**: Terraform for AWS deployment
- ✅ **Containerization**: Production-ready Docker images

### Performance
- ✅ **Optimized Builds**: Next.js production optimizations
- ✅ **Code Splitting**: Automatic route-based code splitting
- ✅ **Image Optimization**: Next.js Image component
- ✅ **Caching**: Strategic caching for API responses

---

## 🔐 Security Features

- **OAuth 2.0**: Secure authentication with Google and GitHub
- **JWT Sessions**: Secure session management
- **Environment Variables**: Sensitive data in environment variables
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **CORS Protection**: Configured CORS policies
- **Rate Limiting**: Built-in Next.js rate limiting
- **Security Headers**: Next.js security headers

---

## 🤝 Contributing

This is a learning platform project. Feel free to fork and customize for your needs!

### Development Guidelines
- Follow TypeScript best practices
- Maintain zero ESLint warnings
- Write descriptive commit messages
- Test all features before submitting PRs

---

## 📄 License

MIT License - feel free to use this project for learning and portfolio purposes.

---

## 🔗 Links & Resources

- **Live Demo**: [Add your Vercel URL]
- **Documentation**: See [SETUP.md](./SETUP.md) for detailed setup instructions
- **API Documentation**: Inline JSDoc comments in API routes
- **Database Schema**: See `lib/schema.ts` for complete schema definition

---

## 💡 Future Enhancements

Potential features for future development:
- [ ] Code execution sandbox
- [ ] Collaborative learning rooms
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features (sharing, comments)
- [ ] Certificate generation
- [ ] Integration with more AI models
- [ ] Offline mode support

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
