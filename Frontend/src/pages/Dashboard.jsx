import { useState, useEffect, useRef } from 'react';
import { Leaf, Lightning, Cpu, WifiHigh, Clock, Image as ImageIcon, Brain, Database, Plug, PlayCircle, ArrowsClockwise, Warning, CameraSlash, Spinner } from '@phosphor-icons/react';

const getApiBase = () => `http://${window.location.hostname}:5000`;

const Dashboard = () => {
  const API_BASE = getApiBase();
  const [status, setStatus] = useState({
    esp32: 'Checking...',
    relay: 'OFF',
    server: 'Checking...',
    power: 'Checking...',
    wifi: 'Checking...',
    last_scan: '--:--',
    logs: []
  });
  
  const [latestScan, setLatestScan] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (error) {
      console.error('Error fetching status', error);
      setStatus(prev => ({ ...prev, server: 'Offline' }));
    }
  };

  const fetchLatest = async () => {
    try {
      const res = await fetch(`${API_BASE}/latest`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) setLatestScan(data);
      }
    } catch (error) {
      console.error('Error fetching latest scan', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLatest();
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000); // User requested 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    // Optimistically update image
    const objUrl = URL.createObjectURL(file);
    setLatestScan(prev => ({
      ...prev,
      temp_image: objUrl,
      result: null // pending
    }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: arrayBuffer
      });
      
      if (!res.ok) throw new Error("Failed to predict");

      // Re-fetch latest to get DB record
      await fetchLatest();
      await fetchStatus();
    } catch (error) {
      console.error('Prediction failed', error);
      alert('Prediction failed. Check console.');
    } finally {
      setIsAnalyzing(false);
      e.target.value = '';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStatus(), fetchLatest()]);
    setTimeout(() => setIsRefreshing(false), 500); // Brief delay for visual feedback
  };

  const isHealthy = latestScan?.result === 1;
  const hasResult = latestScan?.result !== undefined && latestScan?.result !== null;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Top Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${hasResult ? (isHealthy ? 'bg-brand-green-light text-brand-green' : 'bg-danger-light text-danger') : 'bg-slate-100 text-slate-400'}`}>
             {hasResult ? (isHealthy ? <Leaf weight="fill" /> : <Warning weight="fill" />) : <Leaf weight="fill" />}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Plant Status</p>
            <h3 className={`text-base font-bold ${hasResult ? (isHealthy ? 'text-brand-green' : 'text-danger') : 'text-slate-800'}`}>
              {hasResult ? (isHealthy ? 'Healthy (1)' : 'Diseased (0)') : 'Waiting...'}
            </h3>
            <small className="text-[11px] text-slate-400">Confidence: {hasResult ? (latestScan.confidence * 100).toFixed(1) + '%' : '-'}</small>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-warning-light text-warning">
            <Lightning weight="fill" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Relay Status</p>
            <h3 className={`text-base font-bold ${status.relay === 'ON' ? 'text-warning' : 'text-slate-800'}`}>{status.relay}</h3>
            <small className="text-[11px] text-slate-400">{status.relay === 'ON' ? 'Active' : 'Inactive'}</small>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-brand-green-light text-brand-green">
            <Cpu weight="fill" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">ESP32 Status</p>
            <h3 className="text-base font-bold text-slate-800">{status.esp32}</h3>
            <small className="text-[11px] text-slate-400">Connected</small>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-brand-green-light text-brand-green">
            <WifiHigh weight="fill" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">WiFi Status</p>
            <h3 className="text-base font-bold text-slate-800">{status.wifi}</h3>
            <small className="text-[11px] text-slate-400">Strong Signal</small>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-info-light text-info">
            <Clock weight="fill" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Last Scan</p>
            <h3 className="text-base font-bold text-slate-800">
              {status.last_scan && status.last_scan !== '--:--' ? status.last_scan.split(' ')[1] : '--:--'}
            </h3>
            <small className="text-[11px] text-slate-400">
              {status.last_scan && status.last_scan !== '--:--' ? status.last_scan.split(' ')[0] : '-- --- ----'}
            </small>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-[1fr_1fr_300px] gap-5">
        
        {/* Latest Captured Image */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="text-brand-green" size={20} />
            <h3 className="text-sm font-semibold">Latest Captured Image</h3>
          </div>
          
          <div className="w-full h-60 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
            {(latestScan?.image_filename || latestScan?.temp_image) ? (
              <img 
                src={latestScan.temp_image || `${API_BASE}/uploads/${latestScan.image_filename}`} 
                alt="Scan" 
                className={`w-full h-full object-cover ${isAnalyzing ? 'opacity-50 blur-sm' : ''}`}
              />
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2 text-sm">
                <CameraSlash size={32} />
                <span>No image selected yet</span>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner className="animate-spin text-brand-green" size={48} />
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Captured at: <span>{latestScan?.timestamp || 'Waiting for upload...'}</span>
          </p>
        </div>

        {/* AI Prediction */}
        <div className="glass-panel p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-brand-green" size={20} />
            <h3 className="text-sm font-semibold">
              AI Prediction <span className="font-normal text-slate-400 text-xs">(Binary Output)</span>
            </h3>
          </div>

          <div className={`p-5 rounded-xl border flex items-center gap-5 mb-6 transition-all ${hasResult ? (isHealthy ? 'bg-brand-green-light border-brand-green/20' : 'bg-danger-light border-danger/20') : 'bg-slate-50 border-slate-200'}`}>
            <div className={`w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm ${hasResult ? (isHealthy ? 'text-brand-green' : 'text-danger') : 'text-slate-300'}`}>
              {hasResult ? (isHealthy ? <Leaf weight="fill" /> : <Warning weight="fill" />) : <Leaf weight="fill" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Result</p>
              <h2 className={`text-2xl font-bold ${hasResult ? (isHealthy ? 'text-brand-green' : 'text-danger') : 'text-slate-400'}`}>
                {isAnalyzing ? 'Analyzing...' : (hasResult ? (isHealthy ? 'Healthy (1)' : 'Diseased (0)') : 'Waiting...')}
              </h2>
              <small className="text-xs text-slate-700 font-medium mt-1 block">
                Confidence: <span>{hasResult ? (latestScan.confidence * 100).toFixed(1) + '%' : '-'}</span>
              </small>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-2">
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
              <span className="text-[13px] font-medium text-slate-500">Model Output</span>
              <strong className="text-[13px] font-semibold text-slate-800">
                {hasResult ? `${latestScan.result} (${isHealthy ? 'Healthy' : 'Diseased'})` : '-'}
              </strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
              <span className="text-[13px] font-medium text-slate-500">Model Used</span>
              <strong className="text-[13px] font-semibold text-slate-800">MobileNetV2</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-medium text-slate-500">Prediction Time</span>
              <strong className="text-[13px] font-semibold text-slate-800">{latestScan?.timestamp || '--'}</strong>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="flex flex-col gap-5">
          <div className="glass-panel p-5">
            <h3 className="text-sm font-semibold mb-4">Device Status</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-2 text-slate-500 font-medium"><Cpu /> ESP32-CAM</span>
                <strong className="text-brand-green">{status.esp32}</strong>
              </li>
              <li className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-2 text-slate-500 font-medium"><Lightning /> Relay Module</span>
                <strong className={status.relay === 'ON' ? 'text-danger' : 'text-slate-800'}>{status.relay}</strong>
              </li>
              <li className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-2 text-slate-500 font-medium"><Database /> Flask Server</span>
                <strong className={status.server === 'Running' ? 'text-brand-green' : 'text-danger'}>{status.server}</strong>
              </li>
              <li className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-2 text-slate-500 font-medium"><Plug /> Power Supply</span>
                <strong className="text-brand-green">{status.power}</strong>
              </li>
              <li className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-2 text-slate-500 font-medium"><WifiHigh /> WiFi Connection</span>
                <strong className="text-brand-green">{status.wifi}</strong>
              </li>
            </ul>
          </div>

          <div className="glass-panel p-5 flex-1">
            <h3 className="text-sm font-semibold mb-4">Quick Controls</h3>
            <div className="flex flex-col gap-3">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isAnalyzing}
                className="w-full p-3 rounded-lg bg-brand-green text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-brand-green-dark transition-all shadow-md disabled:opacity-70"
              >
                {isAnalyzing ? <Spinner className="animate-spin" /> : <PlayCircle size={18} />}
                {isAnalyzing ? 'Analyzing...' : 'Start Monitoring'}
              </button>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full p-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-70"
              >
                <ArrowsClockwise size={18} className={isRefreshing ? "animate-spin" : ""} /> 
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Activity */}
      <div className="glass-panel p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Lightning className="text-brand-green" /> System Activity
          </h3>
          <a href="/history" className="text-xs font-medium text-slate-500 hover:text-brand-green">View All Logs &rarr;</a>
        </div>
        
        <ul className="max-h-32 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
          {status.logs.map((log) => (
            <li key={log.id} className="flex items-center gap-4 text-[13px]">
              <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'error' ? 'bg-danger' : log.type === 'warning' ? 'bg-warning' : 'bg-brand-green'}`}></span>
              <span className="text-slate-400 w-20 text-xs">{log.timestamp.split(' ')[1]}</span>
              <span className={`font-medium ${log.type === 'success' ? 'text-brand-green' : 'text-slate-700'}`}>{log.message}</span>
            </li>
          ))}
          {status.logs.length === 0 && <li className="text-sm text-slate-400">No recent activity</li>}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
