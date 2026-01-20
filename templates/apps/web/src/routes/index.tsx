import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Welcome to {{name}}</h1>
      <p>Edit <code>src/routes/index.tsx</code> to get started.</p>
    </main>
  );
}
