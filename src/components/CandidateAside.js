import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Aside.css';

const CandidateAside = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        try {
            // Clear localStorage
            localStorage.clear();

            // Navigate to login page and replace the current history entry
            navigate('/', { replace: true });

            // Prevent back navigation by manipulating the history stack
            setTimeout(() => {
                // Push a new state to the history to prevent the user from going back
                window.history.pushState(null, '', window.location.href);

                // Prevent back navigation and force forward to stay on the login page
                window.history.forward();
            }, 100); // Delay to ensure navigation to the login page happens first
        } catch (error) {
            console.error("Logout error:", error);
            // Fallback method in case of any error
            localStorage.clear();
            window.location.replace('/');
        }
    };

    // Check if current path is event-related
    const isEventRoute = () => {
        const path = location.pathname;
        return path.includes('event');
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
                                to="/candidatedashboard"
                                className={({ isActive }) =>
                                    `menu-link menu-toggle ${isActive ? 'active' : ''}`
                                }
                            >
                                <i className="menu-icon tf-icons fa-solid fa-house"></i>
                                <div data-i18n="Dashboards">Home</div>
                            </NavLink>
                        </li>
                        {/* Events */}
                        <li className="menu-item">
                            <NavLink
                                to="/candidate-event-list"
                                className={({ isActive }) =>
                                    `menu-link menu-toggle ${isActive || isEventRoute() ? 'active' : ''}`
                                }
                            >
                                <i className="menu-icon tf-icons fa-solid fa-calendar-days"></i>
                                <div data-i18n="Apps">Events</div>
                            </NavLink>
                        </li>
                    </ul>

                   
                </div>
            </aside>
        </>
    );
};

export default CandidateAside;
