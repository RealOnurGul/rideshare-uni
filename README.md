# StudentRide 🚗

A rideshare platform exclusively for university students. Share rides, save money, reduce your carbon footprint, and connect with fellow students.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## Features

- 🔐 **Google OAuth** - Secure sign-in with Google accounts
- 🎓 **University Verification** - Only verified students can use the platform
- 🚗 **Offer Rides** - Share your trips and split costs
- 🔍 **Find Rides** - Search and filter available rides
- 📊 **Dashboard** - Manage your rides and bookings
- 👤 **Profile** - View stats and manage your account

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Google Cloud Console account (for OAuth)

### Installation

```bash
# Install dependencies
npm install

# Set up the database
npx prisma db push

# Start development server
npm run dev
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services → OAuth consent screen**
   - Select "External"
   - Fill in app name and emails
   - Add test users (your email)
4. Go to **APIs & Services → Credentials**
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to your `.env` file

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework |
| TypeScript | Type safety |
| Prisma | Database ORM |
| SQLite | Database (dev) |
| NextAuth.js | Authentication |
| Tailwind CSS | Styling |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Auth pages
│   ├── dashboard/     # User dashboard
│   ├── profile/       # User profile
│   └── rides/         # Ride pages
├── components/        # React components
├── lib/              # Utilities
└── types/            # TypeScript types
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rides` | List rides |
| POST | `/api/rides` | Create ride |
| GET | `/api/rides/[id]` | Get ride details |
| POST | `/api/rides/[id]/book` | Request seat |
| PATCH | `/api/bookings/[id]` | Accept/decline booking |

## Database Management

View and manage your database:
```bash
npx prisma studio
```

## Supported Universities

Currently configured for:
- McGill University (@mcgill.ca)
- Concordia University (@concordia.ca)
- Université de Montréal (@umontreal.ca)

Add more in `src/lib/allowed-domains.ts`

## License

MIT
