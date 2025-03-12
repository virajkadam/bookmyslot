import React, { useEffect, useState } from 'react';
import png1 from '../assets/img/avatars/1.png';
import { useNavigate, NavLink } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', role: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Convert string to Camel Case
  const toCamelCase = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('user'));
    const candidateData = JSON.parse(localStorage.getItem('candidates'));

    if (adminData) {
      setUserData({ name: adminData.name || 'User', role: 'Admin' });
    } else if (candidateData) {
      setUserData({ name: candidateData.name || 'User', role: 'Candidate' });
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.clear();
      navigate('/Login', { replace: true });
      window.history.forward();
      window.addEventListener('popstate', () => {
        window.history.forward();
        navigate('/Login', { replace: true });
      });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      window.location.replace('/');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={toggleSidebar}>&times;</button>
        <ul className="sidebar-menu mt-6">
  {/* Admin Sidebar */}
  {userData.role === 'Admin' && (
    <>
      <li className="menu-item">
        <NavLink to="/AdminDashboard">
          <div data-i18n="Dashboards"><i className="menu-icon tf-icons fa-solid fa-house fa-sm"></i> Home</div>
        </NavLink>
      </li>
      <li className="menu-item">
        <NavLink to="/candidate-list-view">
          <div data-i18n="Layouts"><i className="menu-icon tf-icons fa-solid fa-users"></i> Candidates</div>
        </NavLink>
      </li>
      <li className="menu-item">
        <NavLink to="/eventapprove">
          <div data-i18n="Apps"><i className="menu-icon tf-icons fa-solid fa-calendar-days"></i> Slots</div>
        </NavLink>
      </li>
    </>
  )}

  {/* Candidate Sidebar */}
  {userData.role === 'Candidate' && (
    <>
      <li className="menu-item">
        <NavLink to="/candidatedashboard">
        <div data-i18n="Dashboards"><i className="menu-icon tf-icons fa-solid fa-house fa-sm"></i> Home</div>
        </NavLink>
      </li>
      <li className="menu-item">
        <NavLink to="/candidate-event-list">
        <div data-i18n="Apps"><i className="menu-icon tf-icons fa-solid fa-calendar-days"></i> Slots</div>
        </NavLink>
      </li>
    
    </>
  )}
</ul>

      </aside>

      {/* Navbar */}
      <nav className="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme">
        <div className="container-xxl d-flex justify-content-between">
          <div className="d-flex align-items-center">
            {/* Sidebar Toggle Button */}
            <button className="menu-toggle btn p-0 me-3 d-xl-none" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>

            {/* Brand */}
            <span className="fw-semibold ms-1">Slot Booking</span>
          </div>

          {/* User Info */}
          <div className="d-flex align-items-center">
            <div className="me-3">
              <span className="fw-semibold d-block">{toCamelCase(userData.name)}</span>
              <small className="text-muted">{userData.role}</small>
            </div>

            {/* User Dropdown */}
            <div className="dropdown">
              <button className="btn p-0 " data-bs-toggle="dropdown">
                <img src={png1} alt="User" className="w-px-40 h-auto rounded-circle" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <div className="dropdown-item">
                    <div className="d-flex">
                      <div className="me-3">
                        <img src={png1} alt="Profile" className="w-px-40 h-auto rounded-circle" />
                      </div>
                      <div>
                        <span className="fw-semibold d-block">{toCamelCase(userData.name)}</span>
                        <small className="text-muted">{userData.role}</small>
                      </div>
                    </div>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item btn btn-danger" onClick={handleLogout}>
                    <i className="ri-logout-box-r-line me-2"></i> Log Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
