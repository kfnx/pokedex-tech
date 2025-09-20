import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';

// Mock react-native
jest.mock('react-native', () => ({
  useColorScheme: jest.fn()
}));

describe('useColorScheme Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return light color scheme', () => {
    const mockUseColorScheme = require('react-native').useColorScheme;
    mockUseColorScheme.mockReturnValue('light');

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
    expect(mockUseColorScheme).toHaveBeenCalled();
  });

  it('should return dark color scheme', () => {
    const mockUseColorScheme = require('react-native').useColorScheme;
    mockUseColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('dark');
    expect(mockUseColorScheme).toHaveBeenCalled();
  });

  it('should handle null color scheme', () => {
    const mockUseColorScheme = require('react-native').useColorScheme;
    mockUseColorScheme.mockReturnValue(null);

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe(null);
    expect(mockUseColorScheme).toHaveBeenCalled();
  });

  it('should re-render when color scheme changes', () => {
    const mockUseColorScheme = require('react-native').useColorScheme;
    mockUseColorScheme.mockReturnValue('light');

    const { result, rerender } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');

    // Simulate color scheme change
    mockUseColorScheme.mockReturnValue('dark');
    rerender();

    expect(result.current).toBe('dark');
  });
});