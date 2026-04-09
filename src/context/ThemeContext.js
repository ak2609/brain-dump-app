import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { loadSettings } from '../storage/taskStorage';

const lightColors = {
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#F3F4F6',
  borderDark: '#E5E7EB',
  primary: '#4F46E5',
  primaryMuted: '#E0E7FF',
  danger: '#EF4444',
  dangerMuted: '#FEE2E2',
  success: '#059669',
  successMuted: '#D1FAE5',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  interactive: '#E5E7EB',
  inputBackground: '#FFFFFF',
  shadow: '#000000',
};

const darkColors = {
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#374151',
  borderDark: '#4B5563',
  primary: '#818CF8', // Lighter indigo for dark mode contrast
  primaryMuted: '#3730A3',
  danger: '#F87171',
  dangerMuted: '#7F1D1D',
  success: '#34D399',
  successMuted: '#064E3B',
  warning: '#FBBF24',
  warningMuted: '#78350F',
  interactive: '#374151',
  inputBackground: '#1F2937',
  shadow: '#000000',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'system', 'light', 'dark'
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await loadSettings();
      if (data && data.themeMode) {
        setThemeMode(data.themeMode);
      }
      setIsLoaded(true);
    })();
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) return null; // Avoid flicker

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
