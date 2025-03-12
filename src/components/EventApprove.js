import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc,query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import {
  
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import Aside from './Aside';
import Navbar from './Navbar';

const EventApprove = () => {
  const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchEvents = async () => {
    try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const eventsList = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                let candidateName = "";
                let candidateId = data.candidateId || null;

                if (candidateId) {
                    try {
                        const candidateRef = doc(db, "candidates", candidateId);
                        const candidateSnap = await getDoc(candidateRef);
                        if (candidateSnap.exists()) {
                            candidateName = candidateSnap.data().name || "";
                        }
                    } catch (error) {
                        console.error("Error fetching candidate:", error);
                    }
                }

                // Convert createdAt to a Date object properly
                let createdAt = new Date(); // Default to current date
                if (data.createdAt) {
                    if (data.createdAt.seconds) {
                        // Firestore Timestamp
                        createdAt = new Date(data.createdAt.seconds * 1000);
                    } else if (typeof data.createdAt === "string" || typeof data.createdAt === "number") {
                        // String or number timestamp
                        createdAt = new Date(data.createdAt);
                    }
                }

                return {
                    id: docSnap.id,
                    candidateId,
                    candidateName,
                    title: data.title || "No Title",
                    date: data.date || new Date().toISOString(),
                    start: data.start ? new Date(data.start) : null,
                    end: data.end ? new Date(data.end) : null,
                    status: data.status || "Pending",
                    technology: data.technology || "",
                    isApproved: data.isApproved || false,
                    createdAt, // Use the converted createdAt
                };
            })
        );

        setEvents(eventsList);
        setLoading(false);
    } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
    }
};

    
      const handleEventAction = async (eventId, action) => {
        try {
          const userStr = localStorage.getItem("user");
          if (!userStr) {
            throw new Error("Admin session not found");
          }
    
          const userData = JSON.parse(userStr);
          const eventRef = doc(db, "events", eventId);
    
          const updateData = {
            status: action === "approved" ? "Approved" : "Rejected",
            isApproved: action === "approved",
            updatedAt: new Date().toISOString(),
            updatedBy: userData.id,
            adminName: userData.name,
          };
    
          await updateDoc(eventRef, updateData);
          console.log(`Event ${action} successfully`);
          await fetchEvents();
            alert(`Event ${action === "approved" ? "approved" : "rejected"} successfully`);
        } catch (error) {
          console.error(`Error ${action} event:`, error);
          if (error.message.includes("permission-denied")) {
            alert("You don't have permission to perform this action");
                navigate("/");
          } else {
            alert(`Failed to ${action} event: ${error.message}`);
          }
        }
      };
    
      useEffect(() => {
        const initializeAdmin = async () => {
          try {
                const auth = getAuth();
                await auth.currentUser?.getIdToken(true);
            await fetchEvents();
          } catch (error) {
            console.error("Initialization error:", error);
          }
        };
    
        initializeAdmin();
      }, []);

      const handleLogout = () => {
        try {
            localStorage.clear();
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.clear();
            window.location.href = "/";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const toCamelCase = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map((word, index) => {
                if (word.length === 0) return '';
                return index === 0 
                    ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() 
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    };

    const formatTime = (timeString) => {
        if (timeString instanceof Date) {
            return timeString.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }
        
        const date = new Date(`2000-01-01T${timeString}`);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getTimeDifferenceInMinutes = (startTime, endTime) => {
        if (startTime instanceof Date && endTime instanceof Date) {
            const diffInMs = endTime - startTime;
            return Math.round(diffInMs / (1000 * 60));
        }
        
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const diffInMs = end - start;
        return Math.round(diffInMs / (1000 * 60));
    };

    const formatTimeRangeColumn = (rowData) => {
        if (!rowData.start || !rowData.end) return "No Time";
        
        const startTime = rowData.start.toTimeString().split(' ')[0];
        const endTime = rowData.end.toTimeString().split(' ')[0];
        
        const timeDiff = getTimeDifferenceInMinutes(startTime, endTime);
        
        // Format duration into hours and minutes
        let durationText;
        if (timeDiff >= 60) {
            const hours = timeDiff / 60;
            if (Number.isInteger(hours)) {
                durationText = `${hours} Hour${hours > 1 ? 's' : ''}`;
            } else {
                durationText = `${hours.toFixed(1)} Hours`;
            }
        } else {
            durationText = `${timeDiff} mins`;
        }

        return `${formatTime(startTime)} - ${formatTime(endTime)} (${durationText})`;
    };

    const handleNameClick = (candidateId) => {
        if (candidateId) {
            navigate(`/Viewpage/${candidateId}`);
        }
    };

    // Move the tooltip useEffect inside the component
    useEffect(() => {
        // Initialize all tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new window.bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Cleanup tooltips on component unmount
        return () => {
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                const tooltip = window.bootstrap.Tooltip.getInstance(tooltipTriggerEl);
                if (tooltip) {
                    tooltip.dispose();
                }
            });
        };
      }, []);

  return (
   <>
   <Navbar/>

        <div className="layout-page">
            {/* Content wrapper */}
            <div className="content-wrapper">
                {/* Menu */}
               <Aside/>
                {/* / Menu */}
                {/* Content */}
                <div className="container-xxl flex-grow-1 container-p-y">
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white d-flex align-items-center gap-4">
                                    <button
                                        className="btn btn-icon btn-secondary rounded-circle"
                                        onClick={() => navigate('/AdminDashboard')}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="Back"
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                    </button>
                                    <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">
                                    Slot Requests
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    {loading ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : events.length === 0 ? (
                                        <div className="text-center p-4">No slots found</div>
                                    ) : (
                                        <div className="table-responsive m-5">
                                            <table className="table table-hover mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Technology</th>
                                                        <th>Title</th>
                                                        <th className="d-none d-lg-table-cell">Date</th>
                                                        <th className="d-none d-lg-table-cell">Time</th>
                                                        <th>Status</th>
                                                        <th className="text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {events.map((event) => (
                                                        <tr key={event.id}>
                                                            <td>
                                                                <a 
                                                                    href="#" 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleNameClick(event.candidateId);
                                                                    }}
                                                                    className="text-primary text-decoration-none"
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {toCamelCase(event.candidateName)}
                                                                </a>
                                                            </td>
                                                            <td>{toCamelCase(event.technology)}</td>
                                                            <td>{toCamelCase(event.title)}</td>
                                                            <td className="d-none d-lg-table-cell">
                                                                {new Date(event.date).toLocaleDateString('en-GB', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </td>
                                                            <td className="d-none d-lg-table-cell">
                                                                {formatTimeRangeColumn(event)}
                                                            </td>
                                                            <td>
                                                                <span className={`badge bg-${event.status === 'Approved' ? 'success' : event.status === 'Rejected' ? 'danger' : 'warning'}`}>
                                                                    {event.status === 'Pending Approval' ? 'Pending' : event.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {event.status !== 'Approved' && event.status !== 'Rejected' && (
                                                                    <div className="d-flex gap-2 justify-content-center">
                                                                        <button
                                                                            className="btn btn-success btn-sm"
                                                                            onClick={() => handleEventAction(event.id, "approved")}
                                                                        >
                                                                            <i className="fa-solid fa-check me-2"></i>Approve
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-danger btn-sm"
                                                                            onClick={() => handleEventAction(event.id, "rejected")}
                                                                        >
                                                                            <i className="fa-solid fa-xmark me-2"></i>Reject
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*/ Content */}
                {/* Footer */}
                <footer className="content-footer footer bg-footer-theme">
                    <div className="container-xxl">
                        <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
                            <div className="text-body mb-2 mb-md-0">
                                © , made with{" "}
                                <span className="text-danger">
                                    <i className="tf-icons ri-heart-fill" />
                                </span>{" "}
                                by{" "}
                                <a
                                    href="https://themeselection.com"
                                    target="_blank"
                                    className="footer-link"
                                >
                                    ThemeSelection
                                </a>
                            </div>
                            <div className="d-none d-lg-inline-block">
                                <a
                                    href="https://themeselection.com/license/"
                                    className="footer-link me-4"
                                    target="_blank"
                                >
                                    License
                                </a>
                                <a
                                    href="https://themeselection.com/"
                                    target="_blank"
                                    className="footer-link me-4"
                                >
                                    More Themes
                                </a>
                                <a
                                    href="https://demos.themeselection.com/Slot Bokking-bootstrap-html-admin-template/documentation/"
                                    target="_blank"
                                    className="footer-link me-4"
                                >
                                    Documentation
                                </a>
                                <a
                                    href="https://themeselection.com/support/"
                                    target="_blank"
                                    className="footer-link d-none d-sm-inline-block"
                                >
                                    Support
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
                {/* / Footer */}
                <div className="content-backdrop fade" />
            </div>
        </div>
   </>
    );
};

export default EventApprove;