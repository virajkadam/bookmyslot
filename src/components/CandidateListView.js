import React from 'react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDoc,
  getDocs,
  deleteDoc,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Aside from './Aside';
import Navbar from './Navbar';

// import "./assets/css/responsive.css";

const CandidateListView = () => {

    const [candidates, setCandidates] = useState([]);
    const [newCandidateName, setNewCandidateName] = useState("");
    const [newCandidateMobile, setNewCandidateMobile] = useState("");
    const [newCandidatePassword, setNewCandidatePassword] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCandidateId, setEditingCandidateId] = useState("");
    const [editingName, setEditingName] = useState("");
    const [editingMobile, setEditingMobile] = useState("");
    const [editingPassword, setEditingPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [viewCandidate, setViewCandidate] = useState(null);
    const [eventCounts, setEventCounts] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const verifyAdminStatus = async () => {
          const auth = getAuth();
          await auth.currentUser?.getIdToken(true);
          return auth.currentUser?.getIdTokenResult();
        };
        verifyAdminStatus();
      }, [navigate]);

      const fetchData = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "candidates"));
            const candidatesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
    
            // Sort by 'createdAt' in descending order (newest first)
            const sortedCandidates = candidatesList.sort((a, b) => 
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );
    
            setCandidates(sortedCandidates);
            await fetchEventCounts(sortedCandidates);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    
      const fetchEventCounts = async (candidates) => {
        try {
            const eventsRef = collection(db, "events");
            const counts = {};

            await Promise.all(candidates.map(async (candidate) => {
                // Get scheduled (approved) events
                const approvedQuery = query(
                    eventsRef, 
                    where("candidateId", "==", candidate.id),
                    where("status", "==", "Approved")
                );
                const approvedSnapshot = await getDocs(approvedQuery);
                
                // Get pending events
                const pendingQuery = query(
                    eventsRef, 
                    where("candidateId", "==", candidate.id),
                    where("status", "in", ["Pending", "Pending Approval"])
                );
                const pendingSnapshot = await getDocs(pendingQuery);

                counts[candidate.id] = {
                    scheduled: approvedSnapshot.size,
                    pending: pendingSnapshot.size
                };
            }));

            setEventCounts(counts);
        } catch (error) {
            console.error("Error fetching event counts:", error);
        }
      };

      const handleAddCandidate = async (e) => {
        e.preventDefault();
    
        if (!newCandidateName || !newCandidateMobile || !newCandidatePassword) {
          alert("Please fill all fields before adding a candidate.");
          return;
        }
    
        try {
          const candidateRef = await addDoc(collection(db, "candidates"), {
            name: newCandidateName,
            mobile: newCandidateMobile,
            password: newCandidatePassword,
          });
    
          const newCandidate = {
            id: candidateRef.id,
            name: newCandidateName,
            mobile: newCandidateMobile,
            password: newCandidatePassword,
          };
          setCandidates((prevCandidates) => [...prevCandidates, newCandidate]);
    
          setNewCandidateName("");
          setNewCandidateMobile("");
          setNewCandidatePassword("");
          setShowForm(false);
    
          alert("Candidate added successfully!");
        } catch (error) {
          console.error("Error adding candidate:", error);
          alert("Failed to add candidate: " + error.message);
        }
      };
    
      const handleDelete = async (id) => {
        try {
          await deleteDoc(doc(db, "candidates", id));
          await fetchData(); // Changed from fetchCandidates to fetchData
        } catch (error) {
          console.error("Error deleting candidate:", error);
          alert("Failed to delete candidate. Please try again.");
        }
      };
    
      // Replace the existing handleEdit function
      const handleEdit = (id) => {
        navigate(`/candidate-add-edit?mode=edit&id=${id}`);
      };
    
      // Replace the existing handleUpdate function
      const handleUpdate = async (e) => {
        e.preventDefault();
    
        if (!editingName || !editingMobile || !editingPassword) {
          alert("Please fill all fields before updating.");
          return;
        }
    
        try {
          const docRef = doc(db, "candidates", editingCandidateId);
          await updateDoc(docRef, {
            name: editingName,
            mobile: editingMobile,
            password: editingPassword,
          });
    
          // Reset form fields and fetch updated data
          setEditingCandidateId(null);
          setEditingName("");
          setEditingMobile("");
          setEditingPassword("");
          await fetchData();
    
          alert("Candidate updated successfully!");
        } catch (error) {
          console.error("Error updating candidate:", error);
          alert("Failed to update candidate. Please try again.");
        }
      };
    
      const handleView = (id) => {
        try {
          navigate(`/Viewpage/${id}`);
        } catch (error) {
          console.error("Error navigating to ViewCandidates:", error);
        }
      };
    
      const handleCloseModal = () => {
        setShowModal(false);
        setViewCandidate(null);
      };
    
    // Function to handle view details
    const handleViewDetails = (candidate) => {
        setViewCandidate(candidate);
        // Using vanilla Bootstrap modal
        const modal = new window.bootstrap.Modal(document.getElementById('viewModal'));
        modal.show();
    };

    useEffect(() => {
        const initializeAdmin = async () => {
          try {
            await fetchData();
            
          } catch (error) {
            console.error("Initialization error:", error);
          }
        };
    
        initializeAdmin();
      }, []);

    const handleAddNew = () => {
        navigate('/candidate-add-edit?mode=add');
    };

    const toCamelCase = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map((word, index) => {
                if (word.length === 0) return '';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
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
       <Navbar/>

        <div className="layout-page">
            {/* Content wrapper */}
            <div className="content-wrapper">
                {/* Menu */}
                <Aside/>
                {/* / Menu */}
                {/* Content */}
                <div className="container-xxl flex-grow-1 container-p-y">
                    <div className="row g-6">

                        {/* Header Section */}
                    

                        {/* Candidate List Card */}
                        <div className="card shadow-sm mb-4">
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
                                <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">Candidate List</h5>
                                    <button
                                        className="btn btn-success"
                                    onClick={handleAddNew}
                                    >
                                    <i className="fa-solid fa-plus me-2"></i>
                                    Add Candidate
                                    </button>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive m-2">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '25%' }}>Name</th>
                                                <th style={{ width: '20%' }}>Mobile</th>
                                                <th style={{ width: '15%' }}>Technologies</th>
                                                <th style={{ width: '15%' }}>Total Scheduled</th>
                                                <th style={{ width: '15%' }}>New Pending</th>
                                                <th style={{ width: '20%' }} className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.map((candidate, index) => (
                                                <tr key={candidate.id}>
                                                    <td>{toCamelCase(candidate.name)}</td>
                                                    <td>{candidate.mobile}</td>
                                                    <td>{candidate.technology  }</td>
                                                       

                                                    <td>{eventCounts[candidate.id]?.scheduled || 0}</td>
                                                    <td>{eventCounts[candidate.id]?.pending || 0}</td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className="btn btn-info btn-sm"
                                                                onClick={() => handleView(candidate.id)}
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() => handleEdit(candidate.id)}
                                                            >
                                                                <i className="fa-solid fa-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDelete(candidate.id)}
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                        {/* Add/Edit Form */}
                        {showForm && (
                            <div className="card shadow-sm mb-4">
                                <div className="card-body">
                                    <form onSubmit={handleAddCandidate} className="row g-3">
                                        <div className="col-12 col-lg-4">
                                            <label className="form-label">Candidate Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newCandidateName}
                                                onChange={(e) => setNewCandidateName(e.target.value)}
                                                placeholder="Enter candidate name"
                                            />
                                        </div>
                                        <div className="col-12 col-lg-4">
                                            <label className="form-label">Mobile Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newCandidateMobile}
                                                onChange={(e) => setNewCandidateMobile(e.target.value)}
                                                placeholder="Enter mobile number"
                                                maxLength={10}
                                            />
                                        </div>
                                        <div className="col-12 col-lg-4">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={newCandidatePassword}
                                                onChange={(e) => setNewCandidatePassword(e.target.value)}
                                                placeholder="Enter password"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100 w-lg-auto"
                                            >
                                                Add Candidate
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Edit Candidate Form */}
                        {editingCandidateId && (
                            <div className="card shadow-sm mb-4 edit-form">
                                <div className="card-header bg-white py-3">
                                    <h5 className="m-0 text-primary">Edit Candidate</h5>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleUpdate} className="row g-3">
                                        <div className="col-12 col-lg-4">
                                            <label className="form-label">Candidate Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                placeholder="Enter candidate name"
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-lg-4">
                                            <label className="form-label">Mobile Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingMobile}
                                                onChange={(e) => setEditingMobile(e.target.value)}
                                                placeholder="Enter mobile number"
                                                maxLength={10}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-lg-4">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={editingPassword}
                                                onChange={(e) => setEditingPassword(e.target.value)}
                                                placeholder="Enter password"
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <div className="d-flex flex-column flex-md-row gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary w-100 w-md-auto"
                                                >
                                                    Update Candidate
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary w-100 w-md-auto"
                                                    onClick={() => {
                                                        setEditingCandidateId(null);
                                                        setEditingName("");
                                                        setEditingMobile("");
                                                        setEditingPassword("");
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}


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

        {/* Replace react-bootstrap Modal with standard Bootstrap modal */}
        <div className="modal fade" id="viewModal" tabIndex="-1" aria-labelledby="viewModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="viewModalLabel">Candidate Details</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {viewCandidate && (
                            <div>
                                <p><strong>Name:</strong> {viewCandidate.name}</p>
                                <p><strong>Mobile:</strong> {viewCandidate.mobile}</p>
                                {/* Add other candidate details as needed */}
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>

    )
}

export default CandidateListView