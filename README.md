# Top Three

A daily social app that asks you one simple question every morning: **"What are your top 3 [X]?"**

Rank your top 3. Submit. Then see how your friends ranked theirs — Wordle-style: you have to submit yours before you can see theirs.

## How it works

1. Every morning at 9am you get a push notification: *"Rank your top 3 cheeses 🧀"*
2. You drag-to-rank your top 3 and submit
3. A shareable card is generated: *"I ranked my top 3 cheeses. Submit yours to see mine."*
4. Friends submit → everyone sees everyone's list → debate ensues

## Features

- 📲 Daily push notification with the day's prompt
- 🏆 Drag-to-rank submission UI
- 👀 Gated reveal — see friends' lists only after submitting your own
- 📤 Wordle-style share card
- 👥 Facebook Login + friend graph import
- 🔥 Trending — most popular #1 picks among your friends

## Architecture

```
top-three/
├── backend/          # Node.js + Express + PostgreSQL + Redis
└── mobile/           # React Native (Expo), iOS-first
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
psql -U postgres -f src/db/schema.sql
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Stack

| Layer | Tech |
|-------|------|
| Mobile | React Native + Expo |
| Auth | Facebook Login (Meta SDK) |
| Push | Expo Push Notifications (APNs) |
| API | Node.js + Express |
| Database | PostgreSQL |
| Cache/Trending | Redis |
