# Gym Tracker App

A React Native/Expo app for tracking workouts with support for Google Sheets integration.

## Features

- 📱 Cross-platform mobile app (iOS/Android)
- 💪 Workout tracking with exercises and sets
- 📊 Statistics and progress tracking
- ⚙️ Customizable settings (weight units)
- 📊 Google Sheets integration for data management
- 🎨 Modern, intuitive UI with swipe gestures

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Google Cloud Platform account (for Google Sheets API)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Gym-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional dependencies for Google Sheets integration**
   ```bash
   npm install axios
   ```

## Google Sheets Setup

This app requires a Google Sheets integration to work properly. Follow these steps to set it up:

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Set up your data structure with headers (example):
   ```
   Workout Name | Exercises | Sets | Reps
   Push Day     | Bench Press, Push-ups | 3 | 8-12
   Pull Day     | Deadlift, Rows | 3 | 8-12
   ```

### 2. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 3. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Google Sheets API only

### 4. Configure the App

1. **Copy the constants template:**
   ```bash
   cp services/constants.example.ts services/constants.ts
   ```

2. **Update `services/constants.ts` with your values:**
   ```typescript
   export const GOOGLE_SHEETS_CONFIG = {
     API_KEY: 'your_actual_api_key_here',
     SPREADSHEET_ID: 'your_spreadsheet_id_from_url',
     SHEET_NAME: 'Sheet1', // or your sheet name
   };
   ```

3. **Get your Spreadsheet ID:**
   - Open your Google Sheet
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 5. Alternative Setup Methods

#### Option A: Google Apps Script (Recommended for beginners)
1. In your Google Sheet, go to "Extensions" > "Apps Script"
2. Create a web app that returns your data as JSON
3. Deploy it and copy the web app URL
4. Add it to `services/constants.ts`:
   ```typescript
   export const APPS_SCRIPT_URL = 'your_apps_script_web_app_url';
   ```

#### Option B: CSV Export
1. In your Google Sheet, go to "File" > "Share" > "Publish to web"
2. Choose "Entire Document" and "CSV" format
3. Copy the published URL
4. Add it to `services/constants.ts`:
   ```typescript
   export const CSV_URL = 'your_published_csv_url';
   ```

## Running the App

1. **Start the development server**
   ```bash
   npx expo start
   ```

2. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
Gym-Tracker/
├── app/                    # Main app screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── home/          # Home screen
│   │   ├── workout/       # Workout tracking screen
│   │   ├── statistics/    # Statistics and progress
│   │   └── settings/      # App settings
├── components/            # Reusable UI components
├── contexts/              # React contexts (settings, etc.)
├── services/              # External service integrations
│   ├── constants.ts       # API keys and configuration (untracked)
│   ├── googleSheets.ts    # Google Sheets integration
│   └── index.ts           # Service exports
├── constants/             # App constants and colors
└── assets/                # Images, fonts, etc.
```

## Security Notes

- The `services/constants.ts` file is gitignored to protect your API keys
- Never commit API keys or sensitive configuration to version control
- Consider using environment variables for production deployments

## Troubleshooting

### Google Sheets API Issues
- Ensure your API key is correct and has proper permissions
- Check that the Google Sheets API is enabled in your Google Cloud project
- Verify your spreadsheet ID is correct
- Make sure your Google Sheet is accessible (not private)

### App Issues
- Clear Expo cache: `npx expo start --clear`
- Reset Metro bundler: `npx expo start --reset-cache`
- Check that all dependencies are installed: `npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here] 