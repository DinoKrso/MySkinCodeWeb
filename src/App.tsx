import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PRIVACY_POLICY, TERMS_OF_USE } from "./content/legal";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/privacy"
          element={<LegalPage document={PRIVACY_POLICY} />}
        />
        <Route path="/terms" element={<LegalPage document={TERMS_OF_USE} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
