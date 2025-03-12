









import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from './Navbar';
import CandidateAside from './CandidateAside';

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
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return; // If eventId is not present, do nothing
  
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
  
        if (eventSnap.exists()) {
          const eventData = eventSnap.data();
  
          // Populate state with event data
          setEventTitle(eventData.title || "");
          setCompanyName(eventData.company || "");
          setInterviewRound(eventData.interviewRound || "");
          setEventDate(eventData.date || "");
          setStartTime(eventData.start?.split("T")[1]?.slice(0, 5) || "");
          setEndTime(eventData.end?.split("T")[1]?.slice(0, 5) || "");
          setTechnology(eventData.technology || "");
        } else {
          console.error("No such event found!");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };
  
    fetchEventDetails();
  }, [eventId]); // Run this effect when eventId changes
  

  const checkAvailability = () => {
    if (!eventDate || !startTime || !endTime) {
      setAvailabilityMessage("Please select a date and time.");
      return;
    }

    const newStart = new Date(`${eventDate}T${startTime}`);
    const newEnd = new Date(`${eventDate}T${endTime}`);

    // Convert times to minutes for easier comparison
    const startMinutes = newStart.getHours() * 60 + newStart.getMinutes();
    const endMinutes = newEnd.getHours() * 60 + newEnd.getMinutes();

    // Business hours: 9 AM (540 minutes) to 9 PM (1260 minutes)
    const minTime = 9 * 60; // 9 AM
    const maxTime = 21 * 60; // 9 PM

    // Lunch Break: 1 PM (780 minutes) to 1:30 PM (810 minutes)
    const lunchStart = 13 * 60; // 1 PM
    const lunchEnd = 13 * 60 + 30; // 1:30 PM

    // Check if time is outside working hours
    if (startMinutes < minTime || endMinutes > maxTime) {
      setAvailabilityMessage("Time slot must be between 9 AM and 9 PM.");
      return;
    }

    // Check if time falls within lunch break
    if (
      (startMinutes >= lunchStart && startMinutes < lunchEnd) ||
      (endMinutes > lunchStart && endMinutes <= lunchEnd) ||
      (startMinutes <= lunchStart && endMinutes >= lunchEnd)
    ) {
      setAvailabilityMessage("Time slot overlaps with lunch break (1 PM - 1:30 PM).");
      return;
    }

    // Check if time slot overlaps with any existing event
    const isOverlapping = events.some((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (eventStart.toDateString() !== newStart.toDateString()) return false;

      return (
        (newStart >= eventStart && newStart < eventEnd) ||
        (newEnd > eventStart && newEnd <= eventEnd) ||
        (newStart <= eventStart && newEnd >= eventEnd)
      );
    });

    if (isOverlapping) {
      setAvailabilityMessage("Time slot is not available. Please choose another time.");
    } else {
      setAvailabilityMessage("Time slot is available.");
    }
  };

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

  return (
    <>
      <Navbar />
      <div className="layout-page">
        <div className="content-wrapper">
          <CandidateAside />
          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row g-6">
              <div className="event-form-container">
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-header bg-white d-flex align-items-center gap-4">
                        <button
                          className="btn btn-icon btn-secondary rounded-circle"
                          onClick={() => navigate('/candidate-event-list')}
                        >
                          <i className="fas fa-arrow-left"></i>
                        </button>
                        <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">
                          {eventId ? 'Edit Slot' : 'Add Slot'}
                        </h5>
                      </div>

                      <div className="card-body">
                        <div className="row g-3 align-items-end">
                          {/* Date, Start Time, End Time, and Check Availability in one row */}
                          <div className="col-md-3">
                            <label className="form-label">Date <span className="text-danger">*</span></label>
                            <input
                              type="date"
                              className="form-control"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              disabled={availabilityMessage.includes("available")}

                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">Start Time <span className="text-danger">*</span></label>
                            <input
                              type="time"
                              className="form-control"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              disabled={availabilityMessage.includes("available")}

                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">End Time <span className="text-danger">*</span></label>
                            <input
                              type="time"
                              className="form-control"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              disabled={availabilityMessage.includes("available")}

                            />
                          </div>

                          <div className="col-md-3">
                            <button type="button" className="btn btn-warning w-100" onClick={checkAvailability}
                                                          disabled={availabilityMessage.includes("available")}

                            >
                              Check Availability
                            </button>
                          </div>

                          {availabilityMessage && (
                            <div className="col-12">
                              <p className={`mt-2 text-center ${availabilityMessage.includes('available') ? 'text-success' : 'text-danger'}`}>
                                {availabilityMessage}
                              </p>
                            </div>
                          )}
                        </div>


                        <>
                          <hr className='mt-4' />
                          <div className="row g-3">
                            <div className="col-md-3">
                              <label className="form-label">Slot Title <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                                placeholder="Enter Slot title"
                                disabled={availabilityMessage !== "Time slot is available."}
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Company Name <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                value={eventCompanyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter company name"
                                disabled={availabilityMessage !== "Time slot is available."}
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Technology <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                value={eventTechnolgy}
                                onChange={(e) => setTechnology(e.target.value)}
                                placeholder="Enter Technology"
                                disabled={availabilityMessage !== "Time slot is available."}
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">Round <span className="text-danger">*</span></label>
                              <select
                                className="form-control"
                                value={eventInterviewRound}
                                onChange={(e) => setInterviewRound(e.target.value)}
                                disabled={availabilityMessage !== "Time slot is available."}
                              >
                                <option value="">Select Round</option>
                                <option value="Round 1">Technical Assessment Test</option>
                                <option value="Round 2">Technical Discussion Round</option>
                                <option value="Round 3">Manager Round</option>
                                <option value="Final Round">HR Round</option>
                              </select>
                            </div>


                            <div className="col-12 text-end">
                              <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                onClick={handleAddEvent}
                                disabled={availabilityMessage !== "Time slot is available."}
                              >
                                {eventId ? 'Update Slot' : 'Add Slot'}
                              </button>
                            </div>

                          </div>

                        </>

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
