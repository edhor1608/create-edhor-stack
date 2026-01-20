import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep cached data for 7 days (offline support)
      gcTime: 1000 * 60 * 60 * 24 * 7,
      // Data considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Try cache first, then network
      networkMode: 'offlineFirst',
      // Retry with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Persist to AsyncStorage for true offline support
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
});
