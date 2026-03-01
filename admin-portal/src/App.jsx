import React, { useContext } from 'react';
import Navbar from './components/Navbar';
import SideBar from './components/SideBar';
import Footer from './components/Footer';
import { Routes, useLocation } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import CreateAdmin from './pages/CreateAdmin';
import CreateUser from './pages/CreateUser';
import CreateNotifications from './pages/CreateNotifications';
import Faculty from './pages/Faculty';
import HelpRequests from './pages/HelpRequests';
import { authContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Notifications from './pages/Notifications';
import Notification from './pages/Notification';
import { Navigate, Outlet } from 'react-router-dom';
import Settings from './pages/Settings';
import Ticket from './pages/Ticket';
import Blocks from './pages/Blocks';
import UpdateFaculty from './pages/UpdateFaculty';

const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children ? children : <Outlet />;
};

const App = () => {
  const location = useLocation();
  const { user } = useContext(authContext);
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="">
      {!isLoginPage && <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />}
      {!isLoginPage && <SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<ProtectedRoute user={user} />}>
          <Route
            path="/dashboard"
            element={
              user && user.role === 'superAdmin' ? (
                <SuperAdminDashboard />
              ) : user && user.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <UserDashboard />
              )
            }
          />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/create-notifications" element={<CreateNotifications />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/help-requests" element={<HelpRequests />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notification/:id" element={<Notification />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ticket/:id" element={<Ticket />} />
          <Route path='/blocks' element={<Blocks/>}/>
          <Route path='/update-faculty/:id' element={<UpdateFaculty/>}/>
        </Route>
      </Routes>
      {!isLoginPage && <Footer />}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
