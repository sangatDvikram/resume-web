import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import Resume from "./components/Resume";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Resume />
  </HelmetProvider>
);
