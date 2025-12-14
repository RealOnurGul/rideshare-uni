# StudentRide 🚗

A rideshare platform exclusively for Canadian university students. Share rides, save money, reduce your carbon footprint, and connect with fellow students.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## Features

- 🔐 **Google OAuth** - Secure sign-in with Google accounts
- 🎓 **University Verification** - Platform for verified students
- 🚗 **Offer Rides** - Share your trips and split costs
- 🔍 **Find Rides** - Search and filter available rides
- 🗺️ **Interactive Maps** - Search Canadian locations with draggable pins
- 📅 **Date Range Filters** - Find rides within your travel window
- 📊 **Dashboard** - Manage your rides and bookings
- 👤 **Profile** - View stats and manage your account
- 🚙 **Vehicle Management** - Add and manage your vehicles
- 🎛️ **Ride Preferences** - Set luggage, pets, smoking, music preferences
- 🔔 **In-App Notifications** - Real-time booking updates
- 💬 **Ride Chats** - Dedicated chat page with group conversations per ride
- 📜 **Ride History** - View past completed/cancelled rides
- ❌ **Cancel Rides/Bookings** - Cancel with automatic notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Google Cloud Console account (for OAuth)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd rideshare-uni

# Install dependencies
npm install

# Set up the database
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your environment variables in `.env`:
```env
# For local development with SQLite:
DATABASE_URL="file:./dev.db"
# For production with PostgreSQL (Neon/Supabase):
# DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services → OAuth consent screen**
   - Select "External"
   - Fill in app name and support emails
   - Add your email as a test user
4. Go to **APIs & Services → Credentials**
   - Click "Create Credentials" → "OAuth client ID"
   - Select **"Web application"** (not Desktop!)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to your `.env` file

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework |
| TypeScript | Type safety |
| Prisma | Database ORM |
| PostgreSQL | Production database (SQLite for local dev) |
| NextAuth.js | Authentication |
| Tailwind CSS | Styling |
| Leaflet | Interactive maps |
| OpenStreetMap | Map tiles (free) |
| Nominatim | Location search (free) |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── bookings/  # Booking management
│   │   ├── notifications/ # In-app notifications
│   │   ├── rides/     # Ride CRUD
│   │   └── vehicles/  # Vehicle management
│   ├── auth/          # Auth pages
│   ├── dashboard/     # User dashboard
│   ├── profile/       # User profile
│   ├── rides/         # Ride pages
│   └── vehicles/      # Vehicle management page
├── components/        # React components
├── lib/              # Utilities
└── types/            # TypeScript types
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rides` | List rides (with filters) |
| POST | `/api/rides` | Create ride |
| GET | `/api/rides/[id]` | Get ride details |
| PATCH | `/api/rides/[id]` | Update ride (cancel/complete) |
| POST | `/api/rides/[id]/book` | Request seat |
| PATCH | `/api/bookings/[id]` | Accept/decline/cancel booking |
| GET | `/api/vehicles` | Get user's vehicles |
| POST | `/api/vehicles` | Add vehicle |
| PATCH | `/api/vehicles/[id]` | Update vehicle |
| DELETE | `/api/vehicles/[id]` | Delete vehicle |
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications` | Mark notifications as read |
| GET | `/api/locations` | Get unique locations from DB |
| GET | `/api/chats` | Get all user's ride chats |
| GET | `/api/rides/[id]/messages` | Get ride chat messages |
| POST | `/api/rides/[id]/messages` | Send a chat message |

## Database Models

| Model | Description |
|-------|-------------|
| User | User accounts with Google OAuth |
| Vehicle | User vehicles (make, model, year, color, plate) |
| Ride | Ride offers with location, preferences, status |
| Booking | Seat requests with status tracking |
| Notification | In-app notification system |
| Message | Ride chat messages |

## Workflow

1. **Sign in** with Google
2. **Add a vehicle** in My Vehicles
3. **Offer a ride**: Select route → Choose vehicle & preferences → Set details
4. **Find rides**: Browse, filter by date/location
5. **Request a seat**: Driver gets notified
6. **Manage bookings**: Accept/decline in Dashboard
7. **Chat**: Use the Chats page to message your ride groups
8. **Track history**: View past rides with "Show history" toggle

## Database

**Local Development:**
- Uses SQLite (file-based database)
- Run `npx prisma db push` to create tables
- Database file: `prisma/dev.db`

**Production:**
- Uses PostgreSQL (configured in `prisma/schema.prisma`)
- Free options: Neon, Supabase, or Railway
- Run `npx prisma db push` to create tables
- Run `npm run seed` to populate demo data
- View/edit data with `npx prisma studio`

## Deploying

### Option 1: Deploying to Vercel (Recommended for Production)

**✅ Already configured for PostgreSQL!**

When ready to deploy:
1. Get a free PostgreSQL database from [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Set `DATABASE_URL` in Vercel environment variables (PostgreSQL connection string)
3. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in Vercel
4. Deploy!
5. Run `npx prisma db push` and `npm run seed` to populate demo data

See `LAUNCH_CHECKLIST.md` for detailed deployment steps.

### Option 2: Deploying to Cloudflare Pages (Demo/Portfolio Mode)

For a portfolio demo with preseeded data (no database needed):

1. **Enable Demo Mode**
   - Set environment variable `DEMO_MODE=true` in Cloudflare Pages
   - Note: This requires updating API routes to use mock data (see below)

2. **Update API Routes** (Work in Progress)
   - API routes need to check `DEMO_MODE` and use `getMockRides()`, `getMockRideById()`, etc. from `src/lib/mock-data.ts`
   - Mock data file is ready with preseeded rides, users, vehicles, bookings

3. **Deploy**
   ```bash
   # Build and deploy
   npm run build
   # Then deploy via Cloudflare Pages dashboard or Wrangler
   ```

**Limitations of Demo Mode:**
- Data is read-only (no creating/editing rides)
- Perfect for showcasing the UI/UX
- No authentication required (uses mock session)

**Alternative for Cloudflare:** Consider using Cloudflare D1 (SQLite-compatible) for persistent data, but requires Prisma adapter updates.

## Service Area

Currently **Canada only** - location search restricted to Canadian cities and addresses.

## Supported Universities

Configured for Montreal area universities:
- McGill University (@mcgill.ca)
- Concordia University (@concordia.ca)
- Université de Montréal (@umontreal.ca)

Add more in `src/lib/allowed-domains.ts`

## License

MIT
