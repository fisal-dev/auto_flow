import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IndexPage from "./pages/Index";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* All application routing logic is handled by IndexPage */}
        <Route path="/*" element={<IndexPage />} />
      </Routes>
    </Router>
  );
};

export default App;
