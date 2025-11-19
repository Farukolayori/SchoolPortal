import { useState, useEffect } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faEye, faCalendar } from "@fortawesome/free-solid-svg-icons";
import polyimage from "./assets/ibadan-polythecnic.jpeg";
import defaultAvatar from "./assets/avatar.png";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState("login");
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  // ------------------- LOADING EFFECT -------------------
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // ------------------- NOTIFICATION UTILITY -------------------
  const showNotification = (message: string, type: string, duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // ------------------- LOGIN -------------------
  const handleLogin = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const email = form[0].value;
    const password = form[1].value;

    try {
      const res = await fetch("https://portal-backend-xrww.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(`Login successful! Welcome ${data.user.firstName}`, "success");
        setUser(data.user);
        form.reset();
      } else {
        showNotification(data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Something went wrong!", "error");
    }
  };

  // ------------------- SIGNUP -------------------
  const handleSignUp = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const firstName = form[0].value;
    const lastName = form[1].value;
    const email = form[2].value;
    const password = form[3].value;
    const dateStarted = form[4].value;

    try {
      const res = await fetch("https://portal-backend-xrww.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, dateStarted }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(`Registration successful! Welcome ${firstName}`, "success");
        form.reset();
        setActiveForm("login");
      } else {
        showNotification(data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Something went wrong!", "error");
    }
  };

  // ------------------- LOGOUT -------------------
  const handleLogout = () => {
    setUser(null);
    showNotification("Logged out successfully", "success");
  };

  // ------------------- LOADING SCREEN -------------------
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // ------------------- USER ID CARD -------------------
  if (user) {
    return (
      <div className="container">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <span className="close" onClick={() => setNotification(null)}>
              &times;
            </span>
          </div>
        )}

        <div className="id-card-real">
          <div className="id-card-header">
            <img src={polyimage} alt="School Logo" className="school-logo" />
            <h2>Ibadan Polytechnic</h2>
            <span className="id-title">Student ID</span>
          </div>
          <div className="id-card-body">
            <div className="avatar-section">
              <img src={defaultAvatar} alt="Avatar" className="avatar" />
            </div>
            <div className="details-section">
              <p>
                <FontAwesomeIcon icon={faUser} /> {user.firstName} {user.lastName}
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} /> {user.email}
              </p>
              <p>
                <FontAwesomeIcon icon={faCalendar} /> {new Date(user.dateStarted).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="id-card-footer">
            <div className="barcode"></div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------- LOGIN / SIGNUP FORM -------------------
  return (
    <div className="container">
      <div className="wrapper">
        <div className="Hero">
          <div className="image">
            <img src={polyimage} alt="School Logo" width={70} />
          </div>

          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
              <span className="close" onClick={() => setNotification(null)}>
                &times;
              </span>
            </div>
          )}

          <nav>
            <a href="#" className={activeForm === "login" ? "active" : ""} onClick={() => setActiveForm("login")}>
              Login
            </a>
            <a href="#" className={activeForm === "signup" ? "active" : ""} onClick={() => setActiveForm("signup")}>
              Sign-Up
            </a>
          </nav>

          <div className="form-container">
            <div className={`form-wrapper ${activeForm === "signup" ? "shift-right" : ""}`}>
              <form className={`login ${activeForm === "login" ? "fade-in" : "fade-out"}`} onSubmit={handleLogin}>
                <h3>Log In</h3>
                <div className="input">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <input type="email" placeholder="Email" required />
                </div>

                <div className="input">
                  <input type={showPasswordLogin ? "text" : "password"} placeholder="Password" required />
                  <FontAwesomeIcon
                    icon={faEye}
                    onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div className="button">
                  <button type="submit">Log In</button>
                </div>
              </form>

              <form className={`sign-up ${activeForm === "signup" ? "fade-in" : "fade-out"}`} onSubmit={handleSignUp}>
                <h3>Sign Up</h3>
                <div className="input">
                  <FontAwesomeIcon icon={faUser} />
                  <input type="text" placeholder="First Name" required />
                </div>
                <div className="input">
                  <FontAwesomeIcon icon={faUser} />
                  <input type="text" placeholder="Last Name" required />
                </div>
                <div className="input">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <input type="email" placeholder="Email" required />
                </div>
                <div className="input">
                  <input type={showPasswordSignUp ? "text" : "password"} placeholder="Password" required />
                  <FontAwesomeIcon
                    icon={faEye}
                    onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <p>Date Started</p>
                <input type="date" className="date-input" required />
                <div className="button">
                  <button type="submit">Sign Up</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
