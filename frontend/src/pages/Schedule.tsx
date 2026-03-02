import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays,
  Building2,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

const api = axios.create({ withCredentials: true });

interface ScheduleItem {
  _id: string;
  departmentName: string;
  semester: number;
  sectionName: string;
  scheduleLink: string;
  createdAt: string;
}

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'MECH', 'CIVIL', 'AIML', 'IoT'] as const;

const DEPT_CONFIG: Record<string, {
  gradient: string;
  barGradient: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  iconColor: string;
  dot: string;
}> = {
  CSE:  { gradient: 'from-indigo-700 to-indigo-950',   barGradient: 'from-indigo-500 to-indigo-800',   chipBg: 'bg-indigo-50',  chipText: 'text-indigo-700',  chipBorder: 'border-indigo-200',  iconColor: 'text-indigo-600',  dot: 'bg-indigo-500'  },
  ECE:  { gradient: 'from-violet-600 to-purple-950',   barGradient: 'from-violet-500 to-purple-800',   chipBg: 'bg-violet-50',  chipText: 'text-violet-700',  chipBorder: 'border-violet-200',  iconColor: 'text-violet-600',  dot: 'bg-violet-500'  },
  MECH: { gradient: 'from-amber-500 to-orange-800',    barGradient: 'from-amber-400 to-orange-700',    chipBg: 'bg-orange-50',  chipText: 'text-orange-700',  chipBorder: 'border-orange-200',  iconColor: 'text-orange-600',  dot: 'bg-orange-500'  },
  CIVIL:{ gradient: 'from-emerald-600 to-green-900',   barGradient: 'from-emerald-500 to-green-800',   chipBg: 'bg-emerald-50', chipText: 'text-emerald-700', chipBorder: 'border-emerald-200', iconColor: 'text-emerald-600', dot: 'bg-emerald-500' },
  AIML: { gradient: 'from-rose-500 to-pink-900',       barGradient: 'from-rose-400 to-pink-700',       chipBg: 'bg-rose-50',    chipText: 'text-rose-700',    chipBorder: 'border-rose-200',    iconColor: 'text-rose-600',    dot: 'bg-rose-500'    },
  IoT:  { gradient: 'from-teal-600 to-teal-950',       barGradient: 'from-teal-400 to-teal-800',       chipBg: 'bg-teal-50',    chipText: 'text-teal-700',    chipBorder: 'border-teal-200',    iconColor: 'text-teal-600',    dot: 'bg-teal-500'    },
};

const DEFAULT_CONFIG = {
  gradient: 'from-slate-600 to-slate-900', barGradient: 'from-slate-500 to-slate-700',
  chipBg: 'bg-slate-100', chipText: 'text-slate-700', chipBorder: 'border-slate-200',
  iconColor: 'text-slate-500', dot: 'bg-slate-500',
};

const Schedule = () => {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDept, setActiveDept] = useState<string>('All');

  useEffect(() => {
    api
      .get('/api/schedule/all')
      .then((res) => setSchedules(res.data || []))
      .catch(() => setError('Failed to load schedules.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeDept === 'All'
    ? schedules
    : schedules.filter((s) => s.departmentName === activeDept);

  const grouped = filtered.reduce<Record<string, ScheduleItem[]>>((acc, s) => {
    if (!acc[s.departmentName]) acc[s.departmentName] = [];
    acc[s.departmentName].push(s);
    return acc;
  }, {});

  const deptCount = [...new Set(schedules.map((s) => s.departmentName))].length;

  return (
    <div className="h-full w-full bg-zinc- rounded-3xl overflow-hidden flex flex-col font-sans">

      <div className="bg-linear-to-br from-[#001428] via-[#002050] to-[#002b5c] px-7 pt-6 pb-5 shrink-0">
        <div className="flex items-center gap-2 text-white/35 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
          <CalendarDays size={10} /> Academic Timetables
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-black text-white tracking-tight leading-none">
              Class Schedules
            </h1>
            <p className="text-white/40 text-xs font-semibold mt-1.5">
              {loading
                ? 'Loading…'
                : `${schedules.length} timetable${schedules.length !== 1 ? 's' : ''} across ${deptCount} department${deptCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          {!loading && schedules.length > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
              <FileText size={12} className="text-white/60" />
              <span className="text-white/60 text-[11px] font-black">{schedules.length} PDFs</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 px-5 py-3 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {DEPARTMENTS.map((dept) => {
          const isActive = activeDept === dept;
          const cfg = dept !== 'All' ? (DEPT_CONFIG[dept] ?? DEFAULT_CONFIG) : null;
          return (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black transition-all duration-200 border ${
                isActive
                  ? dept === 'All'
                    ? 'bg-[#002b5c] text-white border-[#002b5c] shadow-sm'
                    : `${cfg!.chipBg} ${cfg!.chipText} ${cfg!.chipBorder} shadow-sm`
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {isActive && dept !== 'All' && cfg && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
              )}
              {dept}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 size={26} className="animate-spin text-[#002b5c]/30" />
            <p className="text-xs font-bold text-slate-400">Loading schedules…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm font-semibold text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <BookOpen size={26} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold text-slate-400">No schedules available</p>
            <p className="text-[11px] text-slate-300">Try selecting a different department</p>
          </div>
        )}

        {!loading && !error && Object.entries(grouped).map(([dept, items]) => {
          const cfg = DEPT_CONFIG[dept] ?? DEFAULT_CONFIG;
          const sorted = [...items].sort(
            (a, b) => a.semester - b.semester || a.sectionName.localeCompare(b.sectionName)
          );
          return (
            <div key={dept}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black border ${cfg.chipBg} ${cfg.chipText} ${cfg.chipBorder}`}>
                  <Building2 size={10} /> {dept}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400">
                  {items.length} timetable{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {sorted.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => navigate(`/time-table/${s._id}`)}
                    className="group w-full bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md active:scale-[0.985] transition-all duration-200 overflow-hidden flex items-stretch text-left"
                  >
                    <div className={`w-1 shrink-0 bg-linear-to-b ${cfg.barGradient}`} />

                    <div className={`w-14 shrink-0 flex items-center justify-center ${cfg.chipBg} border-r border-slate-100`}>
                      <FileText size={19} className={cfg.iconColor} />
                    </div>

                    <div className="flex-1 min-w-0 px-4 py-3.5">
                      <p className="text-[13px] font-black text-[#001f48]">Semester {s.semester}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Users size={9} /> Section {s.sectionName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <GraduationCap size={9} /> {dept}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center pr-4">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-[#002b5c] flex items-center justify-center transition-colors duration-200">
                        <ChevronRight size={15} className="text-slate-300 group-hover:text-white transition-colors duration-200" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;

