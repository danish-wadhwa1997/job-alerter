'use client';

/**
 * App Shell Component
 *
 * Provides the main layout structure for authenticated pages:
 * - Navbar at top
 * - Main content area
 * - Responsive padding
 *
 * Usage:
 * <AppShell>
 *   <YourPageContent />
 * </AppShell>
 */

import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import { Navbar } from './navbar';

interface AppShellProps {
  children: React.ReactNode;
  maxW?: string;
}

export function AppShell({ children, maxW = 'container.xl' }: AppShellProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Fixed navbar */}
      <Navbar />

      {/* Main content with responsive padding */}
      <Container
        as="main"
        maxW={maxW}
        py={[4, 6, 8]}
        px={[4, 6, 8]}
      >
        {children}
      </Container>
    </Box>
  );
}
