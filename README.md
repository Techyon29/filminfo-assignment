# FilmInfo - AI Movie Insight Builder

A React-based web application that lets users enter an IMDb movie ID and instantly view movie details along with AI-powered audience sentiment analysis.

## Live Demo

[Deployed on Vercel](https://filminfo-assignment.vercel.app)

## Features

- **Movie Details** — Title, poster, release year, IMDb rating, plot summary, genres, directors, writers, and cast
- **AI Sentiment Analysis** — Powered by Groq (LLaMA), analyzes TMDB audience reviews and returns a summary with positive/negative/neutral breakdown and overall sentiment classification
- **Wishlist** — Save movies to a persistent wishlist (localStorage), view details, or remove them
- **Input Validation** — Validates IMDb ID format (`tt` + 7+ digits) with helpful error messages
- **Responsive Design** — Fully responsive across desktop, tablet, and mobile
- **Smooth Animations** — Framer Motion animations for so if number out of 100 then what would be loading states and UI transitions

## Tech Stack

| Technology            | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| **React 19**          | UI framework                                                     |
| **Vite 7**            | Build tool & dev server — chosen for fast HMR and minimal config |
| **Tailwind CSS 4**    | Utility-first styling with custom dark theme                     |
| **React Router v7**   | Client-side routing                                              |
| **Axios**             | HTTP client for API calls                                        |
| **Framer Motion**     | Animations and transitions                                       |
| **OpenAI SDK (Groq)** | AI-powered review sentiment analysis via LLaMA model             |
| **Vitest**            | Unit testing framework                                           |

### Why Vite + React instead of Next.js?

This application is a fully client-side SPA — all data fetching happens in the browser and there's no need for server-side rendering. Vite was chosen for:

- **Faster development** — near-instant HMR and startup
- **Simpler architecture** — no server layer needed for this use case
- **Smaller bundle** — no framework overhead

For production, API keys would ideally be proxied through a backend service or serverless functions.

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd filminfo-assignment
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

| Variable          | Description  | Get it from                                               |
| ----------------- | ------------ | --------------------------------------------------------- |
| `VITE_API_Key`    | TMDB API key | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| `VITE_AI_API_KEY` | Groq API key | [console.groq.com](https://console.groq.com/keys)         |

### Run Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

## Assumptions

- Users know their IMDb movie ID (format: `tt` followed by 7+ digits, e.g., `tt0133093` for The Matrix)
- TMDB reviews are used as the audience review source since IMDb doesn't offer a public review API
- Movies without TMDB reviews will show "No reviews available" instead of AI analysis
- Wishlist data persists in browser localStorage
- The Groq free tier is sufficient for demo usage; rate limits may apply under heavy use

## Project Structure

```
src/
├── Components/
│   └── Navbar.jsx          # Navigation with search bar
├── Pages/
│   ├── Home.jsx            # Landing page with search input
│   ├── MovieDetail.jsx     # Movie details + AI sentiment
│   └── Wishlist.jsx        # Saved movies list
├── context/
│   └── movieContext.jsx     # Wishlist state management
├── __tests__/
│   ├── movieContext.test.jsx
│   └── Home.test.jsx
├── App.jsx                  # Route definitions
├── main.jsx                 # Entry point
└── index.css                # Tailwind config + global styles
```
