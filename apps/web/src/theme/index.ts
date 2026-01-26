/**
 * Chakra UI Theme Configuration
 *
 * Defines the visual identity of Job Alerter:
 * - Color palette with brand colors
 * - Typography with readable fonts
 * - Component overrides for consistency
 * - Dark mode support
 *
 * @see https://chakra-ui.com/docs/styled-system/theme
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// ---------------------------------------------------------------------------
// Color Mode Configuration
// ---------------------------------------------------------------------------

const config: ThemeConfig = {
  initialColorMode: 'system', // Respect user's system preference
  useSystemColorMode: true,
};

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

const colors = {
  // Brand colors - Professional blue with warm accents
  brand: {
    50: '#e6f3ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0073e6', // Primary brand color
    600: '#005cb8',
    700: '#00448a',
    800: '#002d5c',
    900: '#00162e',
  },

  // Success colors for match scores
  success: {
    50: '#e6fff0',
    100: '#b3ffd1',
    200: '#80ffb3',
    300: '#4dff94',
    400: '#1aff75',
    500: '#00e65c',
    600: '#00b849',
    700: '#008a37',
    800: '#005c24',
    900: '#002e12',
  },

  // Warning colors for partial matches
  warning: {
    50: '#fff8e6',
    100: '#ffebb3',
    200: '#ffde80',
    300: '#ffd14d',
    400: '#ffc41a',
    500: '#e6ad00',
    600: '#b88a00',
    700: '#8a6800',
    800: '#5c4500',
    900: '#2e2300',
  },
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

const fonts = {
  // Clean, readable fonts
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
};

// ---------------------------------------------------------------------------
// Component Overrides
// ---------------------------------------------------------------------------

const components = {
  // Button - Consistent styling across the app
  Button: {
    defaultProps: {
      colorScheme: 'brand',
    },
    variants: {
      // Solid button with better contrast
      solid: {
        fontWeight: '600',
      },
      // Ghost button for secondary actions
      ghost: {
        fontWeight: '500',
      },
    },
  },

  // Card - Consistent card styling
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        overflow: 'hidden',
      },
    },
  },

  // Input - Better form inputs
  Input: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },

  // Select - Consistent with inputs
  Select: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },

  // Heading - Readable headings
  Heading: {
    baseStyle: {
      fontWeight: '700',
    },
  },
};

// ---------------------------------------------------------------------------
// Global Styles
// ---------------------------------------------------------------------------

const styles = {
  global: {
    // Smooth scrolling
    html: {
      scrollBehavior: 'smooth',
    },
    // Better focus outlines for accessibility
    '*:focus-visible': {
      outline: '2px solid',
      outlineColor: 'brand.500',
      outlineOffset: '2px',
    },
  },
};

// ---------------------------------------------------------------------------
// Breakpoints (Mobile-First)
// ---------------------------------------------------------------------------

const breakpoints = {
  base: '0em', // 0px - Mobile
  sm: '30em', // 480px - Large mobile
  md: '48em', // 768px - Tablet
  lg: '62em', // 992px - Desktop
  xl: '80em', // 1280px - Large desktop
  '2xl': '96em', // 1536px - Extra large
};

// ---------------------------------------------------------------------------
// Export Theme
// ---------------------------------------------------------------------------

export const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles,
  breakpoints,
});

export default theme;
