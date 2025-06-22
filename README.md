# Ctrl+F

A modern platform designed specifically for developers and hackathon participants to connect, collaborate, and form meaningful relationships through shared technical interests and project experiences.

## Overview

Ctrl+F leverages GitHub profiles, project portfolios, and technical skills to create intelligent matches between developers. Users can discover potential partners through an enhanced matching algorithm that considers programming languages, project experience, educational background, and professional interests.

## Key Features

- **Smart Matching**: Algorithm-based compatibility scoring using technical skills, GitHub projects, and educational background
- **Developer Profiles**: Integration with GitHub, LinkedIn, and DevPost to showcase technical expertise
- **Hackathon Events**: Browse and join upcoming MLH hackathons with team formation capabilities
- **Real-time Messaging**: Chat with matches and coordinate hackathon participation
- **Premium Features**: Enhanced discovery and advanced matching capabilities

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query
- **Build Tool**: Vite with SWC

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account for backend services

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd swipe-wide-love
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:
```bash
npx supabase db push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database

The application uses Supabase with the following core tables:
- `profiles` - User profiles with technical skills and social links
- `swipes` - User interaction history
- `matches` - Successful matches between users
- `messages` - Real-time messaging system
- `hackathon_events` - Event listings from MLH
- `hackathon_participants` - Event participation tracking


