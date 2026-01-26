'use client';

/**
 * Dashboard Content Component
 *
 * Client component that renders the dashboard UI.
 * Receives data as props from the server component.
 *
 * Features:
 * - Welcome message
 * - Stats cards
 * - Recent job matches
 * - Quick actions
 */

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FiBriefcase, FiFileText, FiTarget, FiBell, FiUpload, FiPlus } from 'react-icons/fi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardContentProps {
  userName: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  helpText?: string;
  icon: React.ElementType;
  colorScheme: string;
}

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------

function StatCard({ label, value, helpText, icon, colorScheme }: StatCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const iconBgColor = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.300`);

  return (
    <Card>
      <CardBody>
        <HStack spacing={4}>
          <Box
            p={3}
            bg={iconBgColor}
            borderRadius="lg"
          >
            <Icon as={icon} boxSize={6} color={iconColor} />
          </Box>
          <Stat>
            <StatLabel color="gray.500">{label}</StatLabel>
            <StatNumber fontSize="2xl">{value}</StatNumber>
            {helpText && (
              <StatHelpText mb={0}>{helpText}</StatHelpText>
            )}
          </Stat>
        </HStack>
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Content Component
// ---------------------------------------------------------------------------

export function DashboardContent({ userName }: DashboardContentProps) {
  const cardBg = useColorModeValue('white', 'gray.800');

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Welcome Section */}
      <Box>
        <Heading size={['lg', 'xl']} mb={2}>
          {getGreeting()}, {userName.split(' ')[0]}! 👋
        </Heading>
        <Text color="gray.500">
          Here&apos;s an overview of your job search progress.
        </Text>
      </Box>

      {/* Setup Alert - Show if user hasn't completed setup */}
      <Alert
        status="info"
        variant="subtle"
        borderRadius="lg"
        flexDirection={['column', 'row']}
        alignItems={['flex-start', 'center']}
        gap={4}
      >
        <AlertIcon boxSize={6} />
        <Box flex="1">
          <AlertTitle>Complete your profile</AlertTitle>
          <AlertDescription>
            Upload your resume and select companies to start receiving job alerts.
          </AlertDescription>
        </Box>
        <HStack spacing={2}>
          <Button
            as={Link}
            href="/resume"
            size="sm"
            leftIcon={<FiUpload />}
            colorScheme="brand"
          >
            Upload Resume
          </Button>
          <Button
            as={Link}
            href="/companies"
            size="sm"
            leftIcon={<FiPlus />}
            variant="outline"
          >
            Add Companies
          </Button>
        </HStack>
      </Alert>

      {/* Stats Grid */}
      <SimpleGrid columns={[1, 2, 4]} spacing={4}>
        <StatCard
          label="Job Matches"
          value={0}
          helpText="Total matches found"
          icon={FiTarget}
          colorScheme="brand"
        />
        <StatCard
          label="New Jobs"
          value={0}
          helpText="In last 24 hours"
          icon={FiBriefcase}
          colorScheme="green"
        />
        <StatCard
          label="Companies"
          value={0}
          helpText="Being monitored"
          icon={FiFileText}
          colorScheme="purple"
        />
        <StatCard
          label="Alerts Sent"
          value={0}
          helpText="This week"
          icon={FiBell}
          colorScheme="orange"
        />
      </SimpleGrid>

      {/* Recent Matches Section */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Recent Matches</Heading>
          <Button
            as={Link}
            href="/jobs"
            size="sm"
            variant="ghost"
            rightIcon={<FiBriefcase />}
          >
            View All
          </Button>
        </HStack>

        <Card>
          <CardBody>
            <VStack spacing={4} py={8}>
              <Icon as={FiBriefcase} boxSize={12} color="gray.300" />
              <VStack spacing={1}>
                <Text fontWeight="500">No job matches yet</Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Upload your resume and add companies to watch to start
                  receiving job matches.
                </Text>
              </VStack>
              <Button
                as={Link}
                href="/resume"
                colorScheme="brand"
                size="sm"
              >
                Get Started
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box>
        <Heading size="md" mb={4}>Quick Actions</Heading>
        <SimpleGrid columns={[1, 2, 3]} spacing={4}>
          <Card
            as={Link}
            href="/resume"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack spacing={4}>
                <Icon as={FiFileText} boxSize={6} color="brand.500" />
                <Box>
                  <Text fontWeight="600">Manage Resume</Text>
                  <Text fontSize="sm" color="gray.500">
                    Upload or update your resume
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card
            as={Link}
            href="/companies"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack spacing={4}>
                <Icon as={FiPlus} boxSize={6} color="green.500" />
                <Box>
                  <Text fontWeight="600">Add Companies</Text>
                  <Text fontSize="sm" color="gray.500">
                    Select companies to monitor
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card
            as={Link}
            href="/settings"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack spacing={4}>
                <Icon as={FiBell} boxSize={6} color="orange.500" />
                <Box>
                  <Text fontWeight="600">Alert Settings</Text>
                  <Text fontSize="sm" color="gray.500">
                    Configure notifications
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
