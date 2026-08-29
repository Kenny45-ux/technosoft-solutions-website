import { useState } from "react";
import TechnosoftHome from "./components/TechnosoftHome";
import TechnosoftStoreV2 from "./components/TechnosoftStoreV2";

export default function App() {
  const [page, setPage] = useState("home");
  const [initialCategory, setInitialCategory] = useState(null);
  const [initialRequestService, setInitialRequestService] = useState(null);
  const [initialHomePage, setInitialHomePage] = useState(null); // e.g. "support"

  const handleNavigate = (target, productId, category) => {
    if (category) setInitialCategory(category);
    setPage(target === "store" ? "store" : "home");
  };

  // Called from the store's cross-sell prompts ("Need professional installation?" etc.)
  // Sends the visitor to the home page's request form with the matching service pre-selected.
  const handleRequestService = (serviceName) => {
    setInitialRequestService(serviceName || null);
    setPage("home");
  };

  // Called from the store's Support Ticket link — sends the visitor to Home's Support Center.
  const handleGoToSupport = () => {
    setInitialHomePage("support");
    setPage("home");
  };

  if (page === "store") {
    return (
      <TechnosoftStoreV2
        onBackHome={() => setPage("home")}
        initialCategory={initialCategory}
        onRequestService={handleRequestService}
        onGoToSupport={handleGoToSupport}
      />
    );
  }
  return <TechnosoftHome onNavigate={handleNavigate} initialRequestService={initialRequestService} initialHomePage={initialHomePage} />;
}
