import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, Leaf, Warning, Lightning } from '@phosphor-icons/react';

const getApiBase = () => `http://${window.location.hostname}:5000`;

const Reports = () => {
  const API_BASE = getApiBase();
  const [data, setData] = useState({
    total_scans: 0,
    healthy_count: 0,
    diseased_count: 0,
    relay_activations: 0,
    daily_scans: [],
    accuracy: 92.4
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE}/reports`);
        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
        }
      } catch (error) {
        console.error('Failed to fetch reports', error);
      }
    };
    
    fetchReports();
    const interval = setInterval(fetchReports, 3000);
    return () => clearInterval(interval);
  }, []);

  const pieData = [
    { name: 'Healthy', value: data.healthy_count, color: '#4CAF50' },
    { name: 'Diseased', value: data.diseased_count, color: '#F44336' }
  ];

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-2xl">
            <FileText />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Total Scans</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.total_scans}</h3>
            <small className="text-[11px] text-slate-400">All Time</small>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-green-light text-brand-green flex items-center justify-center text-2xl">
            <Leaf />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Healthy (1)</p>
            <h3 className="text-2xl font-bold text-brand-green">{data.healthy_count}</h3>
            <small className="text-[11px] text-slate-400">
              {data.total_scans ? ((data.healthy_count/data.total_scans)*100).toFixed(1) : 0}%
            </small>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-light text-danger flex items-center justify-center text-2xl">
            <Warning />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Diseased (0)</p>
            <h3 className="text-2xl font-bold text-danger">{data.diseased_count}</h3>
            <small className="text-[11px] text-slate-400">
              {data.total_scans ? ((data.diseased_count/data.total_scans)*100).toFixed(1) : 0}%
            </small>
          </div>
        </div>
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning-light text-warning flex items-center justify-center text-2xl">
            <Lightning />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Relay Activations</p>
            <h3 className="text-2xl font-bold text-warning">{data.relay_activations}</h3>
            <small className="text-[11px] text-slate-400">Total ON Count</small>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 flex-1">
        {/* Pie Chart */}
        <div className="glass-panel p-5 flex flex-col">
          <h3 className="text-sm font-semibold mb-4 text-slate-800">Distribution <span className="text-slate-400 font-normal">(All Time)</span></h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={8}
                  cornerRadius={10}
                  dataKey="value" 
                  stroke="none"
                >
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.5)', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }} 
                  itemStyle={{color: '#1e293b', fontWeight: 600}}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Inner Text for Donut Chart */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <span className="text-2xl font-bold text-slate-800">{data.total_scans}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
            </div>

            <div className="flex justify-center gap-6 w-full mt-2 text-[13px] font-medium">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-green shadow-sm"></span>Healthy ({data.healthy_count})</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-danger shadow-sm"></span>Diseased ({data.diseased_count})</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-panel p-5 flex flex-col col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Daily Scans <span className="text-slate-400 font-normal">(Last 7 Days)</span></h3>
            <div className="flex gap-4 text-xs font-medium">
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-green"></span>Healthy (1)</span>
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-danger"></span>Diseased (0)</span>
            </div>
          </div>
          <div className="flex-1 mt-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.daily_scans} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.5)', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }}
                  itemStyle={{fontWeight: 600}}
                />
                <Bar dataKey="healthy" name="Healthy" fill="#4CAF50" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="diseased" name="Diseased" fill="#F44336" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-slate-400 text-center">Note: Accuracy is calculated based on internal model evaluation.</p>
    </div>
  );
};

export default Reports;
