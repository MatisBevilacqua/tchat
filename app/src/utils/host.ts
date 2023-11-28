import Constants from 'expo-constants';

const { manifest2 } = Constants;

let tempHost = manifest2 !== null
  ? manifest2?.extra?.expoGo?.debuggerHost?.split(":").shift()
  : process.env.EXPO_PUBLIC_HOST;

// if (process.env.EXPO_PUBLIC_HOST && process.env.EXPO_PUBLIC_USE_ENV_HOST === "true") {
//   tempHost = process.env.EXPO_PUBLIC_HOST;
// }

export const host = tempHost;
