'use client';

/**
 * Navigation Bar Component
 *
 * Responsive navbar with:
 * - Logo/brand
 * - Navigation links (desktop)
 * - Mobile menu (hamburger)
 * - User menu with avatar
 * - Dark mode toggle
 *
 * Mobile-first design:
 * - Hamburger menu on mobile
 * - Full nav on desktop
 */

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  useColorMode,
  Avatar,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FiHome, FiBriefcase, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  onClick?: () => void;
}

// ---------------------------------------------------------------------------
// Navigation Links Configuration
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/jobs', label: 'Jobs', icon: FiBriefcase },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

// ---------------------------------------------------------------------------
// Nav Link Component
// ---------------------------------------------------------------------------

function NavLink({ href, children, icon, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const activeColor = useColorModeValue('brand.600', 'brand.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link href={href} onClick={onClick}>
      <HStack
        px={3}
        py={2}
        rounded="md"
        color={isActive ? activeColor : undefined}
        fontWeight={isActive ? '600' : '500'}
        bg={isActive ? useColorModeValue('brand.50', 'gray.700') : 'transparent'}
        _hover={{ bg: hoverBg }}
        transition="all 0.2s"
      >
        {icon && <Icon as={icon} boxSize={5} />}
        <Text>{children}</Text>
      </HStack>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Navbar Component
// ---------------------------------------------------------------------------

export function Navbar() {
  const { data: session } = useSession();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="nav"
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex h={16} px={[4, 6, 8]} align="center" justify="space-between">
        {/* Logo */}
        <HStack spacing={4}>
          <Link href={session ? '/dashboard' : '/'}>
            <Text fontSize="xl" fontWeight="800" color="brand.500">
              JobAlerter
            </Text>
          </Link>
        </HStack>

        {/* Desktop Navigation */}
        <HStack spacing={4} display={['none', 'none', 'flex']}>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} icon={link.icon}>
              {link.label}
            </NavLink>
          ))}
        </HStack>

        {/* Right side actions */}
        <HStack spacing={2}>
          {/* Dark mode toggle */}
          <IconButton
            aria-label="Toggle dark mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
          />

          {/* User menu (desktop) */}
          {session?.user && (
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                display={['none', 'none', 'flex']}
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={session.user.name || undefined}
                    src={session.user.image || undefined}
                  />
                  <Text fontSize="sm" fontWeight="500">
                    {session.user.name?.split(' ')[0]}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiUser />}>Profile</MenuItem>
                <MenuItem icon={<FiSettings />} as={Link} href="/settings">
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<FiLogOut />}
                  onClick={() => signOut({ callbackUrl: '/' })}
                  color="red.500"
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          {/* Mobile menu button */}
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            variant="ghost"
            display={['flex', 'flex', 'none']}
          />
        </HStack>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {session?.user && (
              <HStack spacing={3}>
                <Avatar
                  size="md"
                  name={session.user.name || undefined}
                  src={session.user.image || undefined}
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600">{session.user.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {session.user.email}
                  </Text>
                </VStack>
              </HStack>
            )}
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2} mt={4}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  onClick={onClose}
                >
                  {link.label}
                </NavLink>
              ))}
              <Box pt={4} borderTopWidth="1px" mt={4}>
                <Button
                  w="full"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<FiLogOut />}
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
