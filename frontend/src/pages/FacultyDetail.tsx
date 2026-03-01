import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  AlertCircle,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  ChevronLeft,
  BadgeCheck,
  Building,
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

/** Get a translated field, falling back to the English (root) value. */
const localized = (
  member: FacultyMember,
  field: 'facultyName' | 'designation' | 'qualification',
  lang: string
): string => {
  if (lang === 'en') return member[field];
  return member.translations?.[lang]?.[field] || member[field];
};

const FacultyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<FacultyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/faculty/${id}`);
        setData(res.data.faculty || res.data);
      } catch (err) {
        console.error('Error fetching faculty detail:', err);
        setError(t('facultyDetail.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading)
    return (
      <div className="h-full bg-white rounded-[40px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-100 border-t-[#002b5c] rounded-full animate-spin" />
          <span className="text-slate-300 font-bold tracking-[0.3em] text-[10px] uppercase">
            {t('facultyDetail.retrievingProfile')}
          </span>
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-[40px] p-20 text-center border border-slate-100">
        <AlertCircle size={40} className="text-red-300 mb-6" />
        <h3 className="text-xl font-bold text-[#002b5c] mb-8">{error || t('facultyDetail.facultyNotFound')}</h3>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-[#002b5c] text-white rounded-xl font-bold active:scale-95 transition-all text-sm"
        >
          {t('common.returnToDirectory')}
        </button>
      </div>
    );

  return (
    <div className="h-full bg-[#fcfdfe] rounded-[40px] overflow-hidden flex flex-col font-sans relative">
      <header className="shrink-0 px-12 py-10 flex justify-between items-center z-20">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 active:scale-95 transition-all"
        >
          <ChevronLeft size={18} className="text-[#002b5c]" />
          <span className="text-[11px] font-black text-[#002b5c] uppercase tracking-widest">
            {t('common.backToDirectory')}
          </span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">
              {t('facultyDetail.academicUnit')}
            </span>
            <span className="text-sm font-bold text-[#002b5c]">{data.department} {t('facultyDetail.engineering')}</span>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <BadgeCheck className="text-blue-500" size={24} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-12 lg:px-24 pb-20">
        <section className="flex flex-col lg:flex-row items-center lg:items-end gap-12 mb-20 border-b border-slate-100 pb-16">
          <div className="relative shrink-0">
            <div className="w-56 h-56 bg-white p-3 rounded-[32px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10">
              <img
                src={data.imageUrl}
                alt={data.facultyName}
                className="w-full h-full object-cover rounded-2xl shadow-inner"
              />
            </div>
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-slate-50 rounded-2xl -z-0 border border-slate-100" />
          </div>

          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full mb-4">
              <Building size={14} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {t('facultyDetail.verifiedFaculty')}
              </span>
            </div>
            <h1 className="text-6xl font-black text-[#002b5c] tracking-tighter leading-none mb-4">
              {localized(data, 'facultyName', i18n.language)}
            </h1>
            <p className="text-2xl font-medium text-slate-400 italic">{localized(data, 'designation', i18n.language)}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-16">
            <section>
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-slate-200" />
                {t('facultyDetail.professionalBackground')}
              </h4>

              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#002b5c]/5 flex items-center justify-center text-[#002b5c] shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t('facultyDetail.highestQualification')}
                    </p>
                    <p className="text-xl font-bold text-slate-700 leading-snug">
                      {localized(data, 'qualification', i18n.language)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#002b5c]/5 flex items-center justify-center text-[#002b5c] shrink-0">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t('facultyDetail.careerTenure')}
                    </p>
                    <p className="text-xl font-bold text-slate-700">
                      {t('facultyDetail.yearsExperience', { count: data.totalExperience })}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:pl-12 lg:border-l border-slate-100 space-y-16">
            <section>
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-slate-200" />
                {t('facultyDetail.connectivity')}
              </h4>

              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#002b5c]">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t('facultyDetail.officialEmail')}
                    </p>
                    <p className="text-lg font-bold text-[#002b5c]">{data.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#002b5c]">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {t('facultyDetail.extensionPhone')}
                    </p>
                    <p className="text-lg font-bold text-[#002b5c]">{data.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #f1f5f9; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default FacultyDetail;
