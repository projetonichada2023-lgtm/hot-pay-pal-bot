import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.62112f1449384293b2b86f797856b0d7',
  appName: 'Conversy',
  webDir: 'dist',
  server: {
    url: 'https://62112f14-4938-4293-b2b8-6f797856b0d7.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
