import React, { useEffect, useState } from 'react'
import png1 from '../assets/img/avatars/1.png'
import { useNavigate,Link } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({ name: '', role: '' })

  // Add toCamelCase function
  const toCamelCase = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => {
        if (word.length === 0) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  useEffect(() => {
    // Try to get user data from both admin and candidate storage
    const adminData = JSON.parse(localStorage.getItem('user'))
    const candidateData = JSON.parse(localStorage.getItem('candidates'))
    
    if (adminData) {
      setUserData({
        name: adminData.name || 'User',
        role: 'Admin'
      })
    } else if (candidateData) {
      setUserData({
        name: candidateData.name || 'User',
        role: 'Candidate'
      })
    }
  }, [])

  const handleLogout = () => {
    try {
        // Clear localStorage
        localStorage.clear();
        // Navigate to login and replace history
        navigate('/', { replace: true });
        // Prevent back navigation
        window.history.forward();
        // Add event listener to prevent back navigation
        window.addEventListener('load', function() {
            window.history.forward();
        });
        window.addEventListener('popstate', function() {
            window.history.forward();
            navigate('/', { replace: true });
        });
    } catch (error) {
        console.error("Logout error:", error);
        localStorage.clear();
        window.location.replace('/');
    }
};

  const handleClick = (e) => {
    e.preventDefault()
  }

  return (
    <nav className="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme" id="layout-navbar">
      <div className="container-xxl">
        <div className="navbar-brand app-brand demo d-none d-xl-flex py-0 me-6">
          <a onClick={handleClick} className="app-brand-link gap-2" role="button">
          
            <span className="app-brand-text demo menu-text fw-semibold ms-1">
              Slot Bokking
            </span>
          </a>
          <a
            onClick={handleClick}
            className="layout-menu-toggle menu-link text-large ms-auto d-xl-none"
            role="button"
          >
            <i className="ri-close-fill align-middle" />
          </a>
        </div>
        <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0  d-xl-none  ">
          <a onClick={handleClick} className="nav-item nav-link px-0 me-xl-6" role="button">
            <i className="ri-menu-fill ri-24px" />
          </a>
        </div>
        <div
      className="navbar-nav-right d-flex align-items-center"
      id="navbar-collapse"
    >
      <ul className="navbar-nav flex-row align-items-center ms-auto">
        
        
      <li className="nav-item me-2">
              <div className="flex-grow-1">
                <span className="fw-semibold d-block">{toCamelCase(userData.name)}</span>
                <small className="text-muted">{userData.role}</small>
              </div>
            </li>
        
        {/* User */}
        <li className="nav-item navbar-dropdown dropdown-user dropdown">
          <a
            className="nav-link dropdown-toggle hide-arrow p-0"
            href="#"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="avatar avatar-online">
              <img
                src={png1}
                alt=""
                className="w-px-40 h-auto rounded-circle"
              />
            </div>
          </a>
          <ul className="dropdown-menu dropdown-menu-end mt-3 py-2">
          <li>
                  <a className="dropdown-item" href="#" onClick={handleClick}>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-3">
                        <div className="avatar avatar-online">
                          <img 
                            src={png1} 
                            alt="Profile" 
                            className="w-px-40 h-auto rounded-circle"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <span className="fw-semibold d-block">{toCamelCase(userData.name)}</span>
                        <small className="text-muted">{userData.role}</small>
                      </div>
                    </div>
                  </a>
                </li>
            <li>
              <div className="dropdown-divider" />
            </li>
           
           
           
          
           
            
            <li>
            <div className="d-grid px-4 pt-2 pb-1">
                  <a 
                    className="dropdown-item btn btn-danger d-flex waves-effect waves-light rounded" 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    <i className="ri-logout-box-r-line me-2"></i>
                    <span className="align-middle">Log Out</span>
                  </a>
                  </div>
                </li>
          </ul>
        </li>
        {/*/ User */}
      </ul>
    </div>
      </div>
    </nav>
  )
}

export default Navbar