---
name: add-route
description: Add a new route to the web or mobile app
---

# Add Route

Creates a new route with proper file-based routing structure.

## Usage

```
/add-route dashboard
/add-route settings --web
/add-route profile --mobile
/add-route "users/[id]" --web  # Dynamic route
```

## Web Routes (TanStack Start)

Location: `apps/web/src/routes/`

### Static Route

```tsx
// routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </main>
  );
}
```

### Dynamic Route

```tsx
// routes/users/$id.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/$id')({
  component: UserPage,
});

function UserPage() {
  const { id } = Route.useParams();
  return <div>User {id}</div>;
}
```

### With Loader

```tsx
// routes/projects.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { projectsQueryOptions } from '@/lib/queries';

export const Route = createFileRoute('/projects')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(projectsQueryOptions),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data } = useSuspenseQuery(projectsQueryOptions);
  return <ProjectList projects={data} />;
}
```

## Mobile Routes (Expo Router)

Location: `apps/mobile/app/`

### Static Route

```tsx
// app/settings.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
});
```

### Dynamic Route

```tsx
// app/article/[slug].tsx
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <View>
      <Text>Article: {slug}</Text>
    </View>
  );
}
```

### Tab Route

```tsx
// app/(tabs)/home.tsx
export default function HomeTab() {
  return <HomeScreen />;
}
```

## Conventions

- File name = route path
- `$param` for TanStack Router dynamic segments
- `[param]` for Expo Router dynamic segments
- `(group)` folders for layout groups (don't affect URL)
- `_layout.tsx` for nested layouts
