import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecodex.nature',
  appName: 'EcoDex',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2E7D32",
      showSpinner: false,
      androidSpinnerStyle: "large",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
