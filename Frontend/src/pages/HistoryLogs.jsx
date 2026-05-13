import { useState, useEffect, useMemo } from 'react';
import { MagnifyingGlass, DownloadSimple } from '@phosphor-icons/react';

const getApiBase = () => `http://${window.location.hostname}:5000`;

const HistoryLogs = () => {
  const [history, setHistory] = useState([]);
  const API_BASE = getApiBase();

  // Filters state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [resultFilter, setResultFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch history', error);
      }
    };
    
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredHistory = useMemo(() => {
    return history.filter(row => {
      // 1. Result Filter
      if (resultFilter === 'Healthy (1)' && row.result !== 1) return false;
      if (resultFilter === 'Diseased (0)' && row.result !== 0) return false;
      
      // 2. Date Filter (row.timestamp looks like "2026-05-11 23:15:00")
      const rowDateStr = row.timestamp.split(' ')[0];
      const rowDate = new Date(rowDateStr);
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (rowDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (rowDate > to) return false;
      }

      // 3. Search Term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !row.timestamp.toLowerCase().includes(term) &&
          !row.relay_status.toLowerCase().includes(term) &&
          !row.completion_status.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [history, dateFrom, dateTo, resultFilter, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage) || 1;
  
  // Ensure current page is valid when filtering changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredHistory.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredHistory, currentPage]);

  // Export CSV
  const exportCSV = () => {
    if (filteredHistory.length === 0) return;
    
    const headers = ['ID', 'Timestamp', 'Result', 'Confidence', 'Relay Status', 'Status'];
    const csvRows = [headers.join(',')];
    
    filteredHistory.forEach(row => {
      const resText = row.result === 1 ? 'Healthy' : 'Diseased';
      csvRows.push(`${row.id},${row.timestamp},${resText},${row.confidence},${row.relay_status},${row.completion_status}`);
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant_history_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination Handlers
  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePageClick = (page) => setCurrentPage(page);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);
    if (currentPage === 1) end = Math.min(totalPages, 3);
    if (currentPage === totalPages) start = Math.max(1, totalPages - 2);
    
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center text-sm">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="p-2 border rounded-lg outline-none" title="From Date" />
          <span>To</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="p-2 border rounded-lg outline-none" title="To Date" />
          <select value={resultFilter} onChange={e => setResultFilter(e.target.value)} className="p-2 border rounded-lg outline-none bg-white">
            <option>Result: All</option>
            <option>Healthy (1)</option>
            <option>Diseased (0)</option>
          </select>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-2.5 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg outline-none text-sm w-48" />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green-dark transition-colors">
            <DownloadSimple /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="pb-3 font-semibold w-10">#</th>
              <th className="pb-3 font-semibold w-40">Date & Time</th>
              <th className="pb-3 font-semibold">Captured Image</th>
              <th className="pb-3 font-semibold">Result (Output)</th>
              <th className="pb-3 font-semibold">Relay Status</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((row, index) => {
              // Calculate actual index based on total filtered length
              const displayIndex = filteredHistory.length - ((currentPage - 1) * recordsPerPage) - index;
              return (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 text-slate-400">{displayIndex}</td>
                  <td className="py-3 text-slate-600 font-medium whitespace-pre-line">
                    {row.timestamp.replace(' ', '\n')}
                  </td>
                  <td className="py-3">
                    <img src={`${API_BASE}/uploads/${row.image_filename}`} alt="Leaf" className="w-12 h-12 rounded object-cover border" />
                  </td>
                  <td className="py-3">
                    {row.result === 1 ? (
                      <span className="text-brand-green font-semibold">Healthy (1)</span>
                    ) : (
                      <span className="text-danger font-semibold">Diseased (0)</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${row.relay_status === 'ON' ? 'bg-warning-light text-warning' : 'bg-slate-100 text-slate-600'}`}>
                      {row.relay_status}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-brand-green-light text-brand-green">
                      {row.completion_status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {currentRecords.length === 0 && (
              <tr><td colSpan="6" className="py-4 text-center text-slate-400">No matching history found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-center mt-4">
         <div className="flex gap-1">
           <button onClick={handlePrev} disabled={currentPage === 1} className="px-3 py-1 border rounded bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">&lt;</button>
           
           {getPageNumbers().map(page => (
             <button 
               key={page} 
               onClick={() => handlePageClick(page)}
               className={`px-3 py-1 border rounded font-medium ${currentPage === page ? 'bg-brand-green text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
             >
               {page}
             </button>
           ))}

           <button onClick={handleNext} disabled={currentPage === totalPages} className="px-3 py-1 border rounded bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">&gt;</button>
         </div>
      </div>
    </div>
  );
};

export default HistoryLogs;
