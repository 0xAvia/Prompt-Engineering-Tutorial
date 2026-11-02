import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ChapterPage } from "./pages/ChapterPage";
import { HomePage } from "./pages/HomePage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SetupPage } from "./pages/SetupPage";
import "./styles/index.css";

// Hash routing keeps deep links working on GitHub Pages without server rewrites.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/setup", element: <SetupPage /> },
      { path: "/learn/:chapterId", element: <ChapterPage /> },
      { path: "/playground", element: <PlaygroundPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "*", element: <HomePage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
