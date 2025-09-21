// Setup testing environment
require('@testing-library/jest-native/extend-expect');

// Mock expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {},
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock react-native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock react-native core modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native-web');
  return {
    ...RN,
    StyleSheet: {
      ...RN.StyleSheet,
      hairlineWidth: 1,
    },
    Platform: {
      OS: 'web',
      select: jest.fn((obj) => obj.web || obj.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});