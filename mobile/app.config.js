const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch {
  /* dotenv optional in some tooling contexts */
}

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      infoPlist: {
        ...(appJson.expo.ios?.infoPlist ?? {}),
        NSAppTransportSecurity: {
          NSExceptionDomains: {
            'supabase.co': {
              NSIncludesSubdomains: true,
            },
          },
        },
      },
    },
    plugins: [...(appJson.expo.plugins ?? []), 'expo-web-browser'],
    extra: {
      ...(appJson.expo.extra ?? {}),
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
  },
};
