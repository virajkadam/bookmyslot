import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import './Aside.css'

const Aside = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if current path is candidate-related
    const isCandidateRoute = () => {
        const path = location.pathname;
        return path.includes('candidate-list-view') || 
               path.includes('candidate-add-edit') ||
               path.startsWith('/Viewpage/'); // Include Viewpage route
    };

    // Check if current path is event-related
    const isEventRoute = () => {
        const path = location.pathname;
        return path.includes('eventapprove');
    };

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

    return (
        <>
            <aside
                id="layout-menu"
                className="layout-menu-horizontal menu-horizontal menu bg-menu-theme flex-grow-0"
            >
                <div className="container-xxl d-flex h-100 justify-content-between align-items-center">
                    <ul className="menu-inner">
                        {/* Dashboards */}
                        <li className="menu-item">
                            <NavLink 
                                to="/AdminDashboard" 
                                className={({ isActive }) => 
                                    `menu-link menu-toggle ${isActive ? 'active' : ''}`
                                }
                            >
                                <i className="menu-icon tf-icons fa-solid fa-house fa-sm"></i>
                                <div data-i18n="Dashboards">Home</div>
                            </NavLink>
                        </li>
                        {/* Candidates */}
                        <li className="menu-item">
                            <NavLink 
                                to="/candidate-list-view" 
                                className={({ isActive }) => 
                                    `menu-link menu-toggle ${isActive || isCandidateRoute() ? 'active' : ''}`
                                }
                            >
                                <i className="menu-icon tf-icons fa-solid fa-users"></i>
                                <div data-i18n="Layouts">Candidates</div>
                            </NavLink>
                        </li>
                        {/* Events */}
                        <li className="menu-item">
                            <NavLink 
                                to="/eventapprove" 
                                className={({ isActive }) => 
                                    `menu-link menu-toggle ${isActive || isEventRoute() ? 'active' : ''}`
                                }
                            >
                                <i className="menu-icon tf-icons fa-solid fa-calendar-days"></i>
                                <div data-i18n="Apps">Slots</div>
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink 
                                to="/fees" 
                                className={({ isActive }) => 
                                    `menu-link menu-toggle ${isActive || isEventRoute() ? 'active' : ''}`
                                }
                            >
                                <i className="menu-icon tf-icons fa-solid fa-money-bill-wave"></i>
                                <div data-i18n="Apps">Frees</div>
                            </NavLink>
                        </li>
                    </ul>

                   
                </div>
            </aside>
        </>
    )
}

export default Aside