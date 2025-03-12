import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import scrollGridPlugin from '@fullcalendar/scrollgrid';
import "../assets/css/calendar-responsive.css";
import Navbar from "./Navbar";
import Aside from "./Aside";
import CandidateAside from "./CandidateAside";
const CandidateDashboard = () => {

    const [events, setEvents] = useState([]);
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [todayEventCount, setTodayEventCount] = useState(0);
  
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const eventsRef = collection(db, "events");
          const q = query(eventsRef, where("status", "==", "Approved"));
          const querySnapshot = await getDocs(q);
  
          const fetchedEvents = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
              const eventData = docSnap.data();
  
              let candidateName = "";
              if (eventData.candidateId) {
                try {
                  const candidateRef = doc(db, "candidates", eventData.candidateId);
                  const candidateDoc = await getDoc(candidateRef);
                  if (candidateDoc.exists()) {
                    candidateName = candidateDoc.data().name || "";
                  }
                } catch (err) {
                  console.error("Error fetching candidate:", err);
                }
              }
  
              const startDateTime = eventData.start ? new Date(eventData.start) : null;
              const endDateTime = eventData.end ? new Date(eventData.end) : null;
  
              return {
                id: docSnap.id,
                title: eventData.title || "",
                start: startDateTime?.toISOString(),
                end: endDateTime?.toISOString(),
                extendedProps: {
                  company: eventData.company || "",
                  technology: eventData.technology || "",
                  candidateName: candidateName,
                  status: eventData.status,
                  interviewRound: eventData.interviewRound || "",
                },
              };
            })
          );
  
          const validEvents = fetchedEvents.filter(
            (event) =>
              event.start &&
              event.end &&
              !isNaN(new Date(event.start)) &&
              !isNaN(new Date(event.end))
          );
  
          setEvents(validEvents);
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      };
  
      fetchEvents();
    }, []);

    useEffect(() => {
        setTodayEventCount(getTodayEventCount(events));
    }, [events]);

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
    
    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getTodayEventCount = (events) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return events.filter(event => {
            const eventDate = new Date(event.start);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        }).length;
    };

  return (
    
    <>
      <Navbar/>

      <div className="layout-page">
        {/* Content wrapper */}
        <div className="content-wrapper">
          {/* Menu */}
         
         <CandidateAside/>
          {/* / Menu */}
          {/* Content */}
          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row">
              {/* Today's Date Card */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    {/* Today's Date */}
                    <div className="d-flex align-items-center" style={{ width: '33%' }}>
                      <i className="fa-regular fa-calendar-days fs-3 text-primary me-2"></i>
                      <h5 className="card-title mb-0">
                        Today: {formatDate(currentDate)}
                      </h5>
                    </div>
                    
                    {/* Calendar Title - Centered */}
                    <div className="text-center" style={{ width: '33%' }}>
                      <h5 className="card-title mb-0 text-primary">Slot Booking Calendar</h5>
                    </div>

                    {/* Today's Event Count */}
                    <div className="d-flex align-items-center justify-content-end" style={{ width: '33%' }}>
                        <div className="d-flex align-items-center">
                            <i className="fa-solid fa-calendar-check fs-3 text-success me-2"></i>
                            <h5 className="card-title mb-0">
                                Today's Slots: <span className="text-success">{todayEventCount}</span>
                            </h5>
                        </div>
                    </div>
                  </div>
                  <div className="card-body p-0">
                    <div className="calendar-container">
                      <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin, scrollGridPlugin]}
                        initialView="timeGridWeek"
                        slotMinTime="09:00:00"
                        slotMaxTime="22:00:00"
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "",
                        }}
                        events={events}
                        height="auto"
                        contentHeight="auto"
                        aspectRatio={1.8}
                        expandRows={true}
                        slotDuration="00:30:00"
                        allDaySlot={false}
                        dayHeaderFormat={{ weekday: 'long' }}
                        handleWindowResize={true}
                        dayMinWidth={100}
                        slotLabelFormat={{
                          hour: "numeric",
                          minute: "2-digit",
                          meridiem: "short",
                        }}
                        eventTimeFormat={{
                          hour: "2-digit",
                          minute: "2-digit",
                          meridiem: "short",
                        }}
                        displayEventTime={true}
                        displayEventEnd={true}
                        eventOverlap={false}
                        selectOverlap={false}
                        eventDisplay="block"
                        eventColor="#3788d8"
                        eventTextColor="#ffffff"
                        eventDidMount={(info) => {
                          const { company, technology, candidateName } = info.event.extendedProps;
                          const eventEl = info.el;
                          const titleEl = eventEl.querySelector(".fc-event-title");

                          if (titleEl) {
                            titleEl.innerHTML = `
               <div class="event-content" style="font-size: 12px; line-height: 1.2;">
      <div class="event-details">
        <div class="event-item">
          <i class="fas fa-user" style="font-size: 10px; margin-right: 4px;"></i> ${candidateName ? candidateName.replace(/\b\w/g, char => char.toUpperCase()) : ""}
        </div>
        <div class="event-item">
          <i class="fas fa-laptop-code" style="font-size: 10px; margin-right: 4px;"></i>${technology ? technology.replace(/\b\w/g, char => char.toUpperCase()) : ""}
        </div>
        <div class="event-item">
          <i class="fas fa-clipboard" style="font-size: 10px; margin-right: 4pxtext-transform: capitalize;"></i>  ${info.event.title ? info.event.title.replace(/\b\w/g, char => char.toUpperCase()) : ""}
        </div>
        <div class="event-item">
          <i class="fas fa-building" style="font-size: 10px; margin-right: 4px;     text-transform: capitalize;"></i>  ${company || ""}
        </div>
      </div>
    </div>
                            `;
                          }
                        }}
                        eventContent={(arg) => {
                          return {
                            html: `
                              <div class="fc-event-main-frame">
                                <div class="fc-event-time"></div>
                                <div class="fc-event-title-container">
                                  <div class="fc-event-title"></div>
                                </div>
                              </div>
                            `,
                          };
                        }}
                        dayCellClassNames={(arg) => {
                          return arg.date.getDay() === 0 ? "sunday-cell" : "";
                        }}
                        dayHeaderClassNames={(arg) => {
                          return arg.date.getDay() === 0 ? "sunday-header" : "";
                        }}
                        slotLabelClassNames={(arg) => {
                          const day = arg.date.getDay();
                          return day === 0 ? "sunday-slot" : "";
                        }}
                        views={{
                          timeGridWeek: {
                            titleFormat: { year: "numeric", month: "short", day: "numeric" },
                            dayHeaderFormat: {
                              weekday: window.innerWidth < 768 ? "short" : "long",
                            },
                            slotLabelFormat: {
                              hour: "numeric",
                              minute: "2-digit",
                              meridiem: window.innerWidth < 768 ? "short" : "long",
                            },
                            dayHeaderContent: (args) => {
                              const day = args.date.getDay();
                              const element = document.createElement("span");
                              element.innerHTML = args.date.toLocaleDateString("en-US", {
                                weekday: window.innerWidth < 768 ? "short" : "long",
                              });
                              if (day === 0) {
                                element.style.color = "#dc3545";
                                element.style.fontWeight = "bold";
                              }
                              return { domNodes: [element] };
                            },
                          },
                        }}
                      />
                    </div>
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

  )
}

export default CandidateDashboard