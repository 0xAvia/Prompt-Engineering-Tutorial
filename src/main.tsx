import { lazy, StrictMode, Suspense, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ErrorPage } from "./components/ErrorPage";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";

// Pages with the editor and the Claude SDK load on demand, keeping the home page light.
const ChapterPage = lazy(() => import("./pages/ChapterPage").then((m) => ({ default: m.ChapterPage })));
const PlaygroundPage = lazy(() => import("./pages/PlaygroundPage").then((m) => ({ default: m.PlaygroundPage })));
const SetupPage = lazy(() => import("./pages/SetupPage").then((m) => ({ default: m.SetupPage })));

const Loading = () => <div className="mx-auto max-w-3xl px-4 py-16 text-muted" aria-busy="true">Loading…</div>;
const page = (el: ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;
import "./styles/index.css";

// Hash routing keeps deep links working on GitHub Pages without server rewrites.
const router = createHashRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/setup", element: page(<SetupPage />) },
      { path: "/learn/:chapterId", element: page(<ChapterPage />) },
      { path: "/playground", element: page(<PlaygroundPage />) },
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
