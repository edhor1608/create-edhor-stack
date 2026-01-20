import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { persister, queryClient } from '../src/lib/query-client';

export default function RootLayout() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: '{{name}}' }} />
      </Stack>
      <StatusBar style="auto" />
    </PersistQueryClientProvider>
  );
}
