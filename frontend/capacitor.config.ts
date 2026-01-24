import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vilen.remi',
  appName: 'RemiApp',
  webDir: 'dist',
  server: {
    url: 'https://wferbt.github.io/remi-suka-main/',
    cleartext: true
  }
};

export default config;  