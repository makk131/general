# Gebrian Practice - Mobile App Installation Guide

This guide will help you get the mobile app running on your iPhone or iPad.

## Quick Start (Easiest Method)

### Using Expo Go (No build required)

1. **Install Expo Go** on your iPhone/iPad from the App Store

2. **On your computer**, navigate to the mobile-app folder and install dependencies:
   ```bash
   cd mobile-app
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Scan the QR code** that appears with your iPhone camera

5. The app will open in Expo Go and you can start using it immediately!

## Features

### ✨ What You Can Do

- **Add Practice Segments**: Add technical items (scales, etudes) and musical passages
- **Automatic Scheduling**: Passages move through the Gebrian calendar automatically
  - 3 days on → 1 off → 1 on → 1 off → 1 on → 7 off → 3 days on → 14 off → 3 days on
- **Performance Ready Bucket**: Completed passages move here automatically
- **Manual Skip**: Don't need all 3 days? Skip to the next phase with one tap
- **Daily Practice Blocks**: Get 3 optimized 25-minute practice blocks each day
- **Practice Journal**: Reflect on your sessions
- **Beautiful UI**: Dark theme with smooth animations and haptic feedback

### 📱 How to Use

1. **Start on the Passages tab**: Add your musical passages
2. **Add Technical Items**: Add scales, warm-ups, etudes in the Technical tab
3. **Practice**: Go to Practice tab to see your daily blocks
4. **Complete Segments**: Tap "Mark Complete" as you finish each segment
5. **Skip Ahead**: In Passages tab, tap "Skip Phase" if you're ready to move forward
6. **Reflect**: Use the Journal tab to record your thoughts

## Building a Standalone App (Advanced)

If you want to install the app permanently on your device without Expo Go:

### Prerequisites
- Apple Developer Account ($99/year)
- EAS CLI installed: `npm install -g eas-cli`

### Steps

1. **Login to Expo**:
   ```bash
   eas login
   ```

2. **Configure the build**:
   ```bash
   cd mobile-app
   eas build:configure
   ```

3. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

4. **Choose your distribution method**:
   - TestFlight (internal testing)
   - App Store (public release)
   - Ad-hoc (install on specific devices)

5. **Wait for the build** (usually 15-30 minutes)

6. **Download and install** following Expo's instructions

## Troubleshooting

### "Cannot connect to Metro bundler"
- Make sure your phone and computer are on the same WiFi network
- Try restarting the Metro bundler: Press `r` in the terminal

### "Dependencies not found"
```bash
cd mobile-app
rm -rf node_modules
npm install
```

### "Expo Go crashes on startup"
- Update Expo Go to the latest version from App Store
- Clear Expo Go cache: Settings → Clear Cache in Expo Go

### Building Issues
- Make sure you have the latest EAS CLI: `npm install -g eas-cli@latest`
- Check your Apple Developer account is active
- Verify your bundle identifier is unique

## iPad Optimization

The app works great on iPad! The larger screen shows more content and the UI scales beautifully.

## Data Storage

All your data (passages, technical items, practice history) is stored locally on your device using AsyncStorage. Your data persists between app restarts.

## Need Help?

- Check the detailed README in the `mobile-app/` folder
- Review the web app in the root directory for feature reference
- Make sure you're using Node.js v18 or higher

## What's Different from the Web Version?

The mobile app has the same core features plus:
- ✅ Native iOS experience
- ✅ Haptic feedback
- ✅ Optimized touch targets
- ✅ Smooth native animations
- ✅ Works offline
- ✅ Full iPad support

The web version includes a metronome and more advanced editing features. Both versions share the same Gebrian calendar logic.

---

Enjoy your practice sessions! 🎵
