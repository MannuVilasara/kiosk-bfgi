import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays,
  Building2,
  Users,
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';

const api = axios.create({ withCredentials: true });

const Timetable = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIframeReady(false);
    api
      .get(`/api/schedule/${id}`)
      .then((res) => setSchedule(res.data))
      .catch(() => setError('Infrastructure link failed. Timetable unreachable.'))
      .finally(() => setLoading(false));
  }, [id]);

  
  useEffect(() => {
    if (!schedule) return;
    const timer = setTimeout(() => setIframeReady(true), 6000);
    return () => clearTimeout(timer);
  }, [schedule]);

  if (loading) return (
    <div className="h-full bg-white rounded-[40px] flex items-center justify-center border border-slate-100 shadow-inner">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-[#002b5c] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#002b5c]">
            <FileText size={24} />
          </div>
        </div>
        <span className="text-slate-400 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">Syncing Academic Record</span>
      </div>
    </div>
  );

  if (error || !schedule) return (
    <div className="h-full flex flex-col items-center justify-center bg-white rounded-[40px] p-20 text-center border border-slate-100">
      <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mb-8 border border-red-100 shadow-inner">
        <AlertCircle size={48} className="text-red-400" />
      </div>
      <h3 className="text-3xl font-black text-[#002b5c] mb-4 uppercase italic tracking-tighter">Document Offline</h3>
      <p className="text-xl text-slate-400 font-medium mb-12 max-w-md mx-auto">{error}</p>
      <button 
        onClick={() => navigate('/schedule')} 
        className="px-12 py-5 bg-[#002b5c] text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 shadow-2xl shadow-blue-900/30 transition-all"
      >
        Return to Directory
      </button>
    </div>
  );

  return (
    <div className="h-full w-full bg-[#f8fafc] rounded-[40px] overflow-hidden flex flex-col font-sans relative border border-white shadow-2xl">
      
  

      <section className="bg-white border-b border-slate-50 px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <Building2 size={16} className="text-blue-600" />
              <span className="text-xs font-black text-[#002b5c] uppercase tracking-wider">{schedule.departmentName} Dept</span>
           </div>
           <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <CalendarDays size={16} className="text-indigo-600" />
              <span className="text-xs font-black text-[#002b5c] uppercase tracking-wider">Semester {schedule.semester}</span>
           </div>
           <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <Users size={16} className="text-emerald-600" />
              <span className="text-xs font-black text-[#002b5c] uppercase tracking-wider">Section {schedule.sectionName}</span>
           </div>
        </div>
        <button onClick={() => navigate('/schedule')} className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 hover:bg-[#002b5c] group rounded-xl border border-slate-100 hover:border-[#002b5c] active:scale-95 transition-all duration-200">
              <ChevronLeft size={16} className="text-[#002b5c] group-hover:text-white transition-colors" />
              <span className="text-xs font-black text-[#002b5c] group-hover:text-white uppercase tracking-wider transition-colors">Back</span>
           </button>
      </section>

      <div className="flex-1 relative overflow-hidden bg-slate-100/50">
        {!iframeReady && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-50/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6 p-12 bg-white rounded-[50px] shadow-2xl border border-slate-100 max-w-sm text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-blue-50 rounded-[30px] flex items-center justify-center text-blue-600 shadow-inner">
                <FileText size={40} className="animate-bounce" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <p className="text-xl font-black text-[#002b5c] tracking-tight">Rendering Schedule</p>
                </div>
                <p className="text-sm font-medium text-slate-400 leading-relaxed">Optimization protocol in progress. Document will appear shortly.</p>
              </div>
              <button
                onClick={() => setIframeReady(true)}
                className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors"
              >
                <RefreshCw size={12} /> Skip Rendering
              </button>
            </div>
          </div>
        )}

        <div className="h-full w-full p-6 lg:p-10 flex items-center justify-center">
          <div className="h-full w-full max-w-6xl bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <iframe
              key={schedule.scheduleLink}
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(schedule.scheduleLink)}&embedded=true`}
              className="w-full h-full border-0 select-none"
              title="Official Academic Timetable"
              onLoad={() => setIframeReady(true)}
            />
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #e2e8f0; 
          border-radius: 20px; 
          border: 4px solid white;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Timetable;