import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import CandidateAside from './CandidateAside';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

const CandidateEventList = () => {
    const [events, setEvents] = useState([]);
    const [selectedFeedbackEvent, setSelectedFeedbackEvent] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Add these formatter functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeString) => {
        const date = new Date(`2000-01-01T${timeString}`);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getTimeDifferenceInMinutes = (startTime, endTime) => {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const diffInMs = end - start;
        return Math.round(diffInMs / (1000 * 60)); // Convert ms to minutes
    };

    const isPastEvent = (start) => {
        return new Date(start) < new Date();
    };

    // Format functions for DataTable
    const formatDateColumn = (rowData) => {
        if (!rowData.start) return "No Date";
        const date = new Date(rowData.start.split("T")[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const style = {
            color: date < today ? "#dc3545" : "inherit",
        };

        return <span style={style}>{formatDate(rowData.start.split("T")[0])}</span>;
    };

    const formatTimeRangeColumn = (rowData) => {
        if (!rowData.start || !rowData.end) return "No Time";
        const startTime = rowData.start.split("T")[1];
        const endTime = rowData.end.split("T")[1];
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

    const actionBodyTemplate = (rowData) => {
        const isPast = isPastEvent(rowData.start);
        const hasFeedback = rowData.feedback && rowData.feedback.trim().length > 0;

        return (
            <div className="d-flex justify-content-center gap-2">
                {/* Edit button - show only for future events */}
                {!isPast && (
                    <button
                        className="btn btn-sm btn-warning"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/candidate-event-add-edit/${rowData.id}`);
                        }}
                    >
                        <i className="pi pi-pencil"></i> Edit
                    </button>
                )}

                {/* Feedback button - only for past events without feedback */}
                {isPast && !hasFeedback && (
                    <button
                        className="btn btn-sm btn-info"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFeedbackModal(rowData);
                        }}
                    >
                        <i className="pi pi-comment"></i> Feedback
                    </button>
                )}

                {/* Delete button - only for future events */}
                {!isPast && (
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(rowData.id);
                        }}
                    >
                        <i className="pi pi-trash"></i> Delete
                    </button>
                )}
            </div>
        );
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
    
            try {
                console.log("📢 Fetching all events...");
    
                const eventsRef = collection(db, "events");
                const eventsSnap = await getDocs(eventsRef);
    
                if (eventsSnap.empty) {
                    console.log("ℹ️ No events found");
                    setEvents([]);
                    return;
                }
    
                const eventsData = eventsSnap.docs.map((doc) => {
                    const eventData = doc.data();
                    
                    // ✅ Handle different types of `createdAt`
                    let createdAt;
                    if (eventData.createdAt) {
                        if (eventData.createdAt.toDate) {
                            createdAt = eventData.createdAt.toDate(); // Firestore Timestamp
                        } else {
                            createdAt = new Date(eventData.createdAt); // Date string or number
                        }
                    } else {
                        createdAt = new Date(0); // Default to epoch if missing
                    }
    
                    return {
                        id: doc.id,
                        ...eventData,
                        createdAt, // Store parsed date
                        status: eventData.isApproved ? "Approved" : "Pending Approval",
                    };
                });
    
                // ✅ Sort events by creation date (Newest first)
                const sortedEvents = eventsData.sort((a, b) => b.createdAt - a.createdAt);
    
                console.log("✅ All events fetched:", sortedEvents);
                setEvents(sortedEvents);
            } catch (error) {
                console.error("❌ Error fetching events:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchEvents();
    }, []);
    
    

    const handleOpenFeedbackModal = (event) => {
        setSelectedFeedbackEvent(event);
        setFeedback(event.feedback || "");
    };

    const handleCloseFeedbackModal = () => {
        setSelectedFeedbackEvent(null);
        setFeedback("");
    };

    const handleSubmitFeedback = async () => {
        if (!selectedFeedbackEvent || !feedback.trim()) {
            alert("Please enter feedback before submitting");
            return;
        }

        try {
            const candidateData = JSON.parse(localStorage.getItem("candidates"));

            if (!candidateData?.id) {
                alert("Please sign in again to submit feedback");
                navigate("/");
                return;
            }

            if (selectedFeedbackEvent.candidateId !== candidateData.id) {
                alert("You can only provide feedback for your own events");
                return;
            }

            const eventRef = doc(db, "events", selectedFeedbackEvent.id);
            const updateData = {
                feedback: feedback.trim(),
                lastUpdatedAt: new Date().toISOString(),
                lastUpdatedBy: candidateData.id,
                candidateId: candidateData.id,
            };

            await updateDoc(eventRef, updateData);
            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === selectedFeedbackEvent.id
                        ? { ...event, ...updateData }
                        : event
                )
            );

            alert("Feedback submitted successfully!");
            handleCloseFeedbackModal();
        } catch (error) {
            console.error("Error updating feedback:", error);
            alert("Failed to submit feedback. Please try again.");
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const event = events.find((e) => e.id === eventId);
            const candidateData = JSON.parse(localStorage.getItem("candidates"));

            // Check if event exists
            if (!event) {
                alert("Event not found!");
                return;
            }

            // Check if it's a past event
            if (isPastEvent(event.start)) {
                alert("Cannot delete past events!");
                return;
            }

            // Verify ownership
            if (event.candidateId !== candidateData?.id) {
                alert("You can only delete your own events!");
                return;
            }

            // Delete the event
            await deleteDoc(doc(db, "events", eventId));

            // Update local state
            setEvents(events.filter((e) => e.id !== eventId));
            alert("Event deleted successfully!");
        } catch (error) {
            console.error("Error deleting event:", error);
            if (error.code === "permission-denied") {
                alert("You don't have permission to delete this event.");
            } else {
                alert(`Failed to delete event: ${error.message}`);
            }
        }
    };

    // Add titleCase helper function
    const toTitleCase = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

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
            <Navbar />

            <div className="layout-page">
                {/* Content wrapper */}
                <div className="content-wrapper">

                    <CandidateAside />

                    <div className="container-xxl flex-grow-1 container-p-y">
                        <div className="row g-6">

                            {/* Event List Section */}
                            <div className="col-12 my-4">


                                <div className="card shadow-sm">
                                    <div className="card-header bg-white d-flex align-items-center gap-4">
                                        <button
                                            className="btn btn-icon btn-secondary rounded-circle"
                                            onClick={() => navigate('/candidatedashboard')}
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="top"
                                            title="Back"
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <i className="fas fa-arrow-left"></i>
                                        </button>
                                        <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">My Slots</h5>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => navigate('/candidate-event-add-edit')}
                                        >
                                            <i className="fa-solid fa-plus me-2"></i>
                                            Add Slot
                                        </button>
                                    </div>
                                    <div className="card-body p-0">
                                        {loading ? (
                                            <div className="text-center p-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : events.length === 0 ? (
                                            <div className="text-center p-4">No events found</div>
                                        ) : (
                                            <div className="table-responsive m-5">
                                                <table className="table table-hover mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Title</th>
                                                            <th>Company Name</th>
                                                            <th>Technology</th>
                                                            <th>Round</th>
                                                            <th className="d-none d-lg-table-cell">Date</th>
                                                            <th className="d-none d-lg-table-cell">Time</th>
                                                            <th>Feedback</th>
                                                            <th className="text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {events.map((event) => (
                                                            <tr key={event.id}>
                                                                <td>{toTitleCase(event.title)}</td>
                                                                <td>{toTitleCase(event.company)}</td>
                                                                <td>{toTitleCase(event.technology)}</td>
                                                                <td>{event.interviewRound}</td>
                                                                <td className="d-none d-lg-table-cell">
                                                                    {formatDateColumn(event)}
                                                                </td>
                                                                <td className="d-none d-lg-table-cell">
                                                                    {formatTimeRangeColumn(event)}
                                                                </td>
                                                                <td>{event.feedback || '-'}</td>
                                                                <td>
                                                                    <div className="d-flex gap-2 justify-content-center">
                                                                        {!isPastEvent(event.start) && (
                                                                            <>
                                                                                <button
                                                                                    className="btn btn-warning btn-sm"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        navigate(`/candidate-event-add-edit/${event.id}`);
                                                                                    }}
                                                                                >
                                                                                    <i className="fa-solid fa-pencil me-2"></i>Edit
                                                                                </button>
                                                                                <button
                                                                                    className="btn btn-danger btn-sm"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteEvent(event.id);
                                                                                    }}
                                                                                >
                                                                                    <i className="fa-solid fa-trash me-2"></i>Delete
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        {isPastEvent(event.start) && !event.feedback && (
                                                                            <button
                                                                                className="btn btn-info btn-sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleOpenFeedbackModal(event);
                                                                                }}
                                                                            >
                                                                                <i className="fa-solid fa-comment me-2"></i>Feedback
                                                                            </button>
                                                                        )}
                                                                    </div>
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

                            {/* Feedback Modal - Made Responsive */}
                            {selectedFeedbackEvent && (
                                <div className="modal fade show d-block" tabIndex="-1">
                                    <div className="modal-dialog modal-responsive">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">
                                                    HR Feedback for {selectedFeedbackEvent.title}
                                                </h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={handleCloseFeedbackModal}
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <label>HR Feedback</label>
                                                <textarea
                                                    placeholder="Enter HR feedback here"
                                                    className="form-control"
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    rows="4"
                                                ></textarea>
                                            </div>
                                            <div className="modal-footer d-flex justify-content-between">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={handleCloseFeedbackModal}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleSubmitFeedback}
                                                >
                                                    Submit Feedback
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>

            </div>

        </>
    );
};

export default CandidateEventList;