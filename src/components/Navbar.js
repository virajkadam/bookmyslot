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
            <span className="app-brand-logo demo">
              <span style={{ color: "var(--bs-primary)" }}>
                <svg
                  width={30}
                  height={24}
                  viewBox="0 0 250 196"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.3002 1.25469L56.655 28.6432C59.0349 30.1128 60.4839 32.711 60.4839 35.5089V160.63C60.4839 163.468 58.9941 166.097 56.5603 167.553L12.2055 194.107C8.3836 196.395 3.43136 195.15 1.14435 191.327C0.395485 190.075 0 188.643 0 187.184V8.12039C0 3.66447 3.61061 0.0522461 8.06452 0.0522461C9.56056 0.0522461 11.0271 0.468577 12.3002 1.25469Z"
                    fill="currentColor"
                  />
                  <path
                    opacity="0.077704"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 65.2656L60.4839 99.9629V133.979L0 65.2656Z"
                    fill="black"
                  />
                  <path
                    opacity="0.077704"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 65.2656L60.4839 99.0795V119.859L0 65.2656Z"
                    fill="black"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M237.71 1.22393L193.355 28.5207C190.97 29.9889 189.516 32.5905 189.516 35.3927V160.631C189.516 163.469 191.006 166.098 193.44 167.555L237.794 194.108C241.616 196.396 246.569 195.151 248.856 191.328C249.605 190.076 250 188.644 250 187.185V8.09597C250 3.64006 246.389 0.027832 241.935 0.027832C240.444 0.027832 238.981 0.441882 237.71 1.22393Z"
                    fill="currentColor"
                  />
                  <path
                    opacity="0.077704"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M250 65.2656L189.516 99.8897V135.006L250 65.2656Z"
                    fill="black"
                  />
                  <path
                    opacity="0.077704"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M250 65.2656L189.516 99.0497V120.886L250 65.2656Z"
                    fill="black"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.2787 1.18923L125 70.3075V136.87L0 65.2465V8.06814C0 3.61223 3.61061 0 8.06452 0C9.552 0 11.0105 0.411583 12.2787 1.18923Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.2787 1.18923L125 70.3075V136.87L0 65.2465V8.06814C0 3.61223 3.61061 0 8.06452 0C9.552 0 11.0105 0.411583 12.2787 1.18923Z"
                    fill="white"
                    fillOpacity="0.15"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M237.721 1.18923L125 70.3075V136.87L250 65.2465V8.06814C250 3.61223 246.389 0 241.935 0C240.448 0 238.99 0.411583 237.721 1.18923Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M237.721 1.18923L125 70.3075V136.87L250 65.2465V8.06814C250 3.61223 246.389 0 241.935 0C240.448 0 238.99 0.411583 237.721 1.18923Z"
                    fill="white"
                    fillOpacity="0.3"
                  />
                </svg>
              </span>
            </span>
            <span className="app-brand-text demo menu-text fw-semibold ms-1">
              Materio
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