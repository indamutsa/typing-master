# TypeMaster

AI-powered typing trainer that adapts to the keys you actually struggle with.

**Live:** [typing-master-dun.vercel.app](https://typing-master-dun.vercel.app)

Unlike generic speed tests, TypeMaster tracks per-key error rates across sessions, identifies your weakest keys, and uses AI to generate targeted drill paragraphs that hammer exactly those characters. The result is a focused training loop: type, expose weaknesses, generate AI drills that target them, repeat.

## Modes

| Mode | Route | Description |
|------|-------|-------------|
| **Practice** | `/practice` | AI-generated drill text targeting your top-5 weak keys. No timer — session ends when the passage is complete. |
| **Test** | `/test` | Timed typing test (30s / 60s / custom). Countdown runs in the HUD. Results show WPM and accuracy. |
| **Free** | `/free` | Paste or type any text, then type it back. No timer. Useful for domain-specific vocabulary. |

## Features

- **Char-by-char highlighting** — correct (green), error (red), current (cursor), pending (muted)
- **Live HUD** — WPM, accuracy %, streak counter, and timer updated every keystroke
- **Keyboard heatmap** — QWERTY layout colored by error rate, top-N weak keys highlighted
- **Results modal** — post-session WPM, accuracy, time, characters, and top struggling keys
- **AI drill generation** — builds a prompt from your weak keys, generates a 200-word paragraph via DeepSeek/OpenAI/Anthropic
- **Per-key stats** — attempts + errors tracked per key, persisted across sessions
- **Auth** — register/login with credentials, JWT sessions
- **Dashboard** — session history, accuracy trends, per-key breakdown charts

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (dark theme, JetBrains Mono)
- **State:** Zustand with localStorage persistence
- **Database:** Neon Postgres via `@neondatabase/serverless`
- **ORM:** Drizzle ORM with `drizzle-kit` for schema management
- **Auth:** NextAuth.js v5 (credentials provider, JWT strategy)
- **AI:** DeepSeek / OpenAI / Anthropic (configurable in settings)
- **Charts:** Recharts
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- A Neon Postgres database (free tier: [neon.tech](https://neon.tech))

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env.local

# Push the database schema to Neon
npm run db:push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXTAUTH_SECRET` | Yes | Random string for signing JWTs (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Dev only | `http://localhost:3000` (auto-detected on Vercel) |
| `DEEPSEEK_API_KEY` | No | DeepSeek API key for AI drill generation |
| `OPENAI_API_KEY` | No | OpenAI API key (alternative provider) |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (alternative provider) |

At least one AI provider key is needed for Practice mode. Without it, a curated fallback passage is used.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Drizzle schema to Postgres |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |

## Project Structure

```
src/
  app/
    page.tsx                  # Mode selector (home)
    practice/page.tsx         # AI-generated drill mode
    test/page.tsx             # Timed typing test
    free/page.tsx             # User-supplied text mode
    dashboard/page.tsx        # Session history + charts
    login/page.tsx            # Login form
    register/page.tsx         # Registration form
    api/
      auth/                   # NextAuth + registration
      drill/                  # AI text generation
      keystats/               # Per-key stats CRUD
      sessions/               # Session records CRUD
      settings/               # User settings CRUD
      migrate/                # localStorage → DB migration
  components/
    TextDisplay.tsx           # Char-by-char passage renderer
    HUD.tsx                   # Live WPM / accuracy / timer bar
    KeyHeatmap.tsx            # QWERTY keyboard heatmap
    ResultsModal.tsx          # Post-session results
    ModeSelector.tsx          # Home page mode cards
    SettingsDrawer.tsx        # API key + preferences panel
    DashboardCharts.tsx       # Recharts visualizations
  store/
    session.ts                # Live typing session state
    keyStats.ts               # Per-key error tracking
    settings.ts               # User preferences
  lib/
    db.ts                     # Neon Postgres connection
    schema.ts                 # Drizzle ORM table definitions
    auth.ts                   # NextAuth configuration
    ai.ts                     # AI drill text generation
    typing.ts                 # WPM / accuracy helpers
    keymap.ts                 # QWERTY layout constant
```

## Testing

```bash
# Run Playwright e2e tests (55 tests)
npx playwright test

# Run with visible browser
npx playwright test --headed

# View test report
npx playwright show-report
```

## License

MIT
