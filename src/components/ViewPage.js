


import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Aside from "./Aside";
import Navbar from "./Navbar";

const ViewPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidateData, setCandidateData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState({
    feeType: "",
    amount: "",
    paymentDate: "",
    paymentMethod: "",
    installments: "",
    candidateId: ""
  });


  const formatTime = (timeString) => {
    if (timeString instanceof Date) {
      return timeString.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeDifferenceInMinutes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end - start;
    return Math.round(diffInMs / (1000 * 60));
  };
  // Fetch candidate data and their events
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!candidateId) {
          console.error("No candidateId provided");
          setLoading(false);
          return;
        }

        // Fetch candidate details
        const candidateRef = doc(db, "candidates", candidateId);
        const candidateSnap = await getDoc(candidateRef);

        if (candidateSnap.exists()) {
          setCandidateData({ id: candidateSnap.id, ...candidateSnap.data() });

          // Fetch events related to the candidate using the candidateId
          const eventsRef = collection(db, "events");
          const q = query(eventsRef, where("candidateId", "==", candidateId));
          const eventsSnapshot = await getDocs(q);

          let eventsData = [];
          if (!eventsSnapshot.empty) {
            eventsData = eventsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            eventsData.sort((a, b) => new Date(b.start) - new Date(a.start));
          }

          setEvents(eventsData);
          console.log("Candidate Data:", candidateSnap.data());
          console.log("Events Data:", eventsData);
        } else {
          console.error("No candidate found with the given candidateId");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateId]);

  // Fetch fee data for the given candidateId
  useEffect(() => {
    if (candidateId) {
      fetchFeeData(candidateId);
    }
  }, [candidateId]);

  const fetchFeeData = async (id) => {
    try {
      const feeRef = collection(db, "fees");
      const q = query(feeRef, where("candidateId", "==", id));
      const feeSnapshot = await getDocs(q);
  
      if (!feeSnapshot.empty) {
        const feeDataList = feeSnapshot.docs.map((doc) => doc.data()); // Get all fee data
        console.log("Fee Data:", feeDataList); // Log fee data for debugging
  
        // Update the state with all fee data
        setFeeData(feeDataList);
      } else {
        console.log("No fee data found for this candidate.");
      }
    } catch (error) {
      console.error("Error fetching fee data:", error);
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

  if (!candidateData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Candidate not found</div>
      </div>
    );
  }
  const formatTimeRange = (start, end) => {
    if (!start || !end) return "No Time";
    const timeDiff = getTimeDifferenceInMinutes(start, end);

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

    return `${formatTime(start)} - ${formatTime(end)} (${durationText})`;
  };
  return (

    <>

      <Navbar />

      <div className="layout-page">
        {/* Content wrapper */}
        <div className="content-wrapper">
          {/* Menu */}
          <Aside />
          {/* / Menu */}
          {/* Content */}

          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row g-6">

              <div className="card shadow">
                <div className="card-header bg-white d-flex align-items-center gap-4">
                  <button
                    className="btn btn-icon btn-secondary rounded-circle"
                    onClick={() => navigate('/candidate-list-view')}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Back"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <h3 className="card-title mb-0 text-primary flex-grow-1 text-center">
                    Slots Added by {candidateData.name}
                  </h3>
                </div>
                <div className="card shadow">
  
  <div className="">
    {loading ? (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ) : !candidateData ? (
      <div className="alert alert-danger text-center">Candidate not found</div>
    ) : events.length > 0 ? (
      <div className="row">
            <div className="col-6">
        {events.map((event) => (
      
          <div key={event.id} className="col-12 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <h5 className="card-title text-primary">{event.title}</h5>
                    <p className="mb-1"><strong>Company:</strong> {event.company}</p>
                    <p className="mb-1"><strong>Technology:</strong> {event.technology}</p>
                    <p className="mb-1"><strong>Round:</strong> {event.interviewRound}</p>
                  </div>
                  <div className="col-md-3">
                    <p className="mb-1"><strong>Date:</strong> {formatDate(event.start)}</p>
                    <p className="mb-1"><strong>Time:</strong> {formatTimeRange(event.start, event.end)}</p>
                    <p className="mb-1">
                      <strong>Status:</strong>
                      <span className={`badge ms-2 ${event.status === "Completed" ? "bg-warning" : "bg-success"}`}>
                        {event.status || "Pending"}
                      </span>
                    </p>
                    {event.feedback && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <strong>Feedback:</strong> {event.feedback}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
       
        ))}
           </div>
           <div className="col-6">
  <div className="card border-0 shadow-sm mb-3">
    <div className="card-body">
      <h5 className="card-title text-primary">Fee Details</h5>
      
      {feeData.length > 0 ? (
        feeData.map((fee, index) => (
          <div key={index} className="mb-3">
            <p className="mb-1"><strong>Fee Type:</strong> {fee.feeType || 'N/A'}</p>
            <p className="mb-1"><strong>Amount:</strong> ₹{fee.amount || '0'}</p>
            <p className="mb-1"><strong>Payment Date:</strong> {formatDate(fee.paymentDate) || 'N/A'}</p>
            <p className="mb-1"><strong>Payment Method:</strong> {fee.paymentMethod || 'N/A'}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>No fee details available for this candidate.</p>
      )}
      
    </div>
  </div>
</div>

                      </div>
    ) : (
      <div className="alert alert-danger text-center">No slots have been added by this candidate yet.</div>
    )}
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

export default ViewPage;
