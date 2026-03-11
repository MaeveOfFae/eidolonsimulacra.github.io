import { useContext } from 'react';

import { ThemeContext } from './ThemeContext.shared';

export function useThemePreview() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemePreview must be used within ThemeProvider');
  }

  return context;
}