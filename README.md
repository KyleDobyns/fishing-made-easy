e web application that simplifies fishing for anglers of all skill levels by providing personalized gear recommendations, weather-based insights, and private catch logging.

**Live Demo**: [https://fishing-made-easy.vercel.app/](https://fishing-made-easy.vercel.app/)

## Features

### Smart Gear Recommendations
- **Personalized suggestions** based on weather conditions, location, and target species
- **Beginner-friendly** guidance that demystifies rod selection (length, power, action)
- **Real-time adaptation** to current fishing conditions

### Private Catch Logging
- **Secure, personal database** for tracking your fishing success
- **Accurate location tracking** - no more predetermined locations miles from your actual catch
- **Pattern recognition** to help identify your most successful techniques

### Unified Weather & Tide Information
- **All-in-one dashboard** combining weather, tides, and fish activity
- **No more app switching** - everything you need in one place
- **Real-time updates** for optimal fishing conditions

### Location-Based Insights
- **Local fishing spots** with community-verified information
- **Species-specific recommendations** for your area
- **Tide charts and patterns** for your exact location

## Why Fishing Made Easy?

Research shows that anglers using apps have a **40% higher success rate**, but most anglers waste time switching between 3-5 different apps for weather, tides, and fishing information. We've consolidated everything into one intuitive platform.

### Problems We Solve:
- ❌ **App Fragmentation**: No more juggling multiple apps
- ❌ **Gear Confusion**: Clear guidance for beginners overwhelmed by equipment choices
- ❌ **Inaccurate Logging**: Precise location tracking, not predetermined spots
- ❌ **Scattered Information**: All conditions data in one unified view

## Tech Stack

- **Frontend**: Next.js, React
- **Backend**: PostgreSQL & Supabase
- **Styling**: CSS
- **Deployment**: Vercel
- **APIs**: Weather API, Tide API, Location Services

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fishing-made-easy.git
cd fishing-made-easy
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_TIDE_API_KEY=your_tide_api_key
NEXT_PUBLIC_MAPS_API_KEY=your_maps_api_key
```

5. Run the development server
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Create an Account**: Sign up to access personalized features
2. **Set Your Location**: Enable location services or manually select your fishing area
3. **Get Recommendations**: View gear suggestions based on current conditions
4. **Log Your Catches**: Track your success with accurate location data
5. **Plan Your Trip**: Check unified weather and tide information

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
