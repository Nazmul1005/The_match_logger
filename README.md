<div align="center">

# ⚽ The Match Logger

### *The ultimate football prediction & live score tracking platform*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![ESPN API](https://img.shields.io/badge/ESPN_API-Live_Data-D00000?style=for-the-badge&logo=espn&logoColor=white)](https://espn.com)

<br/>

> 🎯 **Predict scores. Earn points. Climb the rankings.**
> 
> A full-stack web application that pulls **real-time football fixtures** from the ESPN API across
> **7 top competitions**, lets multiple users register, submit score predictions, and compete on a live leaderboard.

<br/>

```
┌─────────────────────────────────────────────────────────────────────┐
│   📅 FIXTURES   →   🎯 PREDICT   →   💎 EARN POINTS   →   🏆 RANK   │
└─────────────────────────────────────────────────────────────────────┘
```

</div>

---

## 📸 Key Views

```
┌──────────────────────────────────────────────────────────────────────┐
│  ⚽ The Match Logger          [📅 Fixtures] [🎯 Predictions] [🏆 Rank]│
│                              👤 Nazmul  ●3 Live  ●22 Upcoming        │
├──────────────────────────────────────────────────────────────────────┤
│  All │ 🇪🇸 La Liga │ 🏴󠁧󠁢󠁥󠁮󠁧󠁿 PL │ 🇩🇪 Bundesliga │ 🇫🇷 Ligue 1 │ 🇮🇹 Serie A │ ⭐ UCL │ 🟠 UEL │
│  [ All Fixtures ] [ Upcoming ] [ 🔴 Live ] [ Finished ]               │
├─────────────────────┬──────────────────────┬──────────────────────┤
│  ┌────────────────┐ │ ┌──────────────────┐ │ ┌──────────────────┐ │
│  │ BUNDESLIGA 🔴  │ │ │  UCL   UPCOMING  │ │ │  SERIE A  FT     │ │
│  │ [Logo] 2–1 [L]│ │ │ [Logo] vs [Logo] │ │ │ [Logo] 1–0 [Lo] │ │
│  │  Bayern Dortm.│ │ │  Real  Man City  │ │ │  Inter    Napoli │ │
│  │ 🏟 Allianz    │ │ │  🗓 Tomorrow 21h  │ │ │ 🕑 FT · San Siro│ │
│  │ [● 189 pred.] │ │ │    [+ Predict]   │ │ │ [✅ 54 pred.]   │ │
│  └────────────────┘ │ └──────────────────┘ │ └──────────────────┘ │
└─────────────────────┴──────────────────────┴──────────────────────┘
```

---

## ✨ Features

### 🌍 Live Data & Real Logos
| Feature | Description |
|---|---|
| 📡 **Real-time fixtures** | ESPN API — **7 competitions**: La Liga, Premier League, Bundesliga, Ligue 1, Serie A, UCL, UEL |
| 🖼️ **Official team logos** | Direct from ESPN CDN with fallback initials |
| 🔴 **Live score indicator** | Pulsing red border + score updates every 90s |
| 🏟️ **Venue info** | Stadium name shown on every match card |
| 🔄 **Auto-refresh** | Background polling every 90 seconds |

### 👤 Multi-User System
| Feature | Description |
|---|---|
| 📧 **Register once** | Gmail + Nickname — shown only on first launch |
| 🔐 **Persistent session** | Stored in localStorage, never asked again |
| 📱 **Multi-device login** | Enter same Gmail on any device to restore session |
| 👥 **Multi-user** | Dozens of friends can register and compete |

### 🎯 Prediction & Points System
| Outcome | Condition | Points |
|---|---|:---:|
| ⭐ **Exact Score** | You predicted `2–1` and it finished `2–1` | **+3** |
| ✅ **Correct Result** | Right win/draw/loss direction, wrong score | **+1** |
| ❌ **Wrong** | Completely wrong result | **+0** |
| ⏳ **Pending** | Match hasn't finished yet | **TBD** |

### 🏆 Leaderboard & Achievements
| Item | Details |
|---|---|
| 🥇🥈🥉 **Visual Podium** | Gold/silver/bronze animated platform for top 3 |
| 📊 **Full Rankings Table** | All users sorted by total points |
| 🟢 **Self-highlight** | Your own row glows green with **"YOU"** badge |
| 🔁 **Auto-refreshes** | Rankings update every 60 seconds |

### 🏅 Achievement Badges
| Badge | Name | How to Earn |
|:---:|---|---|
| 🌟 | **First Prediction** | Submit your first prediction |
| ⚡ | **Lucky Strike** | Get your first correct result |
| 🎯 | **Sniper** | Predict an exact score correctly |
| 🔥 | **On Fire** | 3+ correct predictions in a row |
| 🏆 | **Fortune Teller** | 3 exact score predictions |
| 📊 | **Dedicated Fan** | Make 10+ predictions |
| 💎 | **Oracle** | Reach 20+ total points |
| 🥇 | **Champion** | Reach 50+ total points |

---

## 🗂️ Project Structure

```
Match Loger/
│
├── 📁 backend/                     # Node.js + Express API server
│   ├── 🟢 server.js                # Main API — all routes & ESPN fetching
│   ├── 🔌 db.js                    # PostgreSQL connection pool (pg)
│   ├── 📦 package.json             # Dependencies: express, pg, cors, dotenv
│   └── 🔒 .env                     # DB_USER, DB_PASSWORD, PORT (gitignored)
│
├── 📁 database/                    # SQL schema & migrations
│   ├── 🗄️  schema.sql              # Initial tables: teams, matches, predictions
│   ├── 🔄 live_predictions_migration.sql  # Live predictions table (ESPN IDs)
│   ├── 📝 metadata_migration.sql   # Match metadata columns for predictions
│   └── 👤 users_migration.sql      # Users table + user_id FK + outcome/points
│
└── 📁 frontend/                    # React 18 + Vite
    ├── 📄 index.html               # App entry point
    ├── ⚙️  vite.config.js          # Dev proxy: /api → localhost:3001
    └── 📁 src/
        ├── 🎨 App.css              # Full design system (dark theme, glassmorphism)
        ├── ⚛️  App.jsx              # Root: registration gate + 3-view router
        └── 📁 components/
            ├── 🔐 RegisterModal.jsx   # First-launch registration overlay
            ├── 📋 MatchList.jsx       # Grid layout for match cards
            ├── 🃏 MatchCard.jsx       # Individual match: logos, score, status
            ├── 📝 PredictionForm.jsx  # Score submission form (inline)
            ├── 🎯 PredictionsPanel.jsx # My predictions: stats + outcome cards
            └── 🏆 Leaderboard.jsx     # Rankings: podium + full table
```

---

## 🗄️ Database Schema

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATABASE: match_logger                    │
└──────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐        ┌──────────────────────────────────┐
  │       USERS         │        │        LIVE_PREDICTIONS           │
  ├─────────────────────┤        ├──────────────────────────────────┤
  │ 🔑 id         UUID  │◄───────│ 🔑 id               SERIAL        │
  │ 📧 gmail      TEXT  │        │ 🔗 user_id           UUID (FK)    │
  │ 👤 nickname   TEXT  │        │ 🆔 match_external_id  TEXT        │
  │ 📅 created_at TSTZ  │        │ 🏠 predicted_home_score  INT      │
  └─────────────────────┘        │ ✈️  predicted_away_score  INT      │
                                 │ 🏠 home_team         TEXT        │
  ┌─────────────────────┐        │ ✈️  away_team          TEXT        │
  │       TEAMS         │        │ 🏆 league             TEXT        │
  ├─────────────────────┤        │ 🖼️  home_logo          TEXT        │
  │ 🔑 id         SERIAL│        │ 🖼️  away_logo          TEXT        │
  │ 📛 name       TEXT  │        │ 📅 match_date         TSTZ        │
  │ 🏆 league     TEXT  │        │ ⚽ actual_home_score  INT         │
  └────────┬────────────┘        │ ⚽ actual_away_score  INT         │
           │                     │ 🎯 outcome            TEXT        │
  ┌────────▼────────────┐        │ 💎 points             INT         │
  │       MATCHES       │        │ 📅 created_at         TSTZ        │
  ├─────────────────────┤        └──────────────────────────────────┘
  │ 🔑 id         SERIAL│
  │ 🔗 home_team_id INT │          outcome values:
  │ 🔗 away_team_id INT │          ├── 'exact'           → +3 pts
  │ 📅 match_date  TSTZ │          ├── 'correct_result'  → +1 pt
  │ ⚽ home_score  INT  │          ├── 'wrong'           →  0 pts
  │ ⚽ away_score  INT  │          ├── 'live'            → in progress
  │ 📌 status     TEXT  │          └── 'pending'         → not settled
  └─────────────────────┘
```

---

## 🏗️ Architecture

```
                 ┌────────────────────────────────────────────────┐
                 │               ESPN Public API                   │
                 │  La Liga · PL · Bundesliga · Ligue 1 · Serie A  │
                 │  UEFA Champions League · UEFA Europa League      │
                 │         (Real fixtures, logos, live scores)      │
                 └─────────────────┬──────────────────────────────┘
                                   │ fetch (every 90s, 7 leagues in parallel)
                                   ▼
┌────────────────┐   /api/*    ┌─────────────────────┐   pg pool   ┌───────────────┐
│                │────────────▶│   Express Backend    │────────────▶│  PostgreSQL   │
│  React Frontend│             │   (server.js)        │◀────────────│  match_logger │
│  (Vite :5173)  │◀────────────│   Port: 3001         │             │  Port: 5432   │
│                │   JSON      └─────────────────────┘             └───────────────┘
└────────────────┘
        │
        ▼
┌────────────────┐
│  localStorage  │
│  (user session)│
└────────────────┘

Proxy: Vite dev server forwards all /api → http://localhost:3001
```

---


## 🚀 Getting Started


### 📦 Installation

```bash
# 1. Clone the project
git clone <your-repo-url>
cd "Match Loger"

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

### 🗄️ Database Setup

```bash
# Start PostgreSQL
brew services start postgresql@15

# Create the database
createdb match_logger

# Run schema migrations (in order)
psql -d match_logger -f database/schema.sql
psql -d match_logger -f database/live_predictions_migration.sql
psql -d match_logger -f database/metadata_migration.sql
psql -d match_logger -f database/users_migration.sql
```

### 🔒 Environment Setup

Create `backend/.env`:
```env
DB_USER=your_macos_username
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=match_logger
PORT=3001
```

### ▶️ Running the App

Open **two terminal windows**:

```bash
# Terminal 1 — Backend
cd "Match Loger/backend"
node server.js
# ✅ API running at http://localhost:3001

# Terminal 2 — Frontend
cd "Match Loger/frontend"
npm run dev
# ✅ App running at http://localhost:5173
```

Open **http://localhost:5173** in your browser 🎉

### ⏹️ Stopping

```bash
pkill -f "node server.js"
pkill -f "vite"
brew services stop postgresql@15
```

---

## 🔄 User Flow

```
     First Visit?
          │
    ╔═════▼══════╗
    ║ REGISTER   ║  ← Full-screen modal (shown ONCE)
    ║  Gmail     ║    Enter Gmail + Nickname
    ║  Nickname  ║    Stored in localStorage forever
    ╚═════╦══════╝
          │
    ╔═════▼══════════════════════════════════╗
    ║           📅 FIXTURES VIEW             ║
    ║  Filter by: League / Status           ║
    ║  See: Real logos · Live scores        ║
    ║  Click: "+ Predict" on any match      ║
    ╚═════╦══════════════════════════════════╝
          │
    ╔═════▼══════════════════════════════════╗
    ║      🎯 SUBMIT PREDICTION              ║
    ║  Enter: Home score ─ Away score       ║
    ║  Saved to DB with your user ID        ║
    ╚═════╦══════════════════════════════════╝
          │
    ╔═════▼══════════════════════════════════╗
    ║       🎯 MY PREDICTIONS VIEW           ║
    ║  See: All your predictions            ║
    ║  Stats: Points · Exact · Accuracy     ║
    ║  Achievements unlocked               ║
    ╚═════╦══════════════════════════════════╝
          │
    ╔═════▼══════════════════════════════════╗
    ║       🏆 RANKINGS VIEW                 ║
    ║  Podium: Top 3 players                ║
    ║  Table: All users ranked by points    ║
    ║  YOUR row highlighted in green        ║
    ╚════════════════════════════════════════╝
```

---

## 🏟️ Supported Leagues

| # | League | ESPN Slug | Coverage |
|:---:|---|---|---|
| 1 | 🇪🇸 **La Liga** | `ESP.1` | All season fixtures |
| 2 | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Premier League** | `ENG.1` | All season fixtures |
| 3 | 🇩🇪 **Bundesliga** | `GER.1` | All season fixtures |
| 4 | 🇫🇷 **Ligue 1** | `FRA.1` | All season fixtures |
| 5 | 🇮🇹 **Serie A** | `ITA.1` | All season fixtures |
| 6 | ⭐ **UEFA Champions League** | `uefa.champions` | Group stage → Final |
| 7 | 🟠 **UEFA Europa League** | `uefa.europa` | Group stage → Final |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0e1a` | App background |
| `--bg-card` | `rgba(255,255,255,0.04)` | Glassmorphism cards |
| `--accent-green` | `#63cab7` | Primary accent, points, highlights |
| `--accent-gold` | `#f5c842` | Exact score badge, achievements |
| `--accent-red` | `#f56565` | Wrong prediction, live match |
| `--font-sans` | `Inter` | All UI text |

**Design principles:** Dark theme · Glassmorphism cards · Gradient accents · Micro-animations · Responsive grid

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Component-based UI, hot-reload |
| **Styling** | Vanilla CSS | Custom design system, no frameworks |
| **Backend** | Node.js + Express | REST API, ESPN data fetching |
| **Database** | PostgreSQL 15 (pg) | Users, predictions, leaderboard |
| **Live Data** | ESPN Public API | Real fixtures, logos, live scores |
| **Session** | Browser localStorage | Zero-config user persistence |

---
## 🔮 How Points Are Calculated

```
                         ┌─────────────────────────┐
                         │  Match Finishes (ESPN)   │
                         └────────────┬────────────┘
                                      │
                    refreshPredictionOutcomes() runs
                                      │
              ┌───────────────────────▼──────────────────────┐
              │     predicted_home == actual_home             │
              │  AND predicted_away == actual_away ?          │
              └──────┬──────────────────────────────┬────────┘
                   YES │                           NO │
                       ▼                             ▼
              ┌────────────────┐        ┌────────────────────────┐
              │ outcome: exact │        │  Same win/draw/loss ?  │
              │   points: +3   │        └──────┬────────────┬────┘
              └────────────────┘             YES │          NO │
                                                 ▼             ▼
                                    ┌─────────────────┐  ┌──────────────┐
                                    │outcome: correct  │  │outcome: wrong│
                                    │   points: +1     │  │  points: 0   │
                                    └─────────────────┘  └──────────────┘
                                    
Outcome + points stored PERMANENTLY in DB so old ESPN data isn't needed.
```

---

