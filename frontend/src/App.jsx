import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IndexPage from "./pages/Index";
import ScrollToTop from "./components/ScrollToTop";
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmProvider } from "./components/ui/Confirm";

const App = () => {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* All application routing logic is handled by IndexPage */}
            <Route path="/*" element={<IndexPage />} />
          </Routes>
        </Router>
      </ConfirmProvider>
    </ToastProvider>
  );
};

export default App;
