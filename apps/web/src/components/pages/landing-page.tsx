'use client';

/**
 * Landing Page Component
 *
 * Displays hero section and sign-in options for unauthenticated users.
 *
 * Design:
 * - Mobile-first responsive layout
 * - Clear value proposition
 * - Prominent sign-in buttons
 * - Feature highlights
 */

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { FiBriefcase, FiFileText, FiBell, FiTarget } from 'react-icons/fi';

// ---------------------------------------------------------------------------
// Feature Card Component
// ---------------------------------------------------------------------------

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Icon as={icon} boxSize={8} color="brand.500" mb={4} />
      <Heading size="sm" mb={2}>
        {title}
      </Heading>
      <Text color="gray.500" fontSize="sm">
        {description}
      </Text>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Landing Page Component
// ---------------------------------------------------------------------------

export function LandingPage() {
  const bgGradient = useColorModeValue(
    'linear(to-b, blue.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );

  // Handle sign in with providers
  const handleSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Hero Section */}
      <Container maxW="container.lg" pt={[16, 24, 32]} pb={16}>
        <VStack spacing={8} textAlign="center">
          {/* Main Heading */}
          <VStack spacing={4}>
            <Heading
              as="h1"
              size={['xl', '2xl', '3xl']}
              fontWeight="800"
              lineHeight="shorter"
            >
              Find Your Dream Job,{' '}
              <Text as="span" color="brand.500">
                Faster
              </Text>
            </Heading>
            <Text
              fontSize={['md', 'lg', 'xl']}
              color="gray.500"
              maxW="600px"
              px={4}
            >
              Upload your resume, select companies to watch, and get instant
              alerts when relevant jobs are posted.
            </Text>
          </VStack>

          {/* Sign In Buttons */}
          <VStack spacing={4} w="full" maxW="320px">
            <Button
              w="full"
              size="lg"
              leftIcon={<FaGoogle />}
              onClick={() => handleSignIn('google')}
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
              colorScheme="gray"
              variant="outline"
            >
              Continue with GitHub
            </Button>
          </VStack>

          {/* Privacy Note */}
          <Text fontSize="xs" color="gray.400">
            Your data stays private. We never share your information.
          </Text>
        </VStack>
      </Container>

      {/* Features Section */}
      <Container maxW="container.lg" pb={20}>
        <VStack spacing={12}>
          <VStack spacing={2}>
            <Heading size={['md', 'lg']} textAlign="center">
              How It Works
            </Heading>
            <Text color="gray.500" textAlign="center">
              Three simple steps to streamline your job search
            </Text>
          </VStack>

          <SimpleGrid columns={[1, 2, 4]} spacing={6} w="full">
            <FeatureCard
              icon={FiFileText}
              title="Upload Resume"
              description="AI parses your resume to understand your skills and experience."
            />
            <FeatureCard
              icon={FiTarget}
              title="Select Companies"
              description="Choose which companies you want to monitor for job openings."
            />
            <FeatureCard
              icon={FiBriefcase}
              title="AI Matching"
              description="We match your profile against new job postings automatically."
            />
            <FeatureCard
              icon={FiBell}
              title="Get Alerts"
              description="Receive instant notifications for jobs that match your skills."
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Footer */}
      <Flex
        as="footer"
        py={8}
        borderTopWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        justify="center"
      >
        <Text fontSize="sm" color="gray.500">
          Built with ❤️ for job seekers
        </Text>
      </Flex>
    </Box>
  );
}
