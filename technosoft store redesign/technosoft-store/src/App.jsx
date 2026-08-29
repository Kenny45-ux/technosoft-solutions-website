import { useState, useEffect } from "react";
import TechnosoftHome from "./components/TechnosoftHome";
import TechnosoftStoreV2 from "./components/TechnosoftStoreV2";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [page, setPage] = useState("home");
  const [initialCategory, setInitialCategory] = useState(null);
  const [initialRequestService, setInitialRequestService] = useState(null);
  const [initialHomePage, setInitialHomePage] = useState(null); // e.g. "support"

  // Admin panel is reached by URL only (e.g. localhost:5173/admin) — never
  // linked from the public nav, per the requirement that normal customers
  // shouldn't stumble into it. The actual security boundary is still the
  // backend session check (require_admin.php); this is just routing.
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      setPage("admin");
    }
  }, []);

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

  // Called from the store's checkout when it needs the visitor to log in first.
  const handleGoToLogin = () => {
    setInitialHomePage("login");
    setPage("home");
  };

  // Called right after a successful login when the account's role is 'admin' —
  // sends them straight into the Admin Panel instead of the public homepage.
  // Purely a UX convenience: AdminPanel independently re-verifies the session
  // server-side on mount, so this redirect grants no access by itself.
  const handleAdminLogin = () => {
    window.history.pushState({}, "", "/admin");
    setPage("admin");
  };

  if (page === "admin") {
    return (
      <AdminPanel
        onExit={() => {
          window.history.pushState({}, "", "/");
          setPage("home");
        }}
      />
    );
  }

  if (page === "store") {
    return (
      <TechnosoftStoreV2
        onBackHome={() => setPage("home")}
        initialCategory={initialCategory}
        onRequestService={handleRequestService}
        onGoToSupport={handleGoToSupport}
        onGoToLogin={handleGoToLogin}
      />
    );
  }
  return <TechnosoftHome onNavigate={handleNavigate} initialRequestService={initialRequestService} initialHomePage={initialHomePage} onAdminLogin={handleAdminLogin} />;
}
