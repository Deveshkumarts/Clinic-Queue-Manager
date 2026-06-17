import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import WaitingRoomDisplay from './pages/WaitingRoomDisplay';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<ReceptionistDashboard />} />
        <Route path="/queue" element={<WaitingRoomDisplay />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
