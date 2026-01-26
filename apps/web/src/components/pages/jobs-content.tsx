'use client';

/**
 * Jobs Content Component
 *
 * Displays job matches with filtering and sorting capabilities.
 *
 * Features:
 * - Filter by score, company, work mode
 * - Sort by match score, date posted
 * - Job cards with match details
 * - Empty state when no matches
 */

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Tag,
  Badge,
  Button,
  Icon,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FiBriefcase, FiMapPin, FiClock, FiExternalLink } from 'react-icons/fi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  matchScore: number;
  postedAt: string;
  url: string;
  matchedSkills: string[];
  missingSkills: string[];
}

// ---------------------------------------------------------------------------
// Job Card Component
// ---------------------------------------------------------------------------

interface JobCardProps {
  job: JobMatch;
}

function JobCard({ job }: JobCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');

  // Get color based on match score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  // Get work mode badge color
  const getWorkModeColor = (mode: string) => {
    switch (mode) {
      case 'remote':
        return 'green';
      case 'hybrid':
        return 'blue';
      case 'onsite':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <Flex justify="space-between" align="flex-start" gap={4}>
            <Box flex="1">
              <Heading size="sm" mb={1}>
                {job.title}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                {job.company}
              </Text>
            </Box>
            <Badge
              colorScheme={getScoreColor(job.matchScore)}
              fontSize="md"
              px={3}
              py={1}
              borderRadius="full"
            >
              {job.matchScore}% Match
            </Badge>
          </Flex>

          {/* Meta info */}
          <HStack spacing={4} flexWrap="wrap">
            <HStack color="gray.500" fontSize="sm">
              <Icon as={FiMapPin} />
              <Text>{job.location}</Text>
            </HStack>
            <Tag size="sm" colorScheme={getWorkModeColor(job.workMode)}>
              {job.workMode}
            </Tag>
            <HStack color="gray.500" fontSize="sm">
              <Icon as={FiClock} />
              <Text>{job.postedAt}</Text>
            </HStack>
          </HStack>

          {/* Skills */}
          <Box>
            <Text fontSize="xs" color="gray.500" mb={2}>
              Matched Skills
            </Text>
            <HStack flexWrap="wrap" gap={2}>
              {job.matchedSkills.map((skill) => (
                <Tag key={skill} size="sm" colorScheme="green" variant="subtle">
                  {skill}
                </Tag>
              ))}
            </HStack>
          </Box>

          {job.missingSkills.length > 0 && (
            <Box>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Skills to Develop
              </Text>
              <HStack flexWrap="wrap" gap={2}>
                {job.missingSkills.map((skill) => (
                  <Tag key={skill} size="sm" colorScheme="orange" variant="subtle">
                    {skill}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}

          {/* Actions */}
          <HStack pt={2}>
            <Button
              as="a"
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              colorScheme="brand"
              rightIcon={<FiExternalLink />}
              flex={1}
            >
              View Job
            </Button>
            <Button size="sm" variant="outline" flex={1}>
              Save
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Jobs Content Component
// ---------------------------------------------------------------------------

export function JobsContent() {
  // TODO: Replace with real data from props
  const jobs: JobMatch[] = [];

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Heading size={['lg', 'xl']} mb={2}>
          Job Matches
        </Heading>
        <Text color="gray.500">
          Jobs that match your skills and preferences
        </Text>
      </Box>

      {/* Filters */}
      <Card>
        <CardBody>
          <SimpleGrid columns={[1, 2, 4]} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input placeholder="Search jobs..." />
            </InputGroup>

            <Select placeholder="Match Score">
              <option value="80">80%+ Match</option>
              <option value="60">60%+ Match</option>
              <option value="all">All Matches</option>
            </Select>

            <Select placeholder="Work Mode">
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </Select>

            <Select placeholder="Sort By">
              <option value="score">Match Score</option>
              <option value="date">Date Posted</option>
              <option value="company">Company</option>
            </Select>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Job List */}
      {jobs.length === 0 ? (
        <Card>
          <CardBody>
            <VStack spacing={4} py={12}>
              <Icon as={FiBriefcase} boxSize={16} color="gray.300" />
              <VStack spacing={1}>
                <Text fontWeight="600" fontSize="lg">
                  No job matches yet
                </Text>
                <Text color="gray.500" textAlign="center" maxW="400px">
                  Upload your resume and add companies to watch. We&apos;ll
                  notify you when relevant jobs are posted.
                </Text>
              </VStack>
              <HStack spacing={4}>
                <Button colorScheme="brand">Upload Resume</Button>
                <Button variant="outline">Add Companies</Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={[1, 1, 2]} spacing={4}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}
