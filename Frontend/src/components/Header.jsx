import { Bell, CalendarBlank, Warning, Info } from '@phosphor-icons/react';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const getApiBase = () => `http://${window.location.hostname}:5000`;

const Header = () => {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const [logs, setLogs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${getApiBase()}/status`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (error) {
        console.error('Failed to fetch logs', error);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard': return { title: 'Dashboard', desc: 'Overview of your smart plant monitoring system' };
      case '/history': return { title: 'History & Logs', desc: 'View all detection history and system logs' };
      case '/reports': return { title: 'Reports', desc: 'Analytics and system performance reports' };
      case '/about': return { title: 'About Project', desc: 'Learn more about the Smart Plant Monitoring System' };
      case '/settings': return { title: 'Settings', desc: 'Configure your system preferences' };
      default: return { title: 'Smart Plant', desc: 'Monitoring System' };
    }
  };

  const { title, desc } = getPageInfo();

  // Find if there are warnings or errors in recent logs
  const unreadAlerts = logs.filter(l => l.type === 'error' || l.type === 'warning').length;

  return (
    <header className="flex justify-between items-center z-50">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{title}</h1>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass-panel px-4 py-2 flex items-center gap-3 rounded-full text-sm font-medium text-slate-500">
          <CalendarBlank size={18} />
          <span>{time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="text-slate-300">|</span>
          <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`glass-panel w-10 h-10 rounded-full flex items-center justify-center transition-transform relative ${showDropdown ? 'bg-slate-100 text-brand-green' : 'text-slate-700 hover:scale-105'}`}
          >
            <Bell size={20} />
            {unreadAlerts > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-panel border border-slate-100 dark:border-white/10 overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
                {unreadAlerts > 0 && (
                  <span className="text-[10px] bg-danger-light text-danger px-2 py-0.5 rounded-full font-bold">
                    {unreadAlerts} alerts
                  </span>
                )}
              </div>
              <ul className="max-h-64 overflow-y-auto custom-scrollbar">
                {logs.length > 0 ? logs.slice(0, 5).map(log => (
                  <li key={log.id} className="p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 flex gap-3 text-sm">
                    <div className={`mt-0.5 ${log.type === 'error' ? 'text-danger' : log.type === 'warning' ? 'text-warning' : 'text-brand-green'}`}>
                      {log.type === 'error' || log.type === 'warning' ? <Warning weight="fill" /> : <Info weight="fill" />}
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${log.type === 'error' ? 'text-danger' : 'text-slate-700'}`}>{log.message}</p>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                  </li>
                )) : (
                  <li className="p-4 text-center text-xs text-slate-400">No recent notifications</li>
                )}
              </ul>
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <a href="/history" className="text-xs text-brand-green font-semibold hover:underline">View All History</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
