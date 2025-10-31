import { BrowserRouter, Routes, Route } from "react-router-dom";
import ImpactDashboard from "./pages/ImpactDashboard";
import EmissionsDetail from "./pages/EmissionsDetail";
import DonationsDetail from "./pages/DonationsDetail";
import VolunteerDetail from "./pages/VolunteerDetail";
import PeopleServedDetail from "./pages/PeopleServedDetail";
import PositiveNewsDetail from "./pages/PositiveNewsDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ImpactDashboard />} />
        <Route path="/emissions" element={<EmissionsDetail />} />
        <Route path="/donations" element={<DonationsDetail />} />
        <Route path="/volunteer" element={<VolunteerDetail />} />
        <Route path="/people" element={<PeopleServedDetail />} />
        <Route path="/news" element={<PositiveNewsDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
