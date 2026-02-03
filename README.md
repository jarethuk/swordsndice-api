# Swords & Dice API

Swords and dice is a community-focused list builder with a heavy focus on the social aspects of tabletop gaming.

Right now it only supports MESBG and it's in beta, but feel free to try it out!

Start playing at https://swordsndice.com/

## Features
- Create lists
- Find friends and groups via their username
- Create games and invite friends to join
- Add your list and view your opponent's lists before the game
- Real-time stats tracking for Might, Will, Fate, Victory Points, model counts and units & wounds

## Built Using
- PostgreSQL
- NextJS
- TypeScript
- Jest

Connects to the Expo & web frontend at https://github.com/jarethuk/swordsndice

## Setup
1. Create .env file
```
PORT=3002
VERCEL_ENV=development
SESSION_KEY=arandomstring
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/swordsndice
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/swordsndice
EMAIL_USER=<<from email for login>>
RESEND=<<resend token>>
```

2. Install dependencies
```
pnpm i
```

3. Create local databases
```
pnpm db:dev
pnpm db:test
```

4. Run the dev server

```
pnpm dev
```