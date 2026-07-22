import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.markdias.rewardchart',
  appName: 'Reward Chart',
  webDir: 'dist',
  server: {
    iosScheme: 'https',
    androidScheme: 'https'
  }
};

export default config;
