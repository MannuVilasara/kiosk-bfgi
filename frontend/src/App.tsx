import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import SidePanel from './components/SidePannel';
import useInactivityTimer from './hooks/TrackInactivity';
import { Toaster } from 'react-hot-toast';


const Navigation = lazy(() => import('./pages/Navigation'));
const HelpDesk = lazy(() => import('./pages/HelpDesk'));
const Announcements = lazy(() => import('./pages/Announcements'));
const AnnouncementDetail = lazy(() => import('./pages/AnnouncementDetail'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Faculty = lazy(() => import('./pages/Faculty'));
const Blocks = lazy(() => import('./pages/Blocks'));
const Campus360 = lazy(() => import('./pages/Campus360'));
const FacultyDetail = lazy(() => import('./pages/FacultyDetail'));
const BlockDetail = lazy(() => import('./pages/BlockDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const Timetable=lazy(() => import('./pages/Timetable'));
const App = () => {
  useInactivityTimer();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="flex flex-1 mt-32 mb-16 relative">
        <div
          className="fixed top-36 left-4 bottom-26 z-40 transition-all duration-300 ease-in-out overflow-visible"
          style={{ width: isSidebarCollapsed ? 100 : 400 }}
        >
          <SidePanel
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </div>

        <div
          className="fixed top-36 right-0 bottom-26 pr-6 ml-6 z-30 transition-all duration-300 ease-in-out"
          style={{ left: isSidebarCollapsed ? 130 : 430 }}
        >
          <div className="h-full w-full">
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <div className="animate-pulse text-xl text-gray-500 font-semibold">
                    Loading...
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Campus360 />} />
                <Route path="/navigate" element={<Navigation />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/announcement/:id" element={<AnnouncementDetail />} />
                <Route path="/help" element={<HelpDesk />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/blocks" element={<Blocks />} />
                <Route path="/faculty/:id" element={<FacultyDetail />} />
                <Route path="/block/:id" element={<BlockDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path='/time-table/:id' element={<Timetable />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-50">
        <Footer />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
