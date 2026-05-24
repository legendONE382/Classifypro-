// Web detection utility
export const isWeb = () => {
  try {
    return require('react-native').Platform.OS === 'web';
  } catch {
    return false;
  }
};

// Mock Location for web
export const getMockLocation = async () => {
  // Return Lagos, Nigeria coordinates for testing
  return {
    coords: {
      latitude: 6.9271,
      longitude: 3.3955,
      accuracy: 50,
    },
  };
};
