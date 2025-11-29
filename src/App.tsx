import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faEye, faCalendar } from "@fortawesome/free-solid-svg-icons";
import './App.css';

// API Base URL
const API_BASE_URL = "https://portal-backend-xrww.onrender.com/api";

// Default images as placeholders
const polyimage = "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=400&fit=crop";
const defaultAvatar = "https://ui-avatars.com/api/?name=Student&size=200&background=18ab18&color=fff";

// TypeScript interfaces
interface Notification {
  message: string;
  type: "success" | "error";
}

interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  dateStarted: string;
  profileImage?: string;
  department?: string;
  matricNumber?: string;
}

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Accounting",
  "Mass Communication",
  "Architecture",
  "Estate Management",
  "Banking and Finance"
];

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeForm, setActiveForm] = useState<"login" | "signup">("login");
  const [showPasswordLogin, setShowPasswordLogin] = useState<boolean>(false);
  const [showPasswordSignUp, setShowPasswordSignUp] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [dateStarted, setDateStarted] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginMatricNumber, setLoginMatricNumber] = useState<string>("");

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState<string>("");
  const [signupLastName, setSignupLastName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupDepartment, setSignupDepartment] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message: string, type: "success" | "error", duration: number = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailValue = loginEmail.trim();
    const matricValue = loginMatricNumber.trim();

    console.log("🔐 Attempting login...");
    console.log("📧 Email:", emailValue);
    console.log("🎓 Matric Number:", matricValue);

    if (!emailValue || !matricValue) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    try {
      console.log("📡 Sending request to backend...");
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email: emailValue, 
          matricNumber: matricValue 
        })
      });

      console.log("📥 Response status:", res.status);
      
      const data = await res.json();
      console.log("📦 Response data:", data);

      if (res.ok && data.user) {
        console.log("✅ Login successful!");
        showNotification(`Login successful! Welcome ${data.user.firstName}`, "success");
        setUser(data.user);
        setLoginEmail("");
        setLoginMatricNumber("");
      } else {
        console.error("❌ Login failed:", data.message);
        showNotification(data.message || "Invalid credentials", "error");
      }
    } catch (err) {
      console.error("🚨 Login exception:", err);
      showNotification("Network error! Check if backend is running.", "error");
    }
  };

  // Signup handler
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signupFirstName || !signupLastName || !signupEmail || !signupPassword || !dateStarted || !signupDepartment) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    // Generate random 10-digit matric number
    const matricNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    try {
      const payload = { 
        firstName: signupFirstName.trim(), 
        lastName: signupLastName.trim(), 
        email: signupEmail.trim(), 
        password: signupPassword, 
        dateStarted,
        department: signupDepartment,
        matricNumber,
        profileImage: profileImage || undefined
      };
      
      console.log("📤 Sending signup payload:", payload);

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Signup response:", data);

      if (res.ok) {
        showNotification(`Registration successful! Your matric number is ${matricNumber}. Please save it for login.`, "success", 6000);
        setSignupFirstName("");
        setSignupLastName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupDepartment("");
        setProfileImage("");
        setDateStarted("");
        setActiveForm("login");
      } else {
        showNotification(data.message || "Registration failed", "error");
        console.error("Registration error:", data);
      }
    } catch (err) {
      console.error("Signup exception:", err);
      showNotification("Network error! Please check your connection.", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      if (res.ok) {
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to fetch users", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification("User deleted successfully", "success");
        fetchAllUsers();
      } else {
        const data = await res.json();
        showNotification(data.message || "Failed to delete user", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Network error! Please try again.", "error");
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAllUsers();
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setAllUsers([]);
    showNotification("Logged out successfully", "success");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // USER ID CARD
  if (user && user.role === "user") {
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
              <img src={user.profileImage || defaultAvatar} alt="Avatar" className="avatar" />
            </div>
            <div className="details-section">
              <p>
                <FontAwesomeIcon icon={faUser} /> {user.firstName} {user.lastName}
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} /> {user.email}
              </p>
              {user.matricNumber && (
                <p>
                  <FontAwesomeIcon icon={faUser} /> Matric: {user.matricNumber}
                </p>
              )}
              {user.department && (
                <p>
                  <FontAwesomeIcon icon={faUser} /> {user.department}
                </p>
              )}
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

  // ADMIN DASHBOARD
  if (user && user.role === "admin") {
    const filteredUsers = selectedDepartment === "all" 
      ? allUsers 
      : allUsers.filter(u => u.department === selectedDepartment);

    const departmentCounts = DEPARTMENTS.map(dept => ({
      name: dept,
      count: allUsers.filter(u => u.department === dept).length
    }));

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

        <div className="admin-dashboard">
          <div className="dashboard-header">
            <h2>Admin Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>{allUsers.length}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{allUsers.filter(u => u.role === "Students" || u.role === "user").length}</h3>
              <p>Students</p>
            </div>
            <div className="stat-card">
              <h3>{allUsers.filter(u => u.role === "admin").length}</h3>
              <p>Admins</p>
            </div>
          </div>

          <div className="department-stats">
            <h3>Students by Department</h3>
            <div className="department-grid">
              {departmentCounts.map((dept) => (
                <div key={dept.name} className="department-card">
                  <h4>{dept.count}</h4>
                  <p>{dept.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="users-table-container">
            <div className="table-header">
              <h3>All Users</h3>
              <div className="filter-section">
                <label>Filter by Department:</label>
                <select 
                  className="department-filter" 
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Matric No.</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Date Started</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => (
                    <tr key={u._id || index}>
                      <td>
                        <img src={u.profileImage || defaultAvatar} alt="Avatar" className="table-avatar" />
                      </td>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.matricNumber || "N/A"}</td>
                      <td>{u.department || "N/A"}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td>{new Date(u.dateStarted).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteUser(u._id!)}
                        >
                          Delete
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
    );
  }

  // LOGIN / SIGNUP FORM
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
            <a 
              href="#" 
              className={activeForm === "login" ? "active" : ""} 
              onClick={(e) => { e.preventDefault(); setActiveForm("login"); }}
            >
              Login
            </a>
            <a 
              href="#" 
              className={activeForm === "signup" ? "active" : ""} 
              onClick={(e) => { e.preventDefault(); setActiveForm("signup"); }}
            >
              Sign-Up
            </a>
          </nav>

          <div className="form-container">
            <div className={`form-wrapper ${activeForm === "signup" ? "shift-right" : ""}`}>
              <form className={`login ${activeForm === "login" ? "fade-in" : "fade-out"}`} onSubmit={handleLogin}>
                <h3>Log In</h3>
                <div className="input">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required 
                    autoComplete="email"
                  />
                </div>

                <div className="input">
                  <FontAwesomeIcon icon={faUser} />
                  <input 
                    type="text" 
                    placeholder="Matric Number" 
                    value={loginMatricNumber}
                    onChange={(e) => setLoginMatricNumber(e.target.value)}
                    required 
                    maxLength={10}
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
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    value={signupFirstName}
                    onChange={(e) => setSignupFirstName(e.target.value)}
                    required 
                  />
                </div>
                <div className="input">
                  <FontAwesomeIcon icon={faUser} />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    value={signupLastName}
                    onChange={(e) => setSignupLastName(e.target.value)}
                    required 
                  />
                </div>
                <div className="input">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="input">
                  <input 
                    type={showPasswordSignUp ? "text" : "password"} 
                    placeholder="Password" 
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required 
                  />
                  <FontAwesomeIcon
                    icon={faEye}
                    onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                <div className="select-wrapper">
                  <label>Department *</label>
                  <select 
                    className="role-select" 
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="image-upload-wrapper">
                  <label htmlFor="profile-image">Profile Image (Optional)</label>
                  <input 
                    type="file" 
                    id="profile-image" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="file-input"
                  />
                  {profileImage && (
                    <div className="image-preview">
                      <img src={profileImage} alt="Preview" />
                    </div>
                  )}
                </div>

                <p>Date Started</p>
                <input 
                  type="date" 
                  className="date-input" 
                  value={dateStarted}
                  onChange={(e) => setDateStarted(e.target.value)}
                  required 
                  max={new Date().toISOString().split('T')[0]}
                />
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