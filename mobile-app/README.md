# Gebrian Practice - Mobile App

A beautiful, elegant mobile app for iPhone and iPad that helps musicians practice using the Gebrian calendar (spaced repetition system).

## Features

- **Intelligent Practice Scheduling**: Automatically moves passages through the Gebrian calendar (3 on, 1 off, 1 on, 1 off, 1 on, 1 off, week off, 3 on, 2 weeks off)
- **Performance Ready Bucket**: Passages automatically move into a performance-ready state after completing all phases
- **Manual Phase Advancement**: Skip to the next section if you don't need all 3 days of practice
- **Daily Practice Blocks**: Generate 3 x 25-minute practice blocks with intelligent interleaving
- **Technical Items**: Add scales, etudes, and warm-ups that repeat daily
- **Musical Passages**: Add pieces that follow the spaced repetition schedule
- **Practice Journal**: Reflect on your practice sessions
- **Beautiful UI**: Modern, elegant design with smooth animations and haptic feedback
- **Data Persistence**: All your data is saved locally on your device

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- iOS Simulator (Mac only) or physical iOS device
- Expo Go app (for testing on physical devices)

### Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running on iOS Simulator (Mac only)

```bash
npm run ios
```

### Running on Physical Device

1. Install the Expo Go app from the App Store
2. Run `npm start`
3. Scan the QR code with your iPhone camera
4. The app will open in Expo Go

## Building for Production

### Option 1: Build with EAS (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Follow the prompts to create a build. You can:
   - Build for the App Store
   - Build for TestFlight
   - Build an ad-hoc IPA for testing

### Option 2: Export for Web (Progressive Web App)

```bash
npm run web
```

Then build:
```bash
npx expo export:web
```

## App Structure

```
mobile-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Practice screen
│   │   ├── passages.tsx   # Passages management
│   │   ├── technical.tsx  # Technical items
│   │   └── journal.tsx    # Practice journal
│   └── _layout.tsx        # Root layout
├── utils/                 # Business logic
│   ├── srsScheduler.ts    # Spaced repetition system
│   ├── blockGenerator.ts  # Practice block generation
│   ├── storage.ts         # AsyncStorage wrapper
│   └── AppContext.tsx     # Global state management
├── types/                 # TypeScript types
│   └── index.ts
├── assets/                # Images and icons
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Key Features Explained

### Gebrian Calendar (SRS Schedule)

The app implements a sophisticated spaced repetition schedule for musical passages:

1. **Phase 0**: 3 days on (Initial Learning)
2. **Phase 1**: 1 day off
3. **Phase 2**: 1 day on (Review)
4. **Phase 3**: 1 day off
5. **Phase 4**: 1 day on (Review)
6. **Phase 5**: 7 days off (Extended Rest)
7. **Phase 6**: 3 days on (Reinforcement)
8. **Phase 7**: 14 days off (Long-term Rest)
9. **Phase 8**: 3 days on (Final Review)
10. **Performance**: Moves to performance-ready bucket

### Manual Phase Skip

If you feel confident with a passage and don't need all 3 days of practice, you can:
1. Go to the Passages tab
2. Find the passage in the Active list
3. Tap "Skip Phase"
4. The passage will advance to the next section of the schedule

### Practice Blocks

The app generates 3 practice blocks of ~25 minutes each:
- Intelligently interleaves technical items and passages
- Prioritizes passages that are due today
- Ensures variety and repetition for optimal learning

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **Expo**: Development toolchain
- **Expo Router**: File-based navigation
- **AsyncStorage**: Local data persistence
- **React Native Reanimated**: Smooth animations
- **Expo Haptics**: Tactile feedback
- **Expo Linear Gradient**: Beautiful gradients
- **TypeScript**: Type safety

## Color Scheme

- **Primary**: Indigo (#6366F1)
- **Secondary**: Purple (#8B5CF6)
- **Background**: Dark blue (#0F172A)
- **Cards**: Slate (#1E293B)
- **Success**: Green (#10B981)
- **Technical Items**: Blue (#3B82F6)
- **Passages**: Green (#22C55E)
- **Performance**: Amber (#F59E0B)

## Support

For issues or questions, please check the web version at the root directory or contact support.

## License

MIT License - See LICENSE file for details
