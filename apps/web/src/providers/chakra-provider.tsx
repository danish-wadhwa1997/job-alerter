'use client';

/**
 * Chakra UI Provider
 *
 * Wraps the app with Chakra UI's theme provider.
 * Must be a client component as it uses React context.
 *
 * Features:
 * - Theme configuration
 * - Color mode management (dark/light)
 * - CSS reset for consistency
 */

import { ChakraProvider as ChakraBaseProvider, ColorModeScript } from '@chakra-ui/react';
import { theme } from '@/theme';

interface ChakraProviderProps {
  children: React.ReactNode;
}

export function ChakraProvider({ children }: ChakraProviderProps) {
  return (
    <ChakraBaseProvider theme={theme}>
      {children}
    </ChakraBaseProvider>
  );
}

/**
 * Color mode script to prevent flash of wrong color mode
 * Insert this in the <head> of the document
 */
export function ColorModeScriptComponent() {
  return <ColorModeScript initialColorMode={theme.config.initialColorMode} />;
}
