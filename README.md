# Tech News Intelligence Assistant

A multi-workspace research platform for collecting, structuring, and analyzing technology news from NVIDIA Newsroom, TechCrunch, and Yahoo Finance. Features AI-powered analysis with cross-workspace reasoning capabilities.

## Features

- **Multi-Workspace Management** - Create separate research environments for different topics (e.g., "NVIDIA Blackwell", "GPT-5")
- **Intelligent Crawling** - Automated news collection from TechCrunch (HTTP), NVIDIA Newsroom and Yahoo Finance (Playwright)
- **LLM-Powered Analysis** - Structured insights extraction including key findings, entities, sentiment, and timeline
- **Global Assistant** - Cross-workspace chat with markdown rendering for comparing research across topics
- **Bring Your Own Model** - Configure any OpenAI-compatible LLM provider (Ollama, OpenAI, vLLM, etc.)

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite
- **Crawling**: Playwright (headless browser)
- **LLM**: OpenAI-compatible API

## Prerequisites

- Node.js 18+ 
- npm or yarn
- An OpenAI-compatible LLM endpoint (e.g., local Ollama, OpenAI API, or vLLM)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd News_assistant
npm install
```

### 2. Install Playwright Browser

```bash
npx playwright install chromium
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create database
npx prisma migrate dev
```

### 4. Configure Environment

The `.env` file is auto-generated with SQLite database path:
```
DATABASE_URL="file:./dev.db"
```

### 5. Start Development Server

```bash
npm run dev
# or specify a port
npm run dev -- --port 3001
```

Open [http://localhost:3000](http://localhost:3000) (or your specified port).

### 6. Configure LLM Provider

1. Click **Settings** in the top right
2. Add your LLM provider:
   - **Name**: e.g., "Local Ollama" or "OpenAI"
   - **Base URL**: e.g., `http://localhost:11434/v1` for Ollama
   - **API Key**: Leave empty for local providers, or enter your API key
   - **Model Name**: e.g., `llama3`, `gpt-4`, etc.
3. Click **Add Provider**

## Development & Testing

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test normalization
npm test techcrunch

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

The project includes tests for:
- Document normalization (`src/__tests__/lib/normalization.test.ts`)
- TechCrunch crawler (`src/__tests__/lib/crawlers/techcrunch.test.ts`)

### Linting

```bash
npm run lint
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── chat/               # Global assistant endpoint
│   │   ├── providers/          # LLM provider CRUD
│   │   └── workspaces/         # Workspace CRUD & crawl
│   ├── globals.css             # Tailwind imports
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── Dashboard.tsx           # Main dashboard layout
│   ├── GlobalAssistant.tsx     # Chat interface
│   ├── ProviderConfig.tsx      # LLM configuration UI
│   ├── WorkspaceTabs.tsx       # Workspace navigation
│   └── WorkspaceView.tsx       # Research results display
├── lib/
│   ├── crawlers/               # News crawlers
│   │   ├── base.ts             # Crawler interface
│   │   ├── nvidia.ts           # NVIDIA Newsroom (Playwright)
│   │   ├── techcrunch.ts       # TechCrunch (HTTP)
│   │   └── yahoo.ts            # Yahoo Finance (Playwright)
│   ├── llm/
│   │   ├── client.ts           # OpenAI-compatible client
│   │   └── schemas.ts          # JSON output schemas
│   ├── normalization.ts        # Document cleaning
│   └── prisma.ts               # Database client
└── __tests__/                  # Test files
```

## Usage

1. **Create a Workspace**: Click "+ New Workspace", enter a name and research topic
2. **Crawl Sources**: Click "Crawl Sources" to fetch and analyze news
3. **View Results**: See key findings, entities, sentiment, and source documents
4. **Ask Questions**: Use the Chat Assistant to query across all workspaces

## License

MIT
