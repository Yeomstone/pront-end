import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// ... 나머지 UI 컴포넌트 imports
import { useNavigate } from 'react-router-dom';  // 있다면
import EmissionsDetail from './EmissionsDetail';
import ImpactDashboard from './ImpactDashboard';
import PeopleServedDetail from './PeopleServedDetail';
import VolunteerDetail from './VolunteerDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ImpactDashboard />} />
        <Route path="/emissions" element={<EmissionsDetail />} />
        {/* <Route path="/donations" element={<DonationsDetail />} /> */}
        <Route path="/volunteer" element={<VolunteerDetail />} />
        <Route path="/people" element={<PeopleServedDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;