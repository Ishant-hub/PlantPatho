import { NavLink } from 'react-router-dom';
import { Leaf, SquaresFour, ClockCounterClockwise, ChartBar, Info, Gear, ArrowsLeftRight } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

const getApiBase = () => `http://${window.location.hostname}:5000`;

const Sidebar = () => {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${getApiBase()}/status`);
        if (res.ok) {
          const data = await res.json();
          setIsOnline(data.esp32 === 'Online');
        }
      } catch (e) {
        setIsOnline(false);
      }
    };
    
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 3000);
    
    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: SquaresFour },
    { name: 'History & Logs', path: '/history', icon: ClockCounterClockwise },
    { name: 'Reports', path: '/reports', icon: ChartBar },
    { name: 'About Project', path: '/about', icon: Info },
    { name: 'Settings', path: '/settings', icon: Gear },
  ];

  return (
    <aside className="w-[260px] fixed top-5 bottom-5 left-5 glass-panel flex flex-col px-5 py-6 gap-8">
      <div className="flex items-center gap-3 px-2">
        <Leaf weight="fill" className="text-brand-green text-3xl" />
        <div>
          <h2 className="font-bold text-slate-800 text-lg leading-tight">Smart Plant</h2>
          <p className="text-xs text-slate-500 font-medium">Disease Monitoring System</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-green-light text-brand-green-dark [&>svg]:text-brand-green'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="bg-white/60 sidebar-widget rounded-xl p-4 flex flex-col gap-2 transition-colors border border-transparent">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500">ESP32-CAM</h4>
        <div className={`flex justify-between items-center text-sm font-semibold ${isOnline ? 'text-brand-green' : 'text-slate-400'}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-brand-green shadow-[0_0_8px_#4CAF50]' : 'bg-slate-400'}`}></span>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <ArrowsLeftRight className={isOnline ? 'text-brand-green opacity-100' : 'text-slate-400 opacity-50'} />
        </div>
        <div className="text-xs text-slate-500 mt-1 font-medium">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          <br />
          {time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
