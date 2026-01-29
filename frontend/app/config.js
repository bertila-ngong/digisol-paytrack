// 🔌 BACKEND API CONFIGURATION
// Update this with your Flask backend URL
// For iOS Simulator: http://127.0.0.1:5000
// For Android Emulator: http://10.0.2.2:5000
// For Physical Device: Use your machine's IP address, e.g., http://192.168.x.x:5000

const CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:5000', // Flask backend running on port 5000 (without /api suffix)
  API_TIMEOUT: 10000,
  APP_NAME: 'DigiSol PayTrack',
  COMPANY_NAME: 'DigiSol',
  REMINDER_DAYS_BEFORE: 3,
  CHECK_REMINDERS_INTERVAL: 86400000,
};

export default CONFIG;