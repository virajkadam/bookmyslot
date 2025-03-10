import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, query, where, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import CandidateAside from './CandidateAside'
import { useNavigate, useParams } from "react-router-dom";
import Navbar from './Navbar';

const CandidateAddOrEditEvent = () => {
    const { eventId } = useParams();
    const [events, setEvents] = useState([]);
    const [eventTitle, setEventTitle] = useState("");
    const [eventCompanyName, setCompanyName] = useState("");
    const [eventInterviewRound, setInterviewRound] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [eventTechnolgy, setTechnology] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Time validation functions
    const isValidTimeRange = (time) => {
        const [hours] = time.split(":").map(Number);
        return hours >= 9 && hours < 21; // 9 AM to 9 PM
    };

    const isLunchTime = (startTime, endTime) => {
        if (!startTime || !endTime) return false;

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const lunchStartHour = 13; // 1 PM
        const lunchStartMinute = 0;
        const lunchEndHour = 13; // 1:30 PM
        const lunchEndMinute = 30;

        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMinute;
        const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMinute;

        return (
            (startTimeInMinutes <= lunchStartInMinutes && endTimeInMinutes > lunchStartInMinutes) ||
            (startTimeInMinutes >= lunchStartInMinutes && startTimeInMinutes < lunchEndInMinutes) ||
            (startTimeInMinutes <= lunchStartInMinutes && endTimeInMinutes >= lunchEndInMinutes)
        );
    };

    const checkTimeOverlap = (selectedDate, startTime, endTime) => {
        if (!selectedDate || !startTime || !endTime) return false;

        const newStart = new Date(`${selectedDate}T${startTime}`);
        const newEnd = new Date(`${selectedDate}T${endTime}`);

        return events.some((event) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            if (eventStart.toDateString() !== newStart.toDateString()) return false;

  return (
                (newStart >= eventStart && newStart < eventEnd) ||
                (newEnd > eventStart && newEnd <= eventEnd) ||
                (newStart <= eventStart && newEnd >= eventEnd)
            );
        });
    };

    // Fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsRef = collection(db, "events");
                const eventsSnap = await getDocs(eventsRef);
                const eventsData = eventsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, []);

    // Add useEffect to fetch event data if eventId exists
    useEffect(() => {
        const fetchEventData = async () => {
            if (!eventId) return;

            try {
                const eventRef = doc(db, "events", eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    const data = eventSnap.data();
                    setEventTitle(data.title || "");
                    setCompanyName(data.company || "");
                    setTechnology(data.technology || "");
                    setInterviewRound(data.interviewRound || "");
                    setEventDate(data.date || "");
                    setStartTime(data.start?.split('T')[1]?.slice(0, 5) || "");
                    setEndTime(data.end?.split('T')[1]?.slice(0, 5) || "");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
                alert("Error loading event data");
            }
        };

        fetchEventData();
    }, [eventId]);

    // Validation function
    const validateFields = () => {
        const newErrors = {};

        if (!eventTitle?.trim()) newErrors.title = "Title is required";
        if (!eventCompanyName?.trim()) newErrors.company = "Company name is required";
        if (!eventTechnolgy?.trim()) newErrors.technology = "Technology is required";
        if (!eventInterviewRound) newErrors.round = "Interview round is required";
        if (!eventDate) newErrors.date = "Date is required";
        if (!startTime) newErrors.startTime = "Start time is required";
        if (!endTime) newErrors.endTime = "End time is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleAddEvent = async () => {
        if (!validateFields()) {
            alert("Please fill all required fields correctly");
            return;
        }

        try {
            const candidateData = JSON.parse(localStorage.getItem("candidates"));

            if (!candidateData?.id) {
                alert("Please sign in again");
                navigate("/");
                return;
            }

            const startDateTime = `${eventDate}T${startTime}:00`;
            const endDateTime = `${eventDate}T${endTime}:00`;

            const eventData = {
                title: eventTitle.trim(),
                company: eventCompanyName.trim(),
                technology: eventTechnolgy.trim(),
                interviewRound: eventInterviewRound,
                start: startDateTime,
                end: endDateTime,
                date: eventDate,
                status: "Pending Approval",
                feedback: "",
                createdAt: new Date().toISOString(),
                candidateId: candidateData.id,
                isApproved: false,
            };

            if (eventId) {
                // Update existing event
                const eventRef = doc(db, "events", eventId);
                await updateDoc(eventRef, eventData);
                alert("Event updated successfully!");
            } else {
                // Add new event
                const eventsRef = collection(db, "events");
                await addDoc(eventsRef, eventData);
                alert("Event added successfully!");
            }

            navigate('/candidate-event-list');
        } catch (error) {
            console.error("Error saving event:", error);
            alert(`Failed to ${eventId ? 'update' : 'add'} event: ${error.message}`);
        }
    };

    const getCurrentDateString = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
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
     <Navbar/>

        <div className="layout-page">
            {/* Content wrapper */}
            <div className="content-wrapper">

                <CandidateAside/>

                <div className="container-xxl flex-grow-1 container-p-y">
                    <div className="row g-6">

                        {/* Event Form Section - Made Responsive */}
      <div className="event-form-container">
        <div className="row">
          <div className="col-12">
                                        

            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex align-items-center gap-4">
                <button
                    className="btn btn-icon btn-secondary rounded-circle"
                    onClick={() => navigate('/candidate-event-list')}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Back"
                    style={{ width: '40px', height: '40px' }}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">
                    {eventId ? 'Edit Event' : 'Add Event'}
                </h5>
              </div>
              <div className="card-body">
              <div className="row g-3">
                {/* Event Title */}
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="form-group-responsive">
                    <label className="form-label">
                      Event Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Enter event title"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="form-group-responsive">
                    <label className="form-label">
                      Company Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={eventCompanyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                {/* Technology */}
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="form-group-responsive">
                    <label className="form-label">
                      Technology <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={eventTechnolgy}
                      onChange={(e) => setTechnology(e.target.value)}
                      placeholder="Enter Technology"
                    />
                  </div>
                </div>

                {/* Interview Round */}
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="form-group-responsive">
                    <label className="form-label">
                      Round <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={eventInterviewRound}
                      onChange={(e) => setInterviewRound(e.target.value)}
                    >
                      <option value="">Select Round</option>
                      <option value="Round 1">Technical Assessment Test</option>
                      <option value="Round 2">
                        Technical Discussion Round
                      </option>
                      <option value="Round 3">Manager Round</option>
                      <option value="Final Round">HR Round</option>
                    </select>
                  </div>
                </div>

                {/* Date and Time Section */}
                <div className="col-12">
                  <div className="row g-3">
                    {/* Date */}
                      <div className="col-12 col-md-3">
                      <div className="form-group-responsive">
                        <label className="form-label">
                          Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={eventDate}
                          min={getCurrentDateString()}
                          onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            if (selectedDate.getDay() === 0) {
                              alert(
                                "Sundays are not allowed. Please select another date."
                              );
                              setEventDate("");
                            } else {
                              setEventDate(e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Start Time */}
                      <div className="col-12 col-md-3">
                      <div className="form-group-responsive">
                        <label className="form-label">
                          Start Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          value={startTime}
                          min="09:00"
                          max="20:59"
                          onChange={(e) => {
                            const selectedTime = e.target.value;
                            // Check valid time range
                            if (!isValidTimeRange(selectedTime)) {
                              setErrors((prev) => ({
                                ...prev,
                                startTime:
                                  "Please select a time between 9 AM and 9 PM",
                              }));
                              return;
                            }
                            // Check lunch time
                            if (isLunchTime(selectedTime, endTime)) {
                              setErrors((prev) => ({
                                ...prev,
                                startTime:
                                  "Cannot schedule during lunch time (1:00 PM - 1:30 PM)",
                              }));
                              return;
                            }
                            // Check time overlap
                            if (
                              checkTimeOverlap(eventDate, selectedTime, endTime)
                            ) {
                              setErrors((prev) => ({
                                ...prev,
                                startTime:
                                  "This time slot overlaps with an existing event",
                              }));
                              return;
                            }
                            setErrors((prev) => ({ ...prev, startTime: null }));
                            setStartTime(selectedTime);
                          }}
                        />
                        {errors.startTime && (
                          <small className="text-danger">
                            {errors.startTime}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* End Time */}
                      <div className="col-12 col-md-3">
                      <div className="form-group-responsive">
                        <label className="form-label">
                          End Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          value={endTime}
                          min="09:00"
                          max="20:59"
                          onChange={(e) => {
                            const selectedTime = e.target.value;
                            // Check valid time range
                            if (!isValidTimeRange(selectedTime)) {
                              setErrors((prev) => ({
                                ...prev,
                                endTime:
                                  "Please select a time between 9 AM and 9 PM",
                              }));
                              return;
                            }
                            // Check lunch time
                            if (isLunchTime(startTime, selectedTime)) {
                              setErrors((prev) => ({
                                ...prev,
                                endTime:
                                  "Cannot schedule during lunch time (1:00 PM - 1:30 PM)",
                              }));
                              return;
                            }
                            // Check valid sequence
                            if (selectedTime <= startTime) {
                              setErrors((prev) => ({
                                ...prev,
                                endTime: "End time must be after start time",
                              }));
                              return;
                            }
                            // Check time overlap
                            if (
                              checkTimeOverlap(
                                eventDate,
                                startTime,
                                selectedTime
                              )
                            ) {
                              setErrors((prev) => ({
                                ...prev,
                                endTime:
                                  "This time slot overlaps with an existing event",
                              }));
                              return;
                            }
                            setErrors((prev) => ({ ...prev, endTime: null }));
                            setEndTime(selectedTime);
                          }}
                        />
                        {errors.endTime && (
                          <small className="text-danger">
                            {errors.endTime}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-end mt-4">
                  <div className="col-12 col-md-2">
                <button
                      className="btn btn-primary w-100"
                  onClick={handleAddEvent}
                >
                      {eventId ? 'Update' : 'Submit'}
                </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


                    </div>
                </div>
            </div>
        </div>
    </>
    );
};

export default CandidateAddOrEditEvent;