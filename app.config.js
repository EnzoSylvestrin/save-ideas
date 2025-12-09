import 'dotenv/config';

const easProjectId = process.env.EAS_PROJECT_ID || '';

export default {
  expo: {
    name: 'save-ideas',
    slug: 'save-ideas',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'saveideas',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.evalla.saveideas',
      infoPlist: {
        NSMicrophoneUsageDescription: 'Este app precisa acessar o microfone para gravar suas ideias de projetos.',
      },
      associatedDomains: ['applinks:saveideas.app'],
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/adaptive-icon.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
      ],
      package: 'com.evalla.saveideas',
      intentFilters: [
        {
          action: 'android.intent.action.VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'saveideas',
              host: 'quick-record',
              pathPrefix: '/',
            },
            {
              scheme: 'https',
              host: 'saveideas.app',
              pathPrefix: '/quick-record',
            },
          ],
          category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
        },
      ],
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-audio',
      './plugins/withAndroidShortcuts.js',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL || '',
      router: {},
      eas: {
        projectId: easProjectId,
      },
    },
  },
};

