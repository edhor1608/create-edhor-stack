import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight">Welcome to {{name}}</h1>
      <p className="mt-4 text-muted-foreground">
        Edit <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">src/routes/index.tsx</code> to get started.
      </p>
    </main>
  );
}
