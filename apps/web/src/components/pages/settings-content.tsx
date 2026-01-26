'use client';

/**
 * Settings Content Component
 *
 * Manages user settings and preferences.
 *
 * Sections:
 * - Profile: Name, email, avatar
 * - Job Preferences: Work mode, job type, locations
 * - Notifications: Email alerts, frequency
 * - Account: Sign out, danger zone
 */

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Button,
  Avatar,
  Divider,
  SimpleGrid,
  CheckboxGroup,
  Checkbox,
  Stack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { signOut } from 'next-auth/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsContentProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

// ---------------------------------------------------------------------------
// Settings Content Component
// ---------------------------------------------------------------------------

export function SettingsContent({ user }: SettingsContentProps) {
  const toast = useToast();
  const dangerBg = useColorModeValue('red.50', 'red.900');

  // Handle save (placeholder)
  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <Heading size={['lg', 'xl']} mb={2}>
          Settings
        </Heading>
        <Text color="gray.500">
          Manage your account and job search preferences
        </Text>
      </Box>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <Heading size="md">Profile</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Avatar */}
            <HStack spacing={4}>
              <Avatar
                size="xl"
                name={user.name}
                src={user.image || undefined}
              />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600">{user.name}</Text>
                <Text color="gray.500" fontSize="sm">
                  {user.email}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Signed in via OAuth
                </Text>
              </VStack>
            </HStack>

            <Divider />

            {/* Profile fields */}
            <SimpleGrid columns={[1, 2]} spacing={4}>
              <FormControl>
                <FormLabel>Display Name</FormLabel>
                <Input defaultValue={user.name} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input defaultValue={user.email} isReadOnly />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Job Preferences Section */}
      <Card>
        <CardHeader>
          <Heading size="md">Job Preferences</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Work Mode */}
            <FormControl>
              <FormLabel>Preferred Work Mode</FormLabel>
              <CheckboxGroup defaultValue={['remote', 'hybrid']}>
                <Stack direction={['column', 'row']} spacing={4}>
                  <Checkbox value="remote">Remote</Checkbox>
                  <Checkbox value="hybrid">Hybrid</Checkbox>
                  <Checkbox value="onsite">On-site</Checkbox>
                </Stack>
              </CheckboxGroup>
            </FormControl>

            {/* Job Type */}
            <FormControl>
              <FormLabel>Job Type</FormLabel>
              <CheckboxGroup defaultValue={['full_time']}>
                <Stack direction={['column', 'row']} spacing={4}>
                  <Checkbox value="full_time">Full-time</Checkbox>
                  <Checkbox value="part_time">Part-time</Checkbox>
                  <Checkbox value="contract">Contract</Checkbox>
                  <Checkbox value="internship">Internship</Checkbox>
                </Stack>
              </CheckboxGroup>
            </FormControl>

            {/* Minimum Match Score */}
            <FormControl>
              <FormLabel>Minimum Match Score</FormLabel>
              <Select defaultValue="70">
                <option value="90">90% and above (Very relevant)</option>
                <option value="80">80% and above (Highly relevant)</option>
                <option value="70">70% and above (Relevant)</option>
                <option value="60">60% and above (Somewhat relevant)</option>
                <option value="50">50% and above (All matches)</option>
              </Select>
            </FormControl>

            {/* Locations */}
            <FormControl>
              <FormLabel>Preferred Locations</FormLabel>
              <Input placeholder="e.g., San Francisco, New York, Remote" />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Comma-separated list of preferred locations
              </Text>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <Heading size="md">Notifications</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Box>
                <Text fontWeight="500">Email Notifications</Text>
                <Text fontSize="sm" color="gray.500">
                  Receive job alerts via email
                </Text>
              </Box>
              <Switch defaultChecked colorScheme="brand" />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <Box>
                <Text fontWeight="500">Daily Digest</Text>
                <Text fontSize="sm" color="gray.500">
                  Get a summary of new matches every day
                </Text>
              </Box>
              <Switch colorScheme="brand" />
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <Box>
                <Text fontWeight="500">Instant Alerts</Text>
                <Text fontSize="sm" color="gray.500">
                  Get notified immediately for 90%+ matches
                </Text>
              </Box>
              <Switch defaultChecked colorScheme="brand" />
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Save Button */}
      <HStack justify="flex-end">
        <Button variant="outline">Cancel</Button>
        <Button colorScheme="brand" onClick={handleSave}>
          Save Changes
        </Button>
      </HStack>

      {/* Danger Zone */}
      <Card bg={dangerBg} borderColor="red.200" borderWidth="1px">
        <CardHeader>
          <Heading size="md" color="red.500">
            Danger Zone
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Box>
                <Text fontWeight="500">Sign Out</Text>
                <Text fontSize="sm" color="gray.500">
                  Sign out of your account on this device
                </Text>
              </Box>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </HStack>

            <Divider borderColor="red.200" />

            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <Box>
                <Text fontWeight="500">Delete Account</Text>
                <Text fontSize="sm" color="gray.500">
                  Permanently delete your account and all data
                </Text>
              </Box>
              <Button colorScheme="red">Delete Account</Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
