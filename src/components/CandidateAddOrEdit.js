import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc,serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Aside from './Aside';
import Navbar from './Navbar';
import Select from 'react-select';

const CandidateAddOrEdit = () => {
    const [candidateName, setCandidateName] = useState("");
    const [candidateMobile, setCandidateMobile] = useState("");
    const [candidatePassword, setCandidatePassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('add');
    const [candidateId, setCandidateId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const currentMode = queryParams.get('mode');
        const id = queryParams.get('id');

        setMode(currentMode);
        if (id) {
            setCandidateId(id);
            fetchCandidateData(id);
        }
    }, [location]);

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

    const fetchCandidateData = async (id) => {
        try {
            const candidateDoc = await getDoc(doc(db, "candidates", id));
            if (candidateDoc.exists()) {
                const data = candidateDoc.data();
                setCandidateName(data.name || '');
                setCandidateMobile(data.mobile || '');
                setCandidatePassword(data.password || '');
                
                // Convert stored technology string into an array of objects
                if (data.technology) {
                    const selectedTechs = data.technology.split(', ').map(tech => ({
                        value: tech,
                        label: tech
                    }));
                    setSelectedOptions(selectedTechs);
                }
                
            }
        } catch (error) {
            console.error("Error fetching candidate:", error);
            alert("Error loading candidate data");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'add') {
                await addDoc(collection(db, "candidates"), {
                    name: candidateName,
                    mobile: candidateMobile,
                    password: candidatePassword,
                    approvedByAdmin: true,
                    technology: selectedOptions.map(option => option.value).join(', '),
                    createdAt: serverTimestamp()  // ✅ Adds a timestamp

                });
            } else {
                await updateDoc(doc(db, "candidates", candidateId), {
                    name: candidateName,
                    mobile: candidateMobile,
                    password: candidatePassword,
                    approvedByAdmin: true,
                    technology: selectedOptions.map(option => option.value).join(', '),

                });
            }
            navigate('/candidate-list-view');
        } catch (error) {
            console.error("Error saving candidate:", error);
            alert("Failed to save candidate");
        } finally {
            setIsLoading(false);
        }
    };

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
    const [selectedOptions, setSelectedOptions] = useState([]);

    const options = [
        { value: 'PHP', label: 'PHP' },
        { value: 'Python', label: 'Python' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'MERN Stack', label: 'MERN Stack' },
        { value: 'MEAN Stack', label: 'MEAN Stack' },
        { value: 'Java', label: 'Java' },
        { value: 'React Developer', label: 'React Developer' },
        { value: 'App Support', label: 'App Support' },
        { value: 'Business Analyst', label: 'Business Analyst' },
        { value: 'Manual Testing', label: 'Manual Testing' },
        { value: 'Automation Testing', label: 'Automation Testing' },
        { value: 'DevOps(AWS)', label: 'DevOps(AWS)' },
        { value: 'DevOps(Azure)', label: 'DevOps(Azure)' }
    ];

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
                            <div className="card shadow-sm mb-4">
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
                                    <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">
                                        {mode === 'add' ? 'Add New Candidate' : 'Edit Candidate'}
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit} className="row g-3">
                                        <div className="col-12 col-lg-3">
                                            <label className="form-label">Candidate Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={candidateName}
                                                onChange={(e) => setCandidateName(e.target.value)}
                                                placeholder="Enter candidate name"
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-lg-2">
    <label className="form-label">Mobile</label>
    <input
        type="text"
        className="form-control"
        value={candidateMobile}
        onChange={(e) => {
            const value = e.target.value;

            // Only allow digits
            if (!/^\d*$/.test(value)) return;

            // Prevent numbers starting with 0-5
            if (value.length === 1 && /^[0-5]/.test(value)) return;

            // Limit to 10 digits
            if (value.length <= 10) {
                setCandidateMobile(value);
            }
        }}
        placeholder="Enter mobile number"
        maxLength={10}
        required
    />
</div>

<div className="col-12 col-lg-2">
  <label className="form-label">Password</label>
  <div className="input-group">
    <input
      type={showPassword ? "text" : "password"}
      className="form-control"
      value={candidatePassword}
      onChange={(e) => setCandidatePassword(e.target.value)}
      placeholder="Enter password"
      required={mode === 'add'}
    />
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => setShowPassword(!showPassword)}
    >
      <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
    </button>
  </div>
</div>

                                        <div className="col-12 col-lg-5">
                                            <label className="form-label">Technology</label>
                                            <Select
                                                options={options}
                                                isMulti
                                                isSearchable
                                                placeholder="Choose Technologies..."
                                                value={selectedOptions}
                                                onChange={setSelectedOptions}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Saving...' : (mode === 'add' ? 'Add Candidate' : 'Update Candidate')}
                                                </button>

                                            </div>
                                        </div>
                                    </form>
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

export default CandidateAddOrEdit;