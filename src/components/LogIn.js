import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, signInWithCustomToken, signInWithEmailAndPassword } from "firebase/auth";
import tree3 from '../assets/img/illustrations/tree-3.png'
import tree from '../assets/img/illustrations/tree.png'
import lightpng from '../assets/img/illustrations/auth-basic-mask-light.png'

const LogIn = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const adminToken = localStorage.getItem("adminToken");
        const currentTime = Date.now();
        const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

        if (!userStr || !adminToken) {
          throw new Error("No valid session");
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== "admin") {
          throw new Error("Not admin");
        }

        // Check if session is expired
        const tokenTimestamp = parseInt(adminToken);
        if (currentTime - tokenTimestamp > SESSION_TIMEOUT) {
          throw new Error("Session expired");
        }

        navigate("/AdminDashboard");
      } catch (error) {
        localStorage.clear();
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedPhone = phone.trim();
      console.log("Attempting login with phone:", normalizedPhone);

      // Admin login attempt
      const adminsRef = collection(db, "admin");
      const adminQuery = query(
        adminsRef,
        where("phone", "==", normalizedPhone)
      );

      console.log("Querying admin collection...");
      const adminSnapshot = await getDocs(adminQuery);

      console.log("Admin query results:", adminSnapshot.size);

      if (!adminSnapshot.empty) {
        const adminDoc = adminSnapshot.docs[0];
        const adminData = adminDoc.data();

        console.log("Found admin account, verifying password...");

        if (password === adminData.password) {
          console.log("Admin password verified");

          try {
            const auth = getAuth();
            const adminSession = {
              id: adminDoc.id,
              name: adminData.name || "Admin",
              role: "admin",
              phone: adminData.phone,
              loginTime: Date.now(),
              isAdmin: true,
            };

            localStorage.setItem("user", JSON.stringify(adminSession));
            localStorage.setItem("adminToken", adminDoc.id);
            localStorage.setItem("adminAuth", "true");

            console.log("Admin login successful");
            navigate("/AdminDashboard");
            return;
          } catch (authError) {
            console.error("Admin auth error:", authError);
            alert("Authentication failed. Please try again.");
            localStorage.clear();
            return;
          }
        }

        console.log("Invalid admin password");
        alert("Invalid admin credentials");
        setLoading(false);
        return;
      }

      console.log("No admin found, checking candidate credentials...");

      const candidatesRef = collection(db, "candidates");
      const candidateQuery = query(
        candidatesRef,
        where("mobile", "==", normalizedPhone)
      );

      const candidateSnapshot = await getDocs(candidateQuery);

      if (!candidateSnapshot.empty) {
        const candidateDoc = candidateSnapshot.docs[0];
        const candidateData = candidateDoc.data();

        console.log("Candidate found, verifying credentials...");

        if (!candidateData.approvedByAdmin) {
          alert("Your account is pending admin approval");
          return;
        }

        if (password === candidateData.password) {
          const candidateSession = {
            ...candidateData,
            id: candidateDoc.id,
            role: "candidate",
          };

          localStorage.setItem("candidates", JSON.stringify(candidateSession));
          localStorage.setItem("name", candidateSession.name);
          localStorage.setItem("email", candidateSession.email);
          localStorage.setItem("uid", candidateSession.id);
                    navigate("/candidatedashboard");
          return;
        } else {
          alert("Invalid password");
          return;
        }
      }

      alert("No account found with this phone number");
    } catch (error) {
      console.error("Authentication error:", error);
      alert(`Authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="position-relative">
        <div className="authentication-wrapper authentication-basic container-p-y">
          <div className="authentication-inner py-6 mx-4">
            <div className="card p-7">
              <div className="app-brand justify-content-center mt-5">
                <a href="index.html" className="app-brand-link gap-3">
                
                  <span className="app-brand-text demo text-heading fw-semibold">
                    Slot Booking
                  </span>
                </a>
              </div>
              <div className="card-body mt-1">

              <div className="text-center mb-4">
                <Link to="/" className="text-center">Home</Link>
                </div>


                <form
                  onSubmit={handleSignIn}
                  id="formAuthentication"
                  className="mb-5"
                >
                  <div className="form-floating form-floating-outline mb-5">
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      maxLength={10}
                      placeholder="Enter your Mobile Number"
                      autoFocus
                    />
                    <label htmlFor="email">Mobile Number</label>
                  </div>
                  <div className="mb-5">
                    <div className="form-password-toggle">
                      <div className="input-group input-group-merge">
                        <div className="form-floating form-floating-outline">
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            aria-describedby="password"
                          />
                          <label htmlFor="password">Password</label>
                        </div>
                        <span className="input-group-text cursor-pointer">
                          <i className="ri-eye-off-line ri-20px" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-5">
                    <button className="btn btn-primary d-grid w-100" type="submit" disabled={loading}>
                      {loading ? "Signing in..." : "Login"}
                    </button>
                  </div>
                </form>

                <div className="text-center ">
  {/* Text Section */}
  <p className="mb-0 fw-semibold">
    For support or inquiries, <br />
    please contact <strong>Viraj Kadam Sir </strong> +91 88064 31723
  </p>

  {/* Centered Buttons */}
  <div className="d-flex justify-content-center align-items-center gap-4 mt-2">
    {/* Phone Button */}
    <a href="tel:+918806431723" className="btn btn-success d-flex align-items-center justify-content-center p-2 rounded-circle" 
       style={{ width: "40px", height: "40px" }}>
      <i className="fas fa-phone"></i>
    </a>

    {/* WhatsApp Button */}
    <a href="https://wa.me/918806431723" target="_blank" rel="noopener noreferrer" 
       className="btn btn-success d-flex align-items-center justify-content-center p-2 rounded-circle" 
       style={{ width: "40px", height: "40px" }}>
      <i className="fab fa-whatsapp"></i>
    </a>
  </div>
</div>

               
               
              </div>
            </div>
            <img
              src={tree3}
              alt="auth-tree"
              className="authentication-image-object-left d-none d-lg-block"
            />
            <img
              src={lightpng}
              className="authentication-image d-none d-lg-block scaleX-n1-rtl"
              height={172}
              alt="triangle-bg"
              data-app-light-img="illustrations/auth-basic-mask-light.png"
              data-app-dark-img="illustrations/auth-basic-mask-dark.png"
            />
            <img
              src={tree}
              alt="auth-tree"
              className="authentication-image-object-right d-none d-lg-block"
            />
          </div>
         
        </div>
      </div>
    </>
  );
};

export default LogIn;