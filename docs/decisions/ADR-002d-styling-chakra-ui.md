# ADR-002d: Styling - Chakra UI

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Deciders** | Danish       |

---

## Decision

**Chakra UI for component library and styling (mobile-first approach)**

---

## Context

Need a styling solution that:
- Provides ready-to-use components
- Is readable and maintainable
- Supports mobile-first responsive design
- Works well with Next.js 14

---

## Options Considered

| Option | Verdict |
|--------|---------|
| **Chakra UI** | ✅ Selected - Mobile-first, readable, great components |
| **MUI** | ❌ Heavier bundle, Material Design too opinionated |
| **Tailwind + shadcn/ui** | ❌ Long class names, less readable |

---

## Key Benefits

| Feature | Benefit |
|---------|---------|
| **Mobile-first** | Array syntax `[mobile, tablet, desktop]` |
| **SimpleGrid** | Easy responsive layouts |
| **Dark mode** | Built-in toggle |
| **Accessible** | WCAG compliant by default |
| **Readable** | `<Button colorScheme="blue">` vs long class strings |

---

## Responsive Syntax

```tsx
// Mobile-first array syntax
<SimpleGrid columns={[1, 2, 3]} spacing={[4, 6]}>
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</SimpleGrid>

<Box 
  p={[4, 6, 8]}           // Responsive padding
  flexDir={['column', 'row']}  // Stack on mobile, row on desktop
/>
```

---

## Bundle Size

| Library | Size |
|---------|------|
| **Chakra UI** | ~100KB (tree-shaken) |
| **MUI** | ~200KB (tree-shaken) |

---

## Consequences

### Positive
- ✅ Mobile-first by design
- ✅ Readable component-based code
- ✅ Built-in dark mode
- ✅ Excellent accessibility
- ✅ Simpler than MUI

### Negative
- ⚠️ Smaller ecosystem than MUI
- ⚠️ No touch ripple effect (unlike MUI)

---

## Related Documents

- 📖 [Detailed Discussion](./ADR-002d-styling-chakra-ui-discussion.md)
