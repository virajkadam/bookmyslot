import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Aside from './Aside';
import Navbar from './Navbar';
import Select from 'react-select';

const FeeAddEdit = () => {
    const [candidateId, setCandidateId] = useState(null);
    const [candidateOptions, setCandidateOptions] = useState([]);
    const [feeType, setFeeType] = useState("");
    const [installments, setInstallments] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('add');
    const [fees, setFees] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const currentMode = queryParams.get('mode');
        const id = queryParams.get('id');

        setMode(currentMode);
        if (id) {
            setCandidateId(id);
            fetchFeeData(id);
        }

        fetchCandidates();
    }, [location]);

    const fetchCandidates = async () => {
        try {
            const candidatesSnapshot = await getDocs(collection(db, "candidates"));
            const options = candidatesSnapshot.docs.map(doc => ({
                value: doc.id,
                label: doc.data().name
            }));
            setCandidateOptions(options);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    const [feeId, setFeeId] = useState(null); // Add state to store fee document ID

    const fetchFeeData = async (id) => {
        try {
            const feeDoc = await getDoc(doc(db, "fees", id));
            if (feeDoc.exists()) {
                setFeeId(feeDoc.id); // Store the document ID
                const data = feeDoc.data();
                setCandidateId(data.candidateId || "");
                setFeeType(data.feeType || '');
                setInstallments(data.installments || '');
                setPaymentDate(data.paymentDate || '');
                setPaymentMethod(data.paymentMethod || '');
                setAmount(data.amount || '');
            }
        } catch (error) {
            console.error("Error fetching fee details:", error);
            // alert("Error loading fee details");
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            if (mode === 'add') {
                await addDoc(collection(db, "fees"), {
                    candidateId,
                    feeType,
                    
                    paymentDate,
                    paymentMethod,
                    amount,
                    createdAt: serverTimestamp(),
                });
            } else {
                if (feeId) {
                    await updateDoc(doc(db, "fees", feeId), {  // Use feeId instead of candidateId
                        candidateId,
                        feeType,
                       
                        paymentDate,
                        paymentMethod,
                        amount,
                        updatedAt: serverTimestamp(),
                    });
                } else {
                    alert("Error: Fee ID not found!");
                    return;
                }
            }
            navigate('/fees');
        } catch (error) {
            console.error("Error saving fee details:", error);
            alert("Failed to save fee details");
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (mode === 'view') {
            fetchFeeData();
        }
    }, [mode]);
    
   

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
                                        onClick={() => navigate('/fees')}
                                        title="Back"
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                    </button>
                                    <h5 className="card-title mb-0 text-primary flex-grow-1 text-center">
                                    {mode === 'add' ? 'Add Fee' : mode === 'edit' ? 'Edit Fee' : 'View Fee'}

                                    </h5>
                                </div>
                                <div className="card-body">
                                {mode !== 'view' && (
                                    <form onSubmit={handleSubmit} className="row g-3">
                                        <div className="col-12 col-lg-3">
                                            <label className="form-label">Candidate</label>
                                            <Select
                                                options={candidateOptions}
                                                value={candidateOptions.find(option => option.value === candidateId)}
                                                onChange={(selected) => setCandidateId(selected.value)}
                                                placeholder="Select Candidate"
                                            />
                                        </div>

                                        <div className="col-12 col-lg-3">
                                            <label className="form-label">Amount</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="Enter Amount"
                                            />
                                        </div>
                                        <div className="col-12 col-lg-3">
                                            <label className="form-label">Fee Type</label>
                                            <select className="form-control" value={feeType} onChange={(e) => setFeeType(e.target.value)}>
                                                <option value="">Select Fee Type</option>
                                                <option value="advance">Advance</option>
                                                <option value="1 Installment">1 Installment</option>
                                                <option value="2 Installment">2 Installments</option>
                                                <option value="3 Installment">3 Installments</option>
                                                <option value="4 Installment">4 Installments</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-lg-3">
                                            <label className="form-label">Payment Method</label>
                                            <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                                <option value="">Select Payment Method</option>
                                                <option value="cash">Cash</option>
                                                <option value="credit_card"> Card</option>
                                                <option value="upi">UPI</option>
                                            </select>
                                        </div>

                                        <div className="col-12 col-lg-3">
                                            <label className="form-label">Payment Date</label>
                                            <input type="date" className="form-control" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                                        </div>

                                     


                                        <div className="col-12">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Saving...' : (mode === 'add' ? 'Add Fee' : 'Update Fee')}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}


{mode === 'view' && (
  <div className="row g-3">
    <div key={feeId} className="col-md-12">
     
          <div className="row">
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
           
              <div className="fw-bold text-capitalize">
                {candidateOptions.find(c => c.value === candidateId)?.label || 'N/A'}
              </div>
              <small className="text-muted">Candidate Name</small>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
              
              <div className="fw-bold">{feeType}</div>
              <small className="text-muted">Fee Type</small>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
              <div className="fw-bold">₹{amount}</div>
              <small className="text-muted">Amount</small>

            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
              <div className="fw-bold">{paymentDate}</div>
              <small className="text-muted">Payment Date</small>

            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
              <div className="fw-bold text-capitalize">{paymentMethod}</div>
              <small className="text-muted">Payment Method</small>

            </div>
          </div>
        </div>
      </div>
 
)}


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

export default FeeAddEdit;