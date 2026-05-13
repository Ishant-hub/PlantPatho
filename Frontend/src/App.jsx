import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import HistoryLogs from './pages/HistoryLogs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import About from './pages/About';

const getApiBase = () => `http://${window.location.hostname}:5000`;

function App() {
  useEffect(() => {
    fetch(`${getApiBase()}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.darkMode === 'true') {
          document.documentElement.classList.add('dark');
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen relative overflow-hidden">
        <Sidebar />
        <main className="ml-[280px] flex-1 p-6 flex flex-col gap-6 w-[calc(100%-280px)]">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<HistoryLogs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
