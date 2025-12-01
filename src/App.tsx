import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaEnvelope, 
  FaIdCard, 
  FaGraduationCap, 
  FaCalendarAlt,
  FaLock,
  FaCopy,
  FaCheck,
  FaPlus,
  FaSignOutAlt,
  FaTrash,
  FaFilter,
  FaKey,
  FaCrown
} from "react-icons/fa";

// API Base URL
const API_BASE_URL = "https://portal-backend-xrww.onrender.com/api";

// Default images as placeholders
const polyimage = "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=400&fit=crop";
const defaultAvatar = "https://ui-avatars.com/api/?name=Student&size=200&background=18ab18&color=fff";

// Admin seed credentials
const ADMIN_SEED = {
  email: "admin@polyibadan.edu.ng",
  matricNumber: "ADMIN2024",
  role: "admin" as const
};

// TypeScript interfaces
interface Notification {
  message: string | ReactNode;
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
  const [notification, setNotification] = useState<Notification | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [dateStarted, setDateStarted] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [copiedMatric, setCopiedMatric] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<"student" | "admin">("student");

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginMatricNumber, setLoginMatricNumber] = useState<string>("");

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState<string>("");
  const [signupLastName, setSignupLastName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupDepartment, setSignupDepartment] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");

  // Add user form state (admin)
  const [addFirstName, setAddFirstName] = useState<string>("");
  const [addLastName, setAddLastName] = useState<string>("");
  const [addEmail, setAddEmail] = useState<string>("");
  const [addDepartment, setAddDepartment] = useState<string>("");
  const [addDateStarted, setAddDateStarted] = useState<string>("");
  const [addProfileImage, setAddProfileImage] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message: string | ReactNode, type: "success" | "error", duration: number = 4000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: "matric" | "password" = "matric") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "matric") {
        setCopiedMatric(text);
        setTimeout(() => setCopiedMatric(null), 2000);
      } else {
        setCopiedPassword(text);
        setTimeout(() => setCopiedPassword(null), 2000);
      }
      showNotification(
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCheck style={{ color: '#4caf50' }} />
          <span>{type === "matric" ? "Matric number" : "Password"} copied to clipboard!</span>
        </div>,
        "success",
        2000
      );
    } catch (err) {
      showNotification("Failed to copy", "error");
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = loginEmail.trim();
    const matricValue = loginMatricNumber.trim();

    // Check for admin seed login
    if (emailValue === ADMIN_SEED.email && matricValue === ADMIN_SEED.matricNumber) {
      console.log("🔐 Admin seed login detected");
      setUser({
        firstName: "System",
        lastName: "Administrator",
        email: ADMIN_SEED.email,
        role: "admin",
        dateStarted: new Date().toISOString(),
        matricNumber: ADMIN_SEED.matricNumber
      });
      showNotification(
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCrown style={{ color: '#ffd700' }} />
          <span>Welcome, System Administrator!</span>
        </div>,
        "success"
      );
      setLoginEmail("");
      setLoginMatricNumber("");
      setShowAdminLogin(false);
      return;
    }

    if (!emailValue || !matricValue) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, matricNumber: matricValue })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Login failed (${res.status})`);
      }

      if (data.user) {
        console.log("✅ Login successful!");
        showNotification(
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCheck style={{ color: '#4caf50' }} />
            <span>Login successful! Welcome {data.user.firstName}</span>
          </div>,
          "success"
        );
        setUser(data.user);
        setLoginEmail("");
        setLoginMatricNumber("");
        setShowAdminLogin(false);
      } else {
        showNotification(data.message || "Invalid credentials", "error");
      }
    } catch (err: any) {
      console.error("🚨 Login error:", err);
      showNotification(err.message || "Network error. Please try again.", "error");
    }
  };

  // Signup handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupFirstName || !signupLastName || !signupEmail || !dateStarted || !signupDepartment || !signupPassword) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    if (signupPassword.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return;
    }

    const matricNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const payload = {
      firstName: signupFirstName.trim(),
      lastName: signupLastName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      dateStarted,
      department: signupDepartment,
      matricNumber,
      profileImage: profileImage || ""
    };

    console.log("📤 Signup payload:", payload);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.join(", ") || `Registration failed (${res.status})`);
      }

      if (data.user) {
        showNotification(
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FaCheck style={{ color: '#4caf50' }} />
              <span style={{ fontWeight: 'bold' }}>Registration Successful!</span>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              margin: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#495057' }}>Your Matric Number:</span>
                <button
                  onClick={() => copyToClipboard(data.user.matricNumber, "matric")}
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Copy matric number"
                >
                  {copiedMatric === data.user.matricNumber ? (
                    <FaCheck style={{ color: '#4caf50' }} />
                  ) : (
                    <FaCopy style={{ color: '#666' }} />
                  )}
                </button>
              </div>
              <code style={{
                background: '#f1f1f1',
                padding: '8px 12px',
                borderRadius: '4px',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                color: '#28a745',
                fontSize: '18px',
                display: 'block',
                textAlign: 'center'
              }}>
                {data.user.matricNumber}
              </code>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#dc3545',
              fontWeight: 'bold',
              background: '#f8d7da',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '8px'
            }}>
              <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Save this number securely! You'll need it to login.</span>
            </div>
          </div>,
          "success",
          10000
        );

        // Reset form
        setSignupFirstName("");
        setSignupLastName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupDepartment("");
        setProfileImage("");
        setDateStarted("");
        setActiveForm("login");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      showNotification(err.message || "Registration failed. Please try again.", "error");
    }
  };

  // Admin add user handler
  const handleAdminAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addFirstName || !addLastName || !addEmail || !addDepartment || !addDateStarted) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    const matricNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const payload = {
      firstName: addFirstName.trim(),
      lastName: addLastName.trim(),
      email: addEmail.trim(),
      dateStarted: addDateStarted,
      department: addDepartment,
      matricNumber,
      profileImage: addProfileImage || ""
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/add-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.join(", ") || `Failed to add user (${res.status})`);
      }

      if (data.user) {
        const tempPassword = data.temporaryPassword || Math.random().toString(36).slice(-8);
        
        showNotification(
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaCheck style={{ color: '#4caf50' }} />
              <span style={{ fontWeight: 'bold' }}>User Added Successfully!</span>
            </div>
            
            {/* Matric Number */}
            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              margin: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#495057' }}>Matric Number:</span>
                <button
                  onClick={() => copyToClipboard(data.user.matricNumber, "matric")}
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Copy matric number"
                >
                  {copiedMatric === data.user.matricNumber ? (
                    <FaCheck style={{ color: '#4caf50' }} />
                  ) : (
                    <FaCopy style={{ color: '#666' }} />
                  )}
                </button>
              </div>
              <code style={{
                background: '#f1f1f1',
                padding: '8px 12px',
                borderRadius: '4px',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                color: '#28a745',
                fontSize: '18px',
                display: 'block',
                textAlign: 'center'
              }}>
                {data.user.matricNumber}
              </code>
            </div>
            
            {/* Temporary Password */}
            <div style={{
              background: '#fff3e0',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #ffcc80',
              margin: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#e65100' }}>Temporary Password:</span>
                <button
                  onClick={() => copyToClipboard(tempPassword, "password")}
                  style={{
                    background: 'none',
                    border: '1px solid #ffcc80',
                    cursor: 'pointer',
                    color: '#e65100',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Copy password"
                >
                  {copiedPassword === tempPassword ? (
                    <FaCheck style={{ color: '#f57c00' }} />
                  ) : (
                    <FaCopy style={{ color: '#f57c00' }} />
                  )}
                </button>
              </div>
              <code style={{
                background: '#ffe0b2',
                padding: '8px 12px',
                borderRadius: '4px',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                color: '#f57c00',
                fontSize: '18px',
                display: 'block',
                textAlign: 'center'
              }}>
                {tempPassword}
              </code>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#dc3545',
              fontWeight: 'bold',
              background: '#f8d7da',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '8px'
            }}>
              <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Share both matric number and password with the user!</span>
            </div>
          </div>,
          "success",
          10000
        );

        // Reset form
        setAddFirstName("");
        setAddLastName("");
        setAddEmail("");
        setAddDepartment("");
        setAddDateStarted("");
        setAddProfileImage("");
        setShowAddUserModal(false);

        // Refresh users list
        fetchAllUsers();
      }
    } catch (err: any) {
      console.error("Add user error:", err);
      showNotification(err.message || "Failed to add user. Please try again.", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isAdminAdd: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isAdminAdd) {
          setAddProfileImage(reader.result as string);
        } else {
          setProfileImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }
      
      if (data.users) {
        setAllUsers(data.users);
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to fetch users", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?._id) {
      showNotification("You cannot delete your own account!", "error");
      return;
    }

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      if (data.success || data.message) {
        showNotification("User deleted successfully", "success");
        fetchAllUsers();
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete user", "error");
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

  // Quick admin login
  const handleQuickAdminLogin = () => {
    setLoginEmail(ADMIN_SEED.email);
    setLoginMatricNumber(ADMIN_SEED.matricNumber);
    setShowAdminLogin(false);
    setTimeout(() => {
      const loginBtn = document.querySelector('button[onClick*="handleLogin"]');
      if (loginBtn) (loginBtn as HTMLButtonElement).click();
    }, 100);
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
              <img 
                src={user.profileImage || defaultAvatar} 
                alt="Avatar" 
                className="avatar" 
              />
            </div>

            <div className="details-section">
              <p>
                <FaUser className="icon" />
                <span>{user.firstName} {user.lastName}</span>
              </p>
              <p>
                <FaEnvelope className="icon" />
                <span>{user.email}</span>
              </p>
              {user.matricNumber && (
                <p className="matric-row">
                  <FaIdCard className="icon" />
                  <span className="matric-number">{user.matricNumber}</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(user.matricNumber!, "matric")}
                    title="Copy matric number"
                  >
                    {copiedMatric === user.matricNumber ? <FaCheck /> : <FaCopy />}
                  </button>
                </p>
              )}
              {user.department && (
                <p>
                  <FaGraduationCap className="icon" />
                  <span>{user.department}</span>
                </p>
              )}
              <p>
                <FaCalendarAlt className="icon" />
                <span>{new Date(user.dateStarted).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <div className="id-card-footer">
            <div className="barcode"></div>
            <button onClick={handleLogout}>
              <FaSignOutAlt className="inline mr-2" />
              Logout
            </button>
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

        {/* Add User Modal */}
        {showAddUserModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '20px', color: '#18ab18', fontSize: '24px' }}>Add New User</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="First Name *"
                  value={addFirstName}
                  onChange={(e) => setAddFirstName(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={addLastName}
                  onChange={(e) => setAddLastName(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
                <select
                  value={addDepartment}
                  onChange={(e) => setAddDepartment(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Department *</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div>
                  <label style={{ fontSize: '14px', color: '#666', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Date Started *</label>
                  <input
                    type="date"
                    value={addDateStarted}
                    onChange={(e) => setAddDateStarted(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      padding: '12px',
                      border: '2px solid #ccc',
                      borderRadius: '8px',
                      fontSize: '15px',
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '14px', color: '#666', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Profile Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    style={{
                      padding: '10px',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                  {addProfileImage && (
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #18ab18',
                      margin: '10px auto 0'
                    }}>
                      <img src={addProfileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={handleAdminAddUser}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: 'none',
                      background: '#18ab18',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <FaPlus style={{ display: 'inline', marginRight: '8px' }} />
                    Add User
                  </button>
                  <button
                    onClick={() => {
                      setShowAddUserModal(false);
                      setAddFirstName("");
                      setAddLastName("");
                      setAddEmail("");
                      setAddDepartment("");
                      setAddDateStarted("");
                      setAddProfileImage("");
                    }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: '2px solid #ccc',
                      background: 'white',
                      color: '#666',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="admin-dashboard">
          <div className="dashboard-header">
            <div>
              <h2>Admin Dashboard</h2>
              <p style={{ color: '#666', marginTop: '8px' }}>Welcome, {user.firstName} {user.lastName}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="btn-primary"
              >
                <FaPlus className="inline mr-2" />
                Add User
              </button>
              <button
                onClick={handleLogout}
                className="btn-danger"
              >
                <FaSignOutAlt className="inline mr-2" />
                Logout
              </button>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>{allUsers.length}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{allUsers.filter(u => u.role === "user").length}</h3>
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
                <FaFilter className="text-gray-500" />
                <label>Filter by Department:</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="department-filter"
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
                        <img 
                          src={u.profileImage || defaultAvatar} 
                          alt="Avatar" 
                          className="table-avatar" 
                        />
                      </td>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>
                        <div className="matric-cell">
                          {u.matricNumber || "N/A"}
                          {u.matricNumber && (
                            <button
                              className="copy-btn small"
                              onClick={() => copyToClipboard(u.matricNumber!, "matric")}
                              title="Copy matric number"
                            >
                              {copiedMatric === u.matricNumber ? <FaCheck /> : <FaCopy />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{u.department || "N/A"}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.dateStarted).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(u._id!)}
                          disabled={u._id === user?._id}
                          title={u._id === user?._id ? "Cannot delete your own account" : "Delete user"}
                          className="delete-btn"
                        >
                          <FaTrash className="inline mr-2" />
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

          {/* Role Selection */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <button
                onClick={() => {
                  setLoginRole("student");
                  setShowAdminLogin(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ...(loginRole === "student"
                    ? {
                        background: '#18ab18',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(24, 171, 24, 0.3)'
                      }
                    : {
                        background: '#f5f5f5',
                        color: '#444',
                        border: '1px solid #ddd'
                      })
                }}
              >
                <FaGraduationCap style={{ display: 'inline', marginRight: '8px' }} />
                Student Login
              </button>
              <button
                onClick={() => {
                  setLoginRole("admin");
                  setShowAdminLogin(true);
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ...(loginRole === "admin"
                    ? {
                        background: '#2196f3',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                      }
                    : {
                        background: '#f5f5f5',
                        color: '#444',
                        border: '1px solid #ddd'
                      })
                }}
              >
                <FaCrown style={{ display: 'inline', marginRight: '8px' }} />
                Admin Login
              </button>
            </div>

            {showAdminLogin && (
              <div style={{
                background: '#e3f2fd',
                border: '1px solid #bbdefb',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                animation: 'fadeIn 0.5s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FaKey style={{ color: '#2196f3', fontSize: '20px' }} />
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1565c0' }}>Quick Admin Access</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>Admin Email:</p>
                      <code style={{
                        background: '#bbdefb',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontFamily: 'Courier New, monospace',
                        color: '#0d47a1'
                      }}>
                        {ADMIN_SEED.email}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ADMIN_SEED.email, "matric")}
                      style={{
                        background: 'none',
                        border: '1px solid #bbdefb',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaCopy style={{ color: '#2196f3' }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>Admin Matric:</p>
                      <code style={{
                        background: '#bbdefb',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontFamily: 'Courier New, monospace',
                        color: '#0d47a1'
                      }}>
                        {ADMIN_SEED.matricNumber}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ADMIN_SEED.matricNumber, "matric")}
                      style={{
                        background: 'none',
                        border: '1px solid #bbdefb',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FaCopy style={{ color: '#2196f3' }} />
                    </button>
                  </div>
                  <button
                    onClick={handleQuickAdminLogin}
                    style={{
                      width: '100%',
                      background: '#2196f3',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '16px',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.3s ease',
                      marginTop: '16px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#1976d2'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#2196f3'}
                  >
                    <FaCrown style={{ display: 'inline', marginRight: '8px' }} />
                    Login as Administrator
                  </button>
                </div>
              </div>
            )}
          </div>

          <nav>
            <button
              onClick={() => setActiveForm("login")}
              className={`nav-link ${activeForm === "login" ? "active" : ""}`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveForm("signup")}
              className={`nav-link ${activeForm === "signup" ? "active" : ""}`}
            >
              Sign-Up
            </button>
          </nav>

          {activeForm === "login" ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <h3>{loginRole === "admin" ? "Admin Login" : "Student Login"}</h3>
              
              <div className="input">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input">
                <FaIdCard />
                <input
                  type="text"
                  placeholder="Matric Number"
                  value={loginMatricNumber}
                  onChange={(e) => setLoginMatricNumber(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                {loginRole === "admin" ? (
                  <>
                    <FaCrown className="inline mr-2" />
                    Login as Admin
                  </>
                ) : (
                  "Login as Student"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-6">
              <h3>Student Registration</h3>
              
              <div className="input">
                <FaUser />
                <input
                  type="text"
                  placeholder="First Name *"
                  value={signupFirstName}
                  onChange={(e) => setSignupFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="input">
                <FaUser />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={signupLastName}
                  onChange={(e) => setSignupLastName(e.target.value)}
                  required
                />
              </div>

              <div className="input">
                <FaEnvelope />
                <input
                  type="email"
                  placeholder="Email *"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input">
                <FaLock />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 6 characters) *"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#555',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="select-wrapper">
                <label>Department *</label>
                <select
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  className="role-select"
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="image-upload-wrapper">
                <label>Profile Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="file-input"
                />
                {profileImage && (
                  <div className="image-preview">
                    <img src={profileImage} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="select-wrapper">
                <label>Date Started *</label>
                <input
                  type="date"
                  value={dateStarted}
                  onChange={(e) => setDateStarted(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="date-input"
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Register as Student
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;