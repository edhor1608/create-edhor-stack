import { createRootRoute, Outlet } from "@tanstack/react-router";
import "../styles.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{name}}</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
