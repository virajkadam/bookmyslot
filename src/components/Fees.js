import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Aside from "./Aside";
import Navbar from "./Navbar";

const Fees = () => {
    const [fees, setFees] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "fees"));
                const feesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date() // Convert Firestore timestamp to JS Date
                }));
    
                // Fetch candidate names
                const feesWithNames = await Promise.all(
                    feesList.map(async (fee) => {
                        if (fee.candidateId) {
                            const candidateRef = doc(db, "candidates", fee.candidateId);
                            const candidateSnap = await getDoc(candidateRef);
                            if (candidateSnap.exists()) {
                                return { ...fee, candidateName: candidateSnap.data().name || "N/A" };
                            }
                        }
                        return { ...fee, candidateName: "N/A" };
                    })
                );
    
                // Sort fees by createdAt (latest first)
                const sortedFees = feesWithNames.sort((a, b) => b.createdAt - a.createdAt);
    
                setFees(sortedFees);
            } catch (error) {
                console.error("Error fetching fee data:", error);
            }
        };
    
        fetchFees();
    }, []);
    

    const handleEdit = (id) => {
        navigate(`/fees-add-edit?mode=edit&id=${id}`);
    };

    const handleView = (id) => {
        navigate(`/fees-add-edit?mode=view&id=${id}`);
    };

    return (
        <>
            <Navbar />
            <div className="layout-page">
                <div className="content-wrapper">
                    <Aside />
                    <div className="container-xxl flex-grow-1 container-p-y">
                        <div className="row g-6">
                            <div className="card shadow-sm mb-4">
                                <div className="card-header bg-white d-flex align-items-center gap-4">
                                    <button
                                        className="btn btn-icon btn-secondary rounded-circle"
                                        onClick={() => navigate('/AdminDashboard')}
                                        data-bs-toggle="tooltip"
                                        title="Back"
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                    </button>
                                    <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">Fee Records</h5>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => navigate('/fees-add-edit?mode=add')}
                                    >
                                        <i className="fa-solid fa-plus me-2"></i> Add Fee Record
                                    </button>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive m-2">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Candidate Name</th>
                                                    <th>Amount (₹)</th>
                                                    <th>Fee Type</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fees.map((fee) => (
                                                    <tr key={fee.id}>
                                                        <td className="text-capitalize">{fee.candidateName}</td> 
                                                        <td>₹{fee.amount || "0"}</td> 
                                                        <td>{fee.feeType || "N/A"}</td> 
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-info btn-sm me-2"
                                                                onClick={() => handleView(fee.id)}
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() => handleEdit(fee.id)}
                                                            >
                                                                <i className="fa-solid fa-pencil"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                </div>
            </div>
        </>
    );
};

export default Fees;
