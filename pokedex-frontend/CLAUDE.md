# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo app that serves as a Pokédex frontend, connecting to a custom backend API. The app uses Expo Router for navigation with file-based routing, TypeScript for type safety, and React Native Reanimated for animations.

## Development Commands

```bash
# Start development server
npm start
# or
npx expo start

# Platform-specific development
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser

# Code quality
npm run lint       # ESLint linting

# Reset project (removes example code)
npm run reset-project
```

## Architecture

### Routing Structure
- Uses Expo Router with file-based routing
- Main navigation: `app/(tabs)/_layout.tsx` defines bottom tabs
- Three main tabs: Pokédex (`index`), Search (`explore`), Compare (`compare`)
- Dynamic routes: `app/pokemon/[id].tsx` for individual Pokémon details
- Root layout: `app/_layout.tsx` handles theme provider and navigation stack

### API Integration
- Central API service: `services/api.ts`
- Backend communication through `pokeAPI` singleton
- API base URL configurable via `EXPO_PUBLIC_API_URL` environment variable
- Comprehensive TypeScript interfaces for Pokémon data structures
- Built-in error handling and request timeouts (8 seconds default)

### Component Architecture
- Themed components using React Navigation's theme system (`themed-text.tsx`, `themed-view.tsx`)
- Custom UI components in `components/ui/` (TabView, IconSymbol)
- Pokémon-specific components in `components/pokemon/` with tab-based detail views
- Reusable PokemonCard component with type color coding and badges

### Key Features
- Dark/light theme support with automatic detection
- Haptic feedback on tab navigation (`haptic-tab.tsx`)
- Image optimization using Expo Image
- Type effectiveness visualization
- Pokémon comparison functionality
- Search with filtering by type and generation
- Lazy loading with pagination support

### Styling Approach
- React Native StyleSheet for component styling
- Hardcoded colors in components (considers refactoring to theme constants)
- Type-specific color mapping for Pokémon types
- Responsive design considerations for tablet layouts

### Environment Setup
- Uses `.env` file for environment variables
- Expo development build compatible
- New architecture enabled (`newArchEnabled: true`)
- Typed routes experiment enabled for better TypeScript support

## Backend Integration
The app expects a backend API running on `localhost:3000` by default. The API should provide:
- `/api/pokemon` - Paginated Pokémon list with filtering
- `/api/pokemon/:id` - Individual Pokémon details
- `/api/pokemon/search` - Search functionality
- `/api/pokemon/compare` - Pokémon comparison
- `/api/types` - Pokémon types list
- `/api/abilities` - Abilities list
- `/health` - Health check endpoint