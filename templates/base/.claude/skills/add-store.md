---
name: add-store
description: Create a new Zustand store with persistence (mobile)
---

# Add Store

Creates a new Zustand store with AsyncStorage persistence for the mobile app.

## Usage

```
/add-store notifications
/add-store cart
/add-store preferences
```

## Process

### 1. Create Store

```typescript
// src/lib/store.ts (add to existing file)

// ============================================================================
// NOTIFICATIONS STORE
// ============================================================================

interface NotificationsState {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  setEnabled: (enabled: boolean) => void;
  setSound: (sound: boolean) => void;
  setVibration: (vibration: boolean) => void;
  reset: () => void;
}

const notificationsInitialState = {
  enabled: true,
  sound: true,
  vibration: true,
};

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      ...notificationsInitialState,
      setEnabled: (enabled) => set({ enabled }),
      setSound: (sound) => set({ sound }),
      setVibration: (vibration) => set({ vibration }),
      reset: () => set(notificationsInitialState),
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 2. Use with Selectors

```tsx
// Always use selectors to prevent unnecessary re-renders
function NotificationToggle() {
  // Good - only re-renders when 'enabled' changes
  const enabled = useNotificationsStore((state) => state.enabled);
  const setEnabled = useNotificationsStore((state) => state.setEnabled);

  return (
    <Switch value={enabled} onValueChange={setEnabled} />
  );
}
```

### 3. Multiple Selectors

```tsx
// For multiple values, use shallow comparison
import { useShallow } from 'zustand/react/shallow';

function NotificationSettings() {
  const { sound, vibration, setSound, setVibration } = useNotificationsStore(
    useShallow((state) => ({
      sound: state.sound,
      vibration: state.vibration,
      setSound: state.setSound,
      setVibration: state.setVibration,
    }))
  );

  return (
    <View>
      <Switch value={sound} onValueChange={setSound} />
      <Switch value={vibration} onValueChange={setVibration} />
    </View>
  );
}
```

## Store Patterns

### Computed Values

```typescript
interface CartState {
  items: CartItem[];
  // Computed via selector, not stored
}

// Use selector for computed values
const totalPrice = useCartStore((state) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
```

### Async Actions

```typescript
interface UserState {
  user: User | null;
  loading: boolean;
  fetchUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      fetchUser: async (id) => {
        set({ loading: true });
        try {
          const user = await fetchUser(id);
          set({ user, loading: false });
        } catch {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user, not loading
    }
  )
);
```

## Conventions

- One store per domain (app, search, notifications, etc.)
- Separate concerns - don't put everything in one store
- Always use selectors
- Use `partialize` to exclude transient state from persistence
- Include reset function for clearing state
- Name storage keys descriptively: `[domain]-storage`
