import { useState, useEffect, ReactNode } from "react";
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
  message: string | ReactNode;  // Changed from JSX.Element to ReactNode
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
        <div className="flex items-center gap-2">
          <FaCheck className="text-green-300" />
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
        <div className="flex items-center gap-2">
          <FaCrown className="text-yellow-400" />
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
          <div className="flex items-center gap-2">
            <FaCheck className="text-green-300" />
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FaCheck className="text-green-300" />
              <span className="font-semibold">Registration Successful!</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Your Matric Number:</span>
                <button
                  onClick={() => copyToClipboard(data.user.matricNumber, "matric")}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Copy matric number"
                >
                  {copiedMatric === data.user.matricNumber ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaCopy className="text-gray-500" />
                  )}
                </button>
              </div>
              <code className="bg-gray-100 px-3 py-2 rounded font-mono font-bold text-green-600 text-lg block text-center">
                {data.user.matricNumber}
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-600 font-semibold bg-red-50 p-3 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FaCheck className="text-green-300" />
              <span className="font-semibold">User Added Successfully!</span>
            </div>
            
            {/* Matric Number */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Matric Number:</span>
                <button
                  onClick={() => copyToClipboard(data.user.matricNumber, "matric")}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Copy matric number"
                >
                  {copiedMatric === data.user.matricNumber ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaCopy className="text-gray-500" />
                  )}
                </button>
              </div>
              <code className="bg-gray-100 px-3 py-2 rounded font-mono font-bold text-green-600 text-lg block text-center">
                {data.user.matricNumber}
              </code>
            </div>
            
            {/* Temporary Password */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-amber-800">Temporary Password:</span>
                <button
                  onClick={() => copyToClipboard(tempPassword, "password")}
                  className="p-2 hover:bg-amber-100 rounded transition-colors"
                  title="Copy password"
                >
                  {copiedPassword === tempPassword ? (
                    <FaCheck className="text-amber-600" />
                  ) : (
                    <FaCopy className="text-amber-500" />
                  )}
                </button>
              </div>
              <code className="bg-amber-100 px-3 py-2 rounded font-mono font-bold text-amber-700 text-lg block text-center">
                {tempPassword}
              </code>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-red-600 font-semibold bg-red-50 p-3 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New User</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={addFirstName}
                  onChange={(e) => setAddFirstName(e.target.value)}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={addLastName}
                  onChange={(e) => setAddLastName(e.target.value)}
                  className="form-input"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="form-input"
                />
                <select
                  value={addDepartment}
                  onChange={(e) => setAddDepartment(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Department *</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div>
                  <label>Date Started *</label>
                  <input
                    type="date"
                    value={addDateStarted}
                    onChange={(e) => setAddDateStarted(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="form-input"
                  />
                </div>
                <div>
                  <label>Profile Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="file-input"
                  />
                  {addProfileImage && (
                    <div className="image-preview">
                      <img src={addProfileImage} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAdminAddUser}
                    className="btn-primary flex-1"
                  >
                    <FaPlus className="inline mr-2" />
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
                    className="btn-secondary flex-1"
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
              <p className="text-gray-600 mt-1">Welcome, {user.firstName} {user.lastName}</p>
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
            <img src={polyimage} alt="School Logo" />
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
          <div className="mb-8">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  setLoginRole("student");
                  setShowAdminLogin(false);
                }}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  loginRole === "student"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaGraduationCap className="inline mr-2" />
                Student Login
              </button>
              <button
                onClick={() => {
                  setLoginRole("admin");
                  setShowAdminLogin(true);
                }}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  loginRole === "admin"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaCrown className="inline mr-2" />
                Admin Login
              </button>
            </div>

            {showAdminLogin && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <FaKey className="text-blue-500 text-xl" />
                  <h4 className="text-lg font-semibold text-blue-800">Quick Admin Access</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Admin Email:</p>
                      <code className="bg-blue-100 px-3 py-1 rounded font-mono text-blue-700">
                        {ADMIN_SEED.email}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ADMIN_SEED.email, "matric")}
                      className="p-2 hover:bg-blue-100 rounded"
                    >
                      <FaCopy className="text-blue-500" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Admin Matric:</p>
                      <code className="bg-blue-100 px-3 py-1 rounded font-mono text-blue-700">
                        {ADMIN_SEED.matricNumber}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ADMIN_SEED.matricNumber, "matric")}
                      className="p-2 hover:bg-blue-100 rounded"
                    >
                      <FaCopy className="text-blue-500" />
                    </button>
                  </div>
                  <button
                    onClick={handleQuickAdminLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
                  >
                    <FaCrown className="inline mr-2" />
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
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
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