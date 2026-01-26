'use client';

/**
 * Sign In Content Component
 *
 * Client component for the sign-in page UI.
 *
 * Features:
 * - OAuth provider buttons
 * - Error display
 * - Loading states
 * - Branded design
 */

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  useColorModeValue,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SignInContentProps {
  error?: string;
  callbackUrl: string;
}

// ---------------------------------------------------------------------------
// Error Messages
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Error starting the OAuth sign-in process.',
  OAuthCallback: 'Error during the OAuth callback.',
  OAuthCreateAccount: 'Could not create account with OAuth provider.',
  EmailCreateAccount: 'Could not create account with email.',
  Callback: 'Error during the callback process.',
  OAuthAccountNotLinked: 'This email is already associated with another provider.',
  EmailSignin: 'Error sending the sign-in email.',
  CredentialsSignin: 'Sign in failed. Check your credentials.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An error occurred during sign-in. Please try again.',
};

// ---------------------------------------------------------------------------
// Sign In Content Component
// ---------------------------------------------------------------------------

export function SignInContent({ error, callbackUrl }: SignInContentProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Handle provider sign-in
  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  // Get error message
  const errorMessage = error ? ERROR_MESSAGES[error] || ERROR_MESSAGES.Default : null;

  return (
    <Box minH="100vh" bg={bgColor} py={[12, 16, 20]}>
      <Container maxW="400px">
        <VStack spacing={8}>
          {/* Logo */}
          <Link href="/">
            <Text fontSize="2xl" fontWeight="800" color="brand.500">
              JobAlerter
            </Text>
          </Link>

          {/* Sign In Card */}
          <Box
            w="full"
            bg={cardBg}
            p={8}
            borderRadius="xl"
            shadow="lg"
          >
            <VStack spacing={6}>
              {/* Header */}
              <VStack spacing={2}>
                <Heading size="lg">Welcome back</Heading>
                <Text color="gray.500" textAlign="center">
                  Sign in to continue to Job Alerter
                </Text>
              </VStack>

              {/* Error Alert */}
              {errorMessage && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* OAuth Buttons */}
              <VStack spacing={3} w="full">
                <Button
                  w="full"
                  size="lg"
                  leftIcon={<FaGoogle />}
                  onClick={() => handleSignIn('google')}
                  isLoading={isLoading === 'google'}
                  loadingText="Signing in..."
                  colorScheme="red"
                  variant="outline"
                >
                  Continue with Google
                </Button>

                <Button
                  w="full"
                  size="lg"
                  leftIcon={<FaGithub />}
                  onClick={() => handleSignIn('github')}
                  isLoading={isLoading === 'github'}
                  loadingText="Signing in..."
                  colorScheme="gray"
                  variant="outline"
                >
                  Continue with GitHub
                </Button>
              </VStack>

              <Divider />

              {/* Terms */}
              <Text fontSize="xs" color="gray.500" textAlign="center">
                By signing in, you agree to our{' '}
                <ChakraLink color="brand.500">Terms of Service</ChakraLink>
                {' '}and{' '}
                <ChakraLink color="brand.500">Privacy Policy</ChakraLink>.
              </Text>
            </VStack>
          </Box>

          {/* Back Link */}
          <Link href="/">
            <Text fontSize="sm" color="gray.500" _hover={{ color: 'brand.500' }}>
              ← Back to home
            </Text>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
