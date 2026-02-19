// Theme configuration for Benefills
// Easy to modify for different themes

export const themes = {
  default: {
    name: 'Benefills Medical-Grade',
    colors: {
      // Primary - Sage Green (matches benefills.com)
      primary: '#3b825f',
      primaryHover: '#317352',
      primaryLight: '#5da67e',

      // Secondary
      secondary: '#f5f5f5',
      secondaryForeground: '#1a1a1a',

      // Accent colors
      accent: '#3b825f',
      accentLight: '#e8f4ef',

      // Neutral colors
      background: '#ffffff',
      foreground: '#1a1a1a',
      muted: '#f5f5f5',
      mutedForeground: '#6b6b6b',

      // Status colors
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',

      // Border and dividers
      border: '#e5e5e5',
      ring: '#3b825f',
    },

    // Typography
    fonts: {
      heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    // Spacing
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },

    // Border radius
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
  },

  // Example alternate theme (for future use)
  sage: {
    name: 'Benefills Sage',
    colors: {
      primary: '#6FA78E',
      primaryHover: '#5d8e76',
      primaryLight: '#8bc0a6',
      accent: '#6FA78E',
      accentLight: '#e8f4ef',
      // ... rest would be similar structure
    },
  },
};

// Active theme (change this to switch themes)
export const activeTheme = themes.default;

// Helper function to get CSS variables
export const getThemeCSSVariables = (theme = activeTheme) => {
  return {
    '--color-primary': theme.colors.primary,
    '--color-primary-hover': theme.colors.primaryHover,
    '--color-primary-light': theme.colors.primaryLight,
    '--color-secondary': theme.colors.secondary,
    '--color-secondary-foreground': theme.colors.secondaryForeground,
    '--color-accent': theme.colors.accent,
    '--color-accent-light': theme.colors.accentLight,
    '--color-background': theme.colors.background,
    '--color-foreground': theme.colors.foreground,
    '--color-muted': theme.colors.muted,
    '--color-muted-foreground': theme.colors.mutedForeground,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--color-info': theme.colors.info,
    '--color-border': theme.colors.border,
    '--color-ring': theme.colors.ring,
    '--font-heading': theme.fonts.heading,
    '--font-body': theme.fonts.body,
  };
};

export default activeTheme;
