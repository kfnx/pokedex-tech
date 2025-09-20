// Import testing utilities (extend-expect is deprecated in newer versions)

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