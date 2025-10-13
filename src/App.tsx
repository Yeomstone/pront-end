import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImpactDashboard from './pages/ImpactDashboard';
import EmissionsDetail from './pages/EmissionsDetail';
import DonationsDetail from './pages/DonationsDetail';  // 주석 해제
import VolunteerDetail from './pages/VolunteerDetail';
import PeopleServedDetail from './pages/PeopleServedDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ImpactDashboard />} />
        <Route path="/emissions" element={<EmissionsDetail />} />
        <Route path="/donations" element={<DonationsDetail />} />  {/* 주석 해제 */}
        <Route path="/volunteer" element={<VolunteerDetail />} />
        <Route path="/people" element={<PeopleServedDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;