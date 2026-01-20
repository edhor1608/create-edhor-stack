---
name: add-component
description: Create a new React component following project conventions
---

# Add Component

Creates a new React component with proper structure and patterns.

## Usage

```
/add-component Button
/add-component UserProfile --web
/add-component ArticleCard --mobile
```

## Process

1. **Determine location**:
   - `--web`: `apps/web/src/components/`
   - `--mobile`: `apps/mobile/src/components/`
   - `--ui`: `packages/ui/src/components/`
   - Default: Ask user

2. **Create component file**:

```tsx
// components/[name].tsx
import type { ComponentProps } from 'react';

interface [Name]Props {
  // Props here
}

export function [Name]({ ...props }: [Name]Props) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

3. **Add to exports** (if packages/ui):

```tsx
// components/index.ts
export { [Name] } from './[name]';
```

4. **For mobile components**, use React Native primitives:

```tsx
import { View, Text, StyleSheet } from 'react-native';

export function [Name]() {
  return (
    <View style={styles.container}>
      <Text>Content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // styles
  },
});
```

## Conventions

- PascalCase component names
- kebab-case file names
- Props interface named `[Component]Props`
- Functional components only (no classes)
- Use `cn()` for conditional Tailwind classes (web)
- Use StyleSheet for styles (mobile)
