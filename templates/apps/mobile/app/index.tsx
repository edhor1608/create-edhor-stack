import { StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/lib/store';

export default function HomeScreen() {
  // Example: using Zustand store with selector (prevents unnecessary re-renders)
  const theme = useAppStore((state) => state.theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {{name}}</Text>
      <Text style={styles.subtitle}>Edit app/index.tsx to get started</Text>
      <Text style={styles.hint}>Current theme: {theme}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: '#999',
  },
});
