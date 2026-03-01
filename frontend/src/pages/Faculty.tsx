import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Users,
  ChevronRight,
  Search,
  Building2,
  Loader2,
  AlertCircle,
  Contact2,
} from 'lucide-react';

interface FacultyMember {
  _id: string;
  facultyName: string;
  designation: string;
  qualification: string;
  totalExperience: number;
  imageUrl: string;
  email: string;
  phoneNumber: string;
  department: 'CSE' | 'ECE' | 'MECH' | 'CIVIL' | 'EEE' | 'IT';
  translations?: Record<string, { facultyName?: string; designation?: string; qualification?: string }>;
  __v?: number;
}

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'] as const;

/** Get a translated field, falling back to the English (root) value. */
const localized = (
  member: FacultyMember,
  field: 'facultyName' | 'designation' | 'qualification',
  lang: string
): string => {
  if (lang === 'en') return member[field];
  return member.translations?.[lang]?.[field] || member[field];
};

export const Faculty = () => {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('CSE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const fetchFaculty = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/faculty/all');
      setFaculty(res.data.faculties || []);
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError(t('faculty.unableToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((member) => {
      const matchesDept = member.department === selectedDept;
      const matchesSearch = localized(member, 'facultyName', i18n.language).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [faculty, selectedDept, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-[#fcfdfe] rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 font-sans relative">
      <div className="p-10 pb-6 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Users className="text-[#002b5c]" size={20} />
              <span className="text-[#002b5c] font-black text-[9px] tracking-[0.4em] uppercase opacity-60">
                {t('faculty.departmentDirectory')}
              </span>
            </div>
            <h2 className="text-4xl font-black text-[#002b5c] tracking-tight">{t('faculty.ourFaculty')}</h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 w-72 transition-all focus-within:ring-2 focus-within:ring-[#002b5c]/10">
            <Search className="ml-3 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('faculty.searchPlaceholder')}
              className="bg-transparent py-2 pr-4 text-base focus:outline-none font-bold text-[#002b5c] w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all active:scale-95 whitespace-nowrap border ${
                selectedDept === dept
                  ? 'bg-[#002b5c] text-white border-transparent shadow-lg shadow-[#002b5c]/20'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/20">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-[#002b5c] animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {t('faculty.syncingDirectory')}
            </p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <AlertCircle size={40} className="text-red-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-6">{error}</h3>
            <button
              onClick={fetchFaculty}
              className="px-8 py-3 bg-[#002b5c] text-white rounded-xl font-bold active:scale-95 transition-all text-sm"
            >
              {t('common.retrySync')}
            </button>
          </div>
        ) : filteredFaculty.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredFaculty.map((member) => (
              <div
                key={member._id}
                onClick={() => navigate(`/faculty/${member._id}`)}
                className="group bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-sm border border-slate-100 hover:border-[#002b5c]/30 hover:shadow-xl hover:shadow-[#002b5c]/5 transition-all duration-300 cursor-pointer active:scale-[0.97] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#002b5c] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative mb-5 shrink-0">
                  <div className="absolute inset-0 bg-[#002b5c] rounded-full blur-xl opacity-0 group-hover:opacity-10 transition-all duration-500" />
                  <img
                    src={member.imageUrl || 'https://via.placeholder.com/300'}
                    alt={member.facultyName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md relative z-10 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300';
                    }}
                  />
                </div>

                <div className="flex-1 flex flex-col min-w-0 mb-5">
                  <h3 className="text-xl font-black text-[#002b5c] tracking-tight leading-tight line-clamp-1 mb-1">
                    {localized(member, 'facultyName', i18n.language)}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {localized(member, 'designation', i18n.language)}
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-[#002b5c] font-black text-[10px] group-hover:gap-3 transition-all uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100">
                  <Contact2 size={14} />
                  {t('faculty.viewContactDetails')} <ChevronRight size={14} strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-slate-400 grayscale">
            <Building2 size={100} strokeWidth={1} />
            <h3 className="text-xl font-black mt-4 uppercase tracking-widest">{t('faculty.noEntries')}</h3>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0, 43, 92, 0.1); 
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Faculty;
