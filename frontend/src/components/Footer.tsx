import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type Notice = {
  id: string;
  subject: string;
};

const Footer = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await axios.get('/api/announcement/all', { params: { lang: i18n.language } });

        if (!mounted) return;

        const latest = (res.data.announcements || []).slice(0, 2).map((notice: any) => ({
          id: notice._id,
          subject: notice.subject,
        }));

        setNotices(latest);
      } catch (err) {
        console.error('Error fetching notices:', err);
      }
    };

    load();

    const interval = setInterval(load, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [i18n.language]);

  return (
    <footer className="w-full h-22 flex bg-white border-t border-slate-200 overflow-hidden select-none z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      <div className="w-[65%] h-full bg-[#002b5c] relative flex items-center overflow-hidden">
        <div className="absolute left-0 top-0 h-full px-8 bg-[#001f3f] flex items-center z-20 shadow-[10px_0_25px_rgba(0,0,0,0.4)] border-r border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-white font-black text-sm tracking-[0.2em] uppercase whitespace-nowrap">
              {t('footer.latestUpdates', 'Latest Updates')}
            </span>
          </div>
        </div>

        <div className="flex h-full items-center ml-[220px]">
          <div className="flex whitespace-nowrap animate-marquee-loop hover:pause cursor-pointer">
            {notices.length === 0 ? (
              <span className="text-white px-10 font-semibold">
                {t('footer.noAnnouncements', 'No announcements available')}
              </span>
            ) : (
              [...notices, ...notices].map((notice, i) => (
                <div key={i} className="flex items-center px-10">
                  <Link to={`/announcement/${notice.id}`} className="flex items-center">
                    <span className="text-white text-xl font-bold tracking-tight">
                      {notice.subject}
                    </span>
                    <span className="mx-10 text-blue-400 font-black text-2xl">•</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="w-[35%] h-full bg-white flex items-center justify-center px-10 border-l border-slate-100 relative">
        <div className="absolute top-0 right-0 w-24 h-full bg-slate-50 opacity-40 z-0 skew-x-[-20deg] translate-x-12" />

        <div className="flex items-center gap-4 w-full justify-center">
          <p className="relative z-10 text-slate-400 font-black text-[11px] uppercase tracking-widest text-center leading-tight">
            {t('footer.text')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes marquee-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-loop {
          display: flex;
          animation: marquee-loop 60s linear infinite;
        }
        .hover\\:pause:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </footer>
  );
};

export default Footer;
