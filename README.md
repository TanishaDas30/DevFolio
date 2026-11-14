# DevFolio – GitHub Developer Intelligence & Portfolio Platform

> **Transform any developer's GitHub profile into an interactive developer analytics dashboard and personal branding portfolio.**

DevFolio bridges the gap between raw GitHub commit history and career-defining developer presentation. It computes deep intelligence into coding cadence, byte-level language volume, contribution consistency streaks, and introduces an explainable **"Vibe Check" Tech Stack Compatibility Engine** to benchmark any developer's verified open-source artifacts against real-world job descriptions.

---

## 🌟 Key Features

### 1. ⚡ Professional GitHub Profile Header & Developer Scorecard
- Real-time profile synchronizer retrieving user avatars, bio, company, location, social links, public repositories, and followers.
- Composite **Developer Scorecard (0–100)** evaluating star impact, fork reach, annual contribution velocity, longest commit streak, and community presence.
- One-click instant sync button (`POST /api/github/{username}/refresh`) with cache invalidation.
- Quick user lookup for any public GitHub developer (e.g., `shadcn`, `gaearon`, `leerob`, `torvalds`, or any custom username).

### 2. 📅 52-Week Contribution Activity Heatmap
- GitHub-style 52-week activity calendar grid with 5-tier intensity styling (`#161B22` to `#39D353`).
- Accurate GraphQL `contributionsCollection` integration with graceful rate-limit and offline synthesis fallback.
- Exact date and contribution count tooltip on cell hover.
- Live streak analytics computing **Current Continuous Coding Streak** and **Longest Coding Streak Record**.
- Month and weekday labels with total annual contribution aggregations.

### 3. 📂 Repository Showcase & Explorer
- Responsive card grid displaying star counts, fork counts, primary programming languages with official color badges, open issues, and repository topics.
- Multi-dimensional sorting: **Stars**, **Forks**, **Last Updated Date**, and **Alphabetical**.
- Real-time instant search across repository names, topics, and descriptions.
- Language filter dropdown dynamically populated from active repositories.
- Visual spotlight badges for top-starred repositories.

### 4. 📊 Top Languages Analytics (Byte-Weighted Volume)
- Interactive **Recharts Donut Chart** calculating accurate percentage distribution using **actual source code byte volume** from the GitHub API rather than crude repository counts.
- Dynamic center label highlighting the developer's dominant language.
- Interactive legend with code volume badges formatted in KB/MB.

### 5. 🔮 Vibe Check – Tech Stack Compatibility Engine
- Explainable NLP keyword extractor mapping 160+ technologies across 7 domains (*Languages, Frontend, Backend, Databases, Cloud & DevOps, AI/Data Science, and Architecture*).
- Synonym normalizer (e.g., `fast api` $\to$ `FastAPI`, `k8s` $\to$ `Kubernetes`, `postgres` $\to$ `PostgreSQL`, `reactjs` $\to$ `React`).
- **Demonstrated vs. Inferred Competency Weighting**:
  - **Demonstrated (Weight: 1.0)**: Verified through primary codebase languages, high byte volume, and dedicated repository topics.
  - **Inferred (Weight: 0.65)**: Mentioned in project descriptions or profile metadata.
- Radial compatibility match gauge with color-coded score tiers.
- Granular Category Breakdown bars and verified repository evidence citations.
- Tailored actionable recommendations to bridge skill gaps.
- Analysis persistence in SQLite to revisit past job analyses.

### 6. 📈 Developer Growth Insights & Cadence Analytics
- Statistical analysis of historical activity:
  - **Peak Velocity Month** (highest contribution output).
  - **Top Cadence Day of the Week** (percentage of total pushes).
  - **Average Weekly Contribution Velocity**.
  - **Streak Endurance Records**.
- Interactive **Recharts Monthly Trends Bar Chart** and **Cumulative Repository Growth Area Chart**.
- Day-of-week rhythm distribution bar graph.
- Automated behavioral narrative insights generated directly from real retrieved data.

### 7. 🌐 Shareable Public Developer Portfolio
- Dedicated public portfolio route (`/portfolio/:username`).
- Headline, introduction bio, and social media connectivity.
- Customizable pinned featured repositories (select up to 6 repositories).
- Granular section visibility toggles (Heatmap, Languages, Growth Insights, Vibe Check badge, Statistics).
- One-click **Copy Portfolio Link** with toast notification feedback.
- Settings persisted in SQLite via `PUT /api/portfolio/{username}`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy 2.0, SQLite 3, Pydantic v2, HTTPX |
| **Data Sources** | GitHub REST API v3, GitHub GraphQL API v4 |
| **Architecture** | RESTful API, SQLite Caching with TTL, Rate Limit Resilience, Glassmorphic Dark UI |

---

## 🗄️ SQLite Caching Engine

DevFolio implements a 5-table SQLite relational schema (`devfolio.db`) to defend against GitHub API rate limits (60 req/hr unauthenticated, 5,000 req/hr authenticated):

1. `users`: Stores user profile metadata, follower counts, cumulative stars/forks, composite developer score, and sync timestamps.
2. `repositories`: Caches repository metadata, topics, dates, URLs, and byte-level language counts.
3. `contribution_data`: Stores 365+ daily contribution counts, weekdays, and intensity tiers.
4. `portfolio_settings`: Stores customizable headlines, bios, pinned repositories, and visibility toggles.
5. `job_analyses`: Archives job compatibility checks, scores, matched/missing skills, and recommendations.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) and npm
- **Python** (v3.10+)

---

### Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env` (optional GitHub Token for higher rate limits):
   ```ini
   GITHUB_TOKEN=your_personal_access_token_here
   CACHE_TTL_HOURS=1
   PORT=8000
   HOST=127.0.0.1
   ```

5. Start the FastAPI development server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   *The interactive Swagger API documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

---

### Frontend Setup

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The DevFolio dashboard will be live at: [http://localhost:5173](http://localhost:5173)*

---

## 🧪 Running Automated Tests

Run the complete backend test suite covering SQLite caching, GitHub API integration, Vibe Check compatibility scoring, and growth insights:

```bash
python -m pytest backend/tests/test_devfolio.py -v
```

All 6 test suites validate:
- ✅ Composite Developer Scorecard calculation.
- ✅ SQLite cache hit, cache miss, and TTL expiration logic.
- ✅ Accurate source code byte volume aggregation.
- ✅ Explainable Vibe Check matching, synonyms, and weighting.
- ✅ Developer Growth Insights and streak computation.
- ✅ Graceful handling of invalid usernames and missing API credentials.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and rate limit availability |
| `GET` | `/api/demo/users` | List of curated demo profiles for one-click evaluation |
| `GET` | `/api/rate-limit` | Real-time GitHub API rate limit metrics |
| `GET` | `/api/github/{username}/profile` | Comprehensive developer profile with scorecard |
| `GET` | `/api/github/{username}/repositories` | Filterable, sortable repository list |
| `GET` | `/api/github/{username}/contributions` | 52-week contribution calendar and streaks |
| `GET` | `/api/github/{username}/languages` | Byte-level language distribution |
| `GET` | `/api/github/{username}/insights` | Monthly trends, daily rhythms, and growth charts |
| `POST` | `/api/github/{username}/refresh` | Force sync fresh data from GitHub API |
| `POST` | `/api/compatibility/analyze` | Run Vibe Check compatibility on a job description |
| `GET` | `/api/compatibility/history/{username}` | Retrieve past job analysis history |
| `GET` | `/api/portfolio/{username}` | Public portfolio payload with custom settings |
| `PUT` | `/api/portfolio/{username}` | Update headline, intro, pinned repos, and visibility |

---

## 🎨 Design System

- **Theme**: Dark-first, minimalist SaaS aesthetic inspired by Linear and Vercel.
- **Color Palette**:
  - Deep Charcoal Surfaces: `#0B0F17`, `#111827`, `#151D2E`
  - Accent Violet / Indigo: `#6366F1`, `#8B5CF6`
  - Secondary Cyan: `#06B6D4`
  - Emerald Green: `#10B981`
  - Amber / Warning: `#F59E0B`
- **Typography**: Inter (sans-serif) and JetBrains Mono (monospaced).
- **Animations**: Subtle, purposeful Framer Motion transitions with zero clutter.
