import { useState, useEffect } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';

const getApiBase = () => `http://${window.location.hostname}:5000`;

const Settings = () => {
  const API_BASE = getApiBase();
  const [settings, setSettings] = useState({
    flaskServerUrl: API_BASE,
    autoRefreshInterval: '3',
    relayOnDuration: '3',
    wifiSsid: 'Your_WiFi_SSID',
    wifiPassword: '',
    autoStartMonitoring: 'true',
    soundAlerts: 'true',
    darkMode: 'false'
  });
  
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) {
            setSettings(data);
            if (data.darkMode === 'true') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? (checked ? 'true' : 'false') : value;
    setSettings(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    if (name === 'darkMode') {
      if (finalValue === 'true') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      alert('Failed to save settings');
    }
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      <div className="col-span-2 flex flex-col gap-6">
        <div className="glass-panel p-6 flex flex-col gap-6">
          <h3 className="text-sm font-semibold text-slate-800">System Settings</h3>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-slate-500 font-medium">Flask Server URL</label>
              <input type="text" name="flaskServerUrl" value={settings.flaskServerUrl} onChange={handleChange} className="p-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-green bg-slate-50" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-slate-500 font-medium">Auto Refresh Interval (seconds)</label>
              <select name="autoRefreshInterval" value={settings.autoRefreshInterval} onChange={handleChange} className="p-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-green bg-slate-50">
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="30">30</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-slate-500 font-medium">Relay ON Duration (seconds)</label>
              <select name="relayOnDuration" value={settings.relayOnDuration} onChange={handleChange} className="p-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-green bg-slate-50">
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
            
            <div className="col-span-2 flex flex-col gap-4 mt-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[13px] text-slate-700 font-medium">Auto Start Monitoring</span>
                <div className="relative">
                  <input type="checkbox" name="autoStartMonitoring" checked={settings.autoStartMonitoring === 'true'} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                </div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[13px] text-slate-700 font-medium">Sound Alerts</span>
                <div className="relative">
                  <input type="checkbox" name="soundAlerts" checked={settings.soundAlerts === 'true'} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer mt-1">
                <span className="text-[13px] text-slate-700 font-medium">Dark Mode Theme</span>
                <div className="relative">
                  <input type="checkbox" name="darkMode" checked={settings.darkMode === 'true'} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-700"></div>
                </div>
              </label>
            </div>
          </div>
          
          <button onClick={handleSave} disabled={saving} className="mt-4 bg-brand-green text-white py-3 rounded-lg text-sm font-semibold hover:bg-brand-green-dark transition-all shadow-md disabled:opacity-70">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-800">WiFi Configuration</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-slate-500 font-medium">WiFi SSID</label>
            <input type="text" name="wifiSsid" value={settings.wifiSsid} onChange={handleChange} className="p-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-green bg-slate-50" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-slate-500 font-medium">WiFi Password</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} name="wifiPassword" value={settings.wifiPassword} onChange={handleChange} className="p-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-green bg-slate-50 w-full pr-10" />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-slate-400">
                {showPwd ? <EyeSlash size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
          
        </div>
        
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-800">Device Settings</h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-slate-500 font-medium">Device Name</label>
            <input type="text" value="ESP32-CAM-01" readOnly className="p-2.5 rounded-lg border border-slate-200 text-sm bg-slate-100 text-slate-500 outline-none" />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Settings;
