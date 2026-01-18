# 📚 Gebrian Practice App

A beautiful, elegant mobile application for managing practice segments through the Gebrian calendar system. Built with React Native and Expo SDK 54.

## ✨ Features

- **Gebrian Calendar System**: Automatically manages practice segments through the proven Gebrian practice schedule
- **Beautiful UI**: Modern, gradient-based design with smooth animations
- **Performance Ready Bucket**: Segments automatically move to performance-ready after 3 complete cycles
- **Manual Advancement**: Skip ahead if you don't need all practice days in a section
- **Cross-Platform**: Works on iPhone, iPad, and Android devices
- **Offline Support**: All data stored locally using AsyncStorage

## 📱 Gebrian Calendar Pattern

The app follows this practice schedule for each segment:

1. **3 practice days**
2. 1 rest day
3. **1 practice day**
4. 1 rest day
5. **1 practice day**
6. 1 week rest (7 days)
7. **3 practice days**
8. 2 weeks rest (15 days)
9. **Repeat cycle**

After **3 complete cycles** (approximately 99 days), segments automatically move to the **Performance Ready** bucket.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo Go app installed on your phone ([iOS](https://apps.apple.com/app/apple-store/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. Navigate to the app directory:
```bash
cd gebrian-practice-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with:
   - **iPhone/iPad**: Camera app
   - **Android**: Expo Go app

## 📖 How to Use

### Adding a Practice Segment

1. Tap the **+** button on the home screen
2. Enter the name of your piece or passage (e.g., "Bach Prelude in C")
3. Tap "Add Segment"
4. Your segment will start at Day 1 of the Gebrian cycle

### Advancing Through Practice Days

Each segment card shows:
- Current cycle number
- Current section (e.g., "First 3-Day Practice")
- Progress through the cycle
- Days until next practice

**Two ways to advance:**

1. **✓ Complete Practice** - Advances to the next practice day
2. **Skip to Next →** - Skips to the next section (if you don't need all days)

### Performance Ready Bucket

- Tap the **"Ready"** tab at the bottom to view performance-ready segments
- Segments automatically move here after 3 complete cycles
- View stats like cycles completed and days in training

## 🎨 Features

### Visual Calendar

- See the entire Gebrian calendar pattern at a glance
- Practice days highlighted in purple
- Current day highlighted in orange
- Rest days shown in gray

### Automatic Progression

- Segments track their position in the cycle automatically
- After 8 practice days, cycle completes
- After 3 cycles, moves to Performance Ready

### Manual Control

- Skip ahead if you master a segment faster
- Delete segments you no longer need
- Pull to refresh to reload all data

## 🛠 Technical Details

- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Storage**: AsyncStorage for offline data persistence
- **UI**: Expo Linear Gradient for beautiful backgrounds
- **Safe Areas**: Proper support for notched devices

## 📁 Project Structure

```
gebrian-practice-app/
├── components/          # Reusable UI components
│   ├── SegmentCard.tsx
│   └── CalendarVisualization.tsx
├── screens/            # Main app screens
│   ├── HomeScreen.tsx
│   ├── AddSegmentScreen.tsx
│   └── PerformanceReadyScreen.tsx
├── utils/              # Utility functions
│   ├── gebrianCalendar.ts
│   └── storage.ts
├── types/              # TypeScript types
│   └── index.ts
└── App.tsx             # Main app component
```

## 🎯 Practice Tips

1. **Be Consistent**: Follow the schedule as designed for optimal results
2. **Track Multiple Pieces**: Add all pieces you're working on
3. **Use Skip Wisely**: Only skip sections when you've truly mastered the material
4. **Performance Ready**: Use this bucket for pieces ready for performance or auditions

## 🐛 Troubleshooting

### App won't load
- Make sure you're running `npm start` in the gebrian-practice-app directory
- Check that your phone is on the same WiFi network as your computer
- Try restarting the Expo Go app

### Data not persisting
- Data is stored locally on your device
- Clearing app data will reset everything
- Currently no cloud backup (future feature)

## 📝 License

This app is built for personal practice management. Feel free to use and modify as needed.

## 🙏 About the Gebrian Method

The Gebrian calendar is a practice technique that uses spaced repetition to help musicians master difficult passages efficiently. By spacing practice sessions with strategic rest periods, the method leverages the brain's natural consolidation processes.

---

Made with ❤️ for musicians everywhere
