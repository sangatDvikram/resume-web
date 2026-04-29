import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalContext } from "./constants/context";
import { RESUME } from "./constants";

// Route-level code splitting: each page loads its own JS chunk on first visit.
const Index    = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Resume   = lazy(() => import("./components/Resume"));

/** Full-page spinner shown while the active route chunk is downloading. */
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <GlobalContext.Provider value={RESUME}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"       element={<Index />} />
            <Route path="/resume" element={<Resume />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*"       element={<NotFound />} />
          </Routes>
        </Suspense>
      </GlobalContext.Provider>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
