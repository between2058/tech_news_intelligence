# Multi-Workspace Tech News Intelligence Assistant

A powerful, AI-driven news intelligence platform designed to track, analyze, and synthesize tech news across multiple workspaces. This MVP features a premium "Glass" UI, structured data extraction, and a global AI assistant.

## 🚀 Features

- **Multi-Workspace Architecture**: Organize research by topics (e.g., "AI & ML", "Semiconductors").
- **Structured Intelligence**: Automatically extracts entities, sentiment, and summaries from news articles.
- **Global AI Assistant**: Cross-workspace chat interface to compare trends and ask complex questions.
- **Premium UI**: Modern, dark-mode design system with glassmorphism and smooth animations.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **git**

## 🏁 Getting Started

Follow these steps to set up the project on a new machine.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd News_assistant
```

### 2. Install Dependencies

Install the Node.js dependencies and Playwright browsers (required for web crawling).

```bash
npm install
npx playwright install
```

### 3. Configure Environment Variables

Create a `.env` file from the example template.

```bash
cp .env.example .env
```

Open `.env` and add your API keys:

```env
# .env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-your-openai-key-here"
```

> **Note**: An OpenAI API key is required for the AI features to work.

### 4. Setup the Database

Initialize the SQLite database using Prisma.

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server

Start the application locally.

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Project Structure

- **`src/app`**: Next.js App Router pages and API endpoints.
- **`src/components`**: React components (UI elements).
- **`src/lib`**: Utility functions, crawlers, and LLM clients.
- **`src/lib/crawlers`**: Logic for fetching data from TechCrunch, NVIDIA, etc.
- **`prisma/schema.prisma`**: Database schema definition.

## 🧪 Running Tests

To verify everything is working correctly:

```bash
# Run unit tests
npm test

# Run linting
npm run lint
```

## 📦 Deployment

This application is built with Next.js and can be easily deployed to Vercel or any Node.js hosting.

**Build for output:**
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
