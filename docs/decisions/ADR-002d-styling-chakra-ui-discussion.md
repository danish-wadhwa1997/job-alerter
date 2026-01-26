# ADR-002d: Styling - Chakra UI - Detailed Discussion

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Decision** | Chakra UI (mobile-first) |

---

## 📋 Context

We need a styling solution for our job alerter dashboard that:

1. **Mobile-first:** App should work great on phones
2. **Readable code:** No long class strings like Tailwind
3. **Ready components:** Don't want to build from scratch
4. **Simple design:** Clean, functional UI
5. **Fast development:** Focus on features, not design

---

## 🔍 Options Considered

### Tailwind + shadcn/ui

**Example:**
```tsx
<button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
  Submit
</button>
```

**Issues:**
- Long class strings are hard to read
- Debugging: "which class is causing this?"
- Need to build/customize components

**Verdict:** ❌ Readability concerns

---

### MUI (Material UI)

**Example:**
```tsx
<Button variant="contained" color="primary">Submit</Button>
```

**Issues:**
- Bundle size: ~200KB
- Looks like Google products (hard to customize)
- Complex theming system

**Verdict:** ❌ Too heavy, too opinionated

---

### Chakra UI ⭐ SELECTED

**Example:**
```tsx
<Button colorScheme="blue">Submit</Button>
```

**Benefits:**
- Readable, semantic components
- Mobile-first responsive syntax
- Built-in dark mode
- Lighter than MUI

**Verdict:** ✅ Best balance of features and simplicity

---

## 📱 Mobile-First Design

### Why Mobile-First?

```
User device distribution (typical):
┌─────────────────────────────────────────────────────────────────┐
│   Mobile phones:   ████████████████████████████████  60%        │
│   Tablets:         ██████████                        20%        │
│   Desktops:        ██████████                        20%        │
└─────────────────────────────────────────────────────────────────┘

Start with mobile, enhance for larger screens!
```

### Chakra's Mobile-First Syntax

```tsx
// Array syntax: [mobile, tablet, desktop]
<Box
  p={[4, 6, 8]}              // padding: 4 on mobile, 6 on tablet, 8 on desktop
  flexDir={['column', 'row']} // stack on mobile, row on larger
  w={['100%', '100%', '50%']}  // full width on mobile, half on desktop
>
  Content
</Box>

// Or object syntax
<Box
  p={{ base: 4, md: 6, lg: 8 }}
  flexDir={{ base: 'column', md: 'row' }}
>
  Content
</Box>
```

### Comparison: Responsive Grid

**MUI (more verbose):**
```tsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid item xs={12} sm={6} md={4}>
    <Card>...</Card>
  </Grid>
</Grid>
```

**Chakra (cleaner):**
```tsx
<SimpleGrid columns={[1, 2, 3]} spacing={[4, 6]}>
  <Card>...</Card>
</SimpleGrid>
```

---

## 🎨 Component Examples

### Cards

```tsx
import { Card, CardBody, CardFooter, Heading, Text, Button, Stack, Tag } from '@chakra-ui/react';

function JobCard({ job }) {
  return (
    <Card>
      <CardBody>
        <Heading size={['sm', 'md']}>{job.title}</Heading>
        <Text color="gray.500">{job.company}</Text>
        
        <Stack direction="row" mt={3} flexWrap="wrap" gap={2}>
          <Tag colorScheme="blue" size="sm">{job.workMode}</Tag>
          <Tag variant="outline" size="sm">{job.type}</Tag>
        </Stack>
        
        <Text fontSize="sm" mt={3}>
          Match: {job.matchScore}%
        </Text>
      </CardBody>
      
      <CardFooter>
        <Stack direction={['column', 'row']} spacing={2} w="100%">
          <Button flex={[null, 1]} colorScheme="blue">View</Button>
          <Button flex={[null, 1]} variant="outline">Save</Button>
        </Stack>
      </CardFooter>
    </Card>
  );
}
```

### Forms

```tsx
import { FormControl, FormLabel, Input, Select, Button, VStack } from '@chakra-ui/react';

function PreferencesForm() {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Work Mode</FormLabel>
        <Select>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </Select>
      </FormControl>
      
      <FormControl>
        <FormLabel>Job Type</FormLabel>
        <Select>
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="contract">Contract</option>
        </Select>
      </FormControl>
      
      <Button colorScheme="blue" size={['md', 'lg']}>
        Save Preferences
      </Button>
    </VStack>
  );
}
```

### Navigation with Show/Hide

```tsx
import { Show, Hide, Box, IconButton, Drawer, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

function Navigation() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box as="nav">
      {/* Desktop navigation */}
      <Show above="md">
        <HStack spacing={8}>
          <Link>Dashboard</Link>
          <Link>Jobs</Link>
          <Link>Settings</Link>
        </HStack>
      </Show>
      
      {/* Mobile hamburger menu */}
      <Hide above="md">
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onOpen}
          aria-label="Open menu"
        />
        
        <Drawer isOpen={isOpen} onClose={onClose} placement="left">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <VStack spacing={4} mt={8}>
                <Link>Dashboard</Link>
                <Link>Jobs</Link>
                <Link>Settings</Link>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Hide>
    </Box>
  );
}
```

---

## 🌙 Dark Mode

Chakra has built-in dark mode support:

```tsx
// Toggle button
import { useColorMode, IconButton } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

function DarkModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <IconButton
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      aria-label="Toggle dark mode"
    />
  );
}

// Components automatically adapt!
// Light mode: white background, dark text
// Dark mode: dark background, light text
```

---

## 🛠️ Setup with Next.js 14

```tsx
// app/providers.tsx
'use client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { theme } from './theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/theme.ts
import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
    },
  },
});
```

---

## 📊 Comparison Table

| Factor | Chakra UI | MUI | Tailwind |
|--------|-----------|-----|----------|
| **Readability** | ✅ Great | ✅ Good | ❌ Long classes |
| **Mobile-first** | ✅ Native | 🟡 Manual | 🟡 Manual |
| **Bundle size** | ~100KB | ~200KB | ~10KB |
| **Ready components** | ✅ Yes | ✅ Yes | ❌ Build yourself |
| **Dark mode** | ✅ Built-in | 🟡 Manual | 🟡 Manual |
| **Learning curve** | ✅ Easy | 🟡 Medium | 🟡 Medium |

---

## ✅ Decision

**Use Chakra UI with mobile-first approach**

### Rationale

1. **Mobile-first:** Array syntax `[mobile, tablet, desktop]` is intuitive
2. **Readability:** `<Button colorScheme="blue">` vs Tailwind class strings
3. **Ready components:** All basics included
4. **Dark mode:** Built-in, one-line toggle
5. **Fast development:** Focus on features, not CSS

### Consequences

**Positive:**
- Clean, readable component code
- Responsive design is easy
- Built-in dark mode support
- Excellent accessibility (WCAG compliant)

**Negative:**
- Slightly larger bundle than Tailwind
- No touch ripple effect like MUI
- Smaller community than MUI

---

## 📚 Learning Resources

- [Chakra UI Documentation](https://chakra-ui.com/docs)
- [Chakra UI + Next.js](https://chakra-ui.com/getting-started/nextjs-app-guide)
- [Responsive Styles](https://chakra-ui.com/docs/styled-system/responsive-styles)

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-01-26 | Initial decision approved |
