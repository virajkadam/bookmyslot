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
                  <span className="app-brand-logo demo">
                    <span style={{ color: "#9055FD" }}>
                      <svg
                        width={30}
                        height={24}
                        viewBox="0 0 250 196"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.3002 1.25469L56.655 28.6432C59.0349 30.1128 60.4839 32.711 60.4839 35.5089V160.63C60.4839 163.468 58.9941 166.097 56.5603 167.553L12.2055 194.107C8.3836 196.395 3.43136 195.15 1.14435 191.327C0.395485 190.075 0 188.643 0 187.184V8.12039C0 3.66447 3.61061 0.0522461 8.06452 0.0522461C9.56056 0.0522461 11.0271 0.468577 12.3002 1.25469Z"
                          fill="currentColor"
                        />
                        <path
                          opacity="0.077704"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 65.2656L60.4839 99.9629V133.979L0 65.2656Z"
                          fill="black"
                        />
                        <path
                          opacity="0.077704"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 65.2656L60.4839 99.0795V119.859L0 65.2656Z"
                          fill="black"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M237.71 1.22393L193.355 28.5207C190.97 29.9889 189.516 32.5905 189.516 35.3927V160.631C189.516 163.469 191.006 166.098 193.44 167.555L237.794 194.108C241.616 196.396 246.569 195.151 248.856 191.328C249.605 190.076 250 188.644 250 187.185V8.09597C250 3.64006 246.389 0.027832 241.935 0.027832C240.444 0.027832 238.981 0.441882 237.71 1.22393Z"
                          fill="currentColor"
                        />
                        <path
                          opacity="0.077704"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M250 65.2656L189.516 99.8897V135.006L250 65.2656Z"
                          fill="black"
                        />
                        <path
                          opacity="0.077704"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M250 65.2656L189.516 99.0497V120.886L250 65.2656Z"
                          fill="black"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.2787 1.18923L125 70.3075V136.87L0 65.2465V8.06814C0 3.61223 3.61061 0 8.06452 0C9.552 0 11.0105 0.411583 12.2787 1.18923Z"
                          fill="currentColor"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.2787 1.18923L125 70.3075V136.87L0 65.2465V8.06814C0 3.61223 3.61061 0 8.06452 0C9.552 0 11.0105 0.411583 12.2787 1.18923Z"
                          fill="white"
                          fillOpacity="0.15"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M237.721 1.18923L125 70.3075V136.87L250 65.2465V8.06814C250 3.61223 246.389 0 241.935 0C240.448 0 238.99 0.411583 237.721 1.18923Z"
                          fill="currentColor"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M237.721 1.18923L125 70.3075V136.87L250 65.2465V8.06814C250 3.61223 246.389 0 241.935 0C240.448 0 238.99 0.411583 237.721 1.18923Z"
                          fill="white"
                          fillOpacity="0.3"
                        />
                      </svg>
                    </span>
                  </span>
                  <span className="app-brand-text demo text-heading fw-semibold">
                    Materio
                  </span>
                </a>
              </div>
              <div className="card-body mt-1">
                <h4 className="mb-1">Welcome to Materio! 👋🏻</h4>
                <p className="mb-5">
                  Please sign-in to your account and start the adventure
                </p>
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
                <div className="text-center">
                <Link to="/AdminDashboard" className="text-center">Home</Link>
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