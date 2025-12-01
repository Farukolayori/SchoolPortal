import { useState, useEffect } from "react";

// API Base URL
const API_BASE_URL = "https://portal-backend-xrww.onrender.com/api";

// Default images as placeholders
const polyimage = "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=400&fit=crop";
const defaultAvatar = "https://ui-avatars.com/api/?name=Student&size=200&background=18ab18&color=fff";

// TypeScript interfaces
interface Notification {
  message: string | JSX.Element;
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
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginMatricNumber, setLoginMatricNumber] = useState<string>("");

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState<string>("");
  const [signupLastName, setSignupLastName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupDepartment, setSignupDepartment] = useState<string>("");

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

  const showNotification = (message: string | JSX.Element, type: "success" | "error", duration: number = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Copy matric number to clipboard
  const copyToClipboard = async (matricNumber: string) => {
    try {
      await navigator.clipboard.writeText(matricNumber);
      setCopiedMatric(matricNumber);
      showNotification("Matric number copied to clipboard!", "success", 2000);
      setTimeout(() => setCopiedMatric(null), 2000);
    } catch (err) {
      console.error("Failed to copy matric number:", err);
      showNotification("Failed to copy matric number", "error");
    }
  };

  // Login handler (using email and matric number)
  const handleLogin = (e: React.FormEvent) => {
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

    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue, matricNumber: matricValue })
    })
      .then(res => res.json())
      .then(data => {
        console.log("📦 Response data:", data);
        if (data.user) {
          console.log("✅ Login successful!");
          showNotification(`Login successful! Welcome ${data.user.firstName}`, "success");
          setUser(data.user);
          setLoginEmail("");
          setLoginMatricNumber("");
        } else {
          console.error("❌ Login failed:", data.message);
          showNotification(data.message || "Invalid credentials", "error");
        }
      })
      .catch(err => {
        console.error("🚨 Login exception:", err);
        showNotification("Network error! Check if backend is running.", "error");
      });
  };

  // Signup handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupFirstName || !signupLastName || !signupEmail || !dateStarted || !signupDepartment) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    // Generate random 10-digit matric number
    const matricNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const payload = {
      firstName: signupFirstName.trim(),
      lastName: signupLastName.trim(),
      email: signupEmail.trim(),
      dateStarted,
      department: signupDepartment,
      matricNumber,
      profileImage: profileImage || undefined
    };

    console.log("📤 Sending signup payload:", payload);

    fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log("📥 Signup response:", data);
        if (data.user || data.message === "User registered successfully") {
          showNotification(
            <div style={{ textAlign: 'left' }}>
              <p style={{ marginBottom: '8px' }}>Registration successful! Your matric number has been generated.</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8f9fa',
                padding: '8px 12px',
                borderRadius: '6px',
                margin: '8px 0',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#495057' }}>Matric Number:</span>
                <span style={{
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold',
                  color: '#28a745',
                  marginRight: 'auto'
                }}>{matricNumber}</span>
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    color: '#666',
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => copyToClipboard(matricNumber)}
                  title="Copy to clipboard"
                >
                  {copiedMatric === matricNumber ? '✓' : '📋'}
                </button>
              </div>
              <p style={{ fontSize: '0.9em', color: '#dc3545', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                ⚠️ Save this number securely! You'll need it to login.
              </p>
            </div>,
            "success",
            10000
          );

          setSignupFirstName("");
          setSignupLastName("");
          setSignupEmail("");
          setSignupDepartment("");
          setProfileImage("");
          setDateStarted("");
          setActiveForm("login");
        } else {
          showNotification(data.message || "Registration failed", "error");
          console.error("Registration error:", data);
        }
      })
      .catch(err => {
        console.error("Signup exception:", err);
        showNotification("Network error! Please check your connection.", "error");
      });
  };

  // Admin add user handler
  const handleAdminAddUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addFirstName || !addLastName || !addEmail || !addDepartment || !addDateStarted) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    // Generate random 10-digit matric number
    const matricNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const payload = {
      firstName: addFirstName.trim(),
      lastName: addLastName.trim(),
      email: addEmail.trim(),
      dateStarted: addDateStarted,
      department: addDepartment,
      matricNumber,
      profileImage: addProfileImage || undefined
    };

    fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.user || data.message === "User registered successfully") {
          showNotification(
            <div style={{ textAlign: 'left' }}>
              <p style={{ marginBottom: '8px' }}>User added successfully!</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8f9fa',
                padding: '8px 12px',
                borderRadius: '6px',
                margin: '8px 0',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#495057' }}>Matric Number:</span>
                <span style={{
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold',
                  color: '#28a745',
                  marginRight: 'auto'
                }}>{matricNumber}</span>
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    color: '#666',
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => copyToClipboard(matricNumber)}
                  title="Copy to clipboard"
                >
                  {copiedMatric === matricNumber ? '✓' : '📋'}
                </button>
              </div>
              <p style={{ fontSize: '0.9em', color: '#dc3545', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                ⚠️ Share this matric number with the user!
              </p>
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
        } else {
          showNotification(data.message || "Failed to add user", "error");
        }
      })
      .catch(err => {
        console.error("Add user exception:", err);
        showNotification("Network error! Please check your connection.", "error");
      });
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

  const fetchAllUsers = () => {
    fetch(`${API_BASE_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setAllUsers(data.users);
        }
      })
      .catch(err => {
        console.error(err);
        showNotification("Failed to fetch users", "error");
      });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?._id) {
      showNotification("You cannot delete your own account!", "error");
      return;
    }

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          showNotification("User deleted successfully", "success");
          fetchAllUsers();
        } else {
          showNotification(data.message || "Failed to delete user", "error");
        }
      })
      .catch(err => {
        console.error(err);
        showNotification("Network error! Please try again.", "error");
      });
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(250deg, #18ab18, #c7c70d)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '6px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '15px'
        }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // USER ID CARD
  if (user && user.role === "user") {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(250deg, #18ab18, #c7c70d)'
      }}>
        {notification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            minWidth: '300px',
            maxWidth: '90%',
            padding: '16px 20px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            background: notification.type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'linear-gradient(135deg, #f44336, #e53935)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {notification.message}
            <span style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }} onClick={() => setNotification(null)}>
              &times;
            </span>
          </div>
        )}

        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(to bottom, #fff, #f8f8f8)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          textAlign: 'center',
          paddingBottom: '20px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #18ab18, #15951d)',
            color: 'white',
            padding: '25px 20px',
            position: 'relative',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src={polyimage} alt="School Logo" style={{
              width: '60px',
              height: '60px',
              position: 'absolute',
              top: '15px',
              left: '15px',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }} />
            <h2 style={{ margin: '8px 0 5px 0', fontSize: '22px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>Ibadan Polytechnic</h2>
            <span style={{ fontSize: '14px', opacity: 0.9, letterSpacing: '1px', textTransform: 'uppercase' }}>Student ID</span>
          </div>

          <div style={{
            display: 'flex',
            padding: '25px 20px',
            gap: '20px',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}>
            <div style={{ flexShrink: 0 }}>
              <img src={user.profileImage || defaultAvatar} alt="Avatar" style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: '3px solid #18ab18',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }} />
            </div>

            <div style={{
              textAlign: 'left',
              fontSize: '15px',
              flex: 1,
              minWidth: '200px'
            }}>
              <p style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                👤 {user.firstName} {user.lastName}
              </p>
              <p style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                ✉️ {user.email}
              </p>
              {user.matricNumber && (
                <p style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                  👤
                  <span style={{ fontWeight: 'bold' }}>Matric:</span>
                  <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}>{user.matricNumber}</span>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#007bff',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => copyToClipboard(user.matricNumber!)}
                    title="Copy matric number"
                  >
                    {copiedMatric === user.matricNumber ? '✓' : '📋'}
                  </button>
                </p>
              )}
              {user.department && (
                <p style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                  🎓 {user.department}
                </p>
              )}
              <p style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                📅 {new Date(user.dateStarted).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
            <div style={{
              width: '85%',
              maxWidth: '280px',
              height: '35px',
              background: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)',
              margin: '0 auto',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}></div>
            <button onClick={handleLogout} style={{
              width: '120px',
              marginTop: '15px',
              padding: '12px',
              border: 'none',
              background: '#18ab18',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(24, 171, 24, 0.3)'
            }}>Logout</button>
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(250deg, #18ab18, #c7c70d)'
      }}>
        {notification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            minWidth: '300px',
            maxWidth: '90%',
            padding: '16px 20px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            background: notification.type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'linear-gradient(135deg, #f44336, #e53935)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {notification.message}
            <span style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }} onClick={() => setNotification(null)}>
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
                  placeholder="First Name"
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
                  placeholder="Last Name"
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
                  placeholder="Email"
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
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div>
                  <label style={{ fontSize: '14px', color: '#666', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Date Started</label>
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

        <div style={{
          width: '100%',
          maxWidth: '1400px',
          background: 'white',
          borderRadius: '20px',
          padding: '35px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '35px',
            paddingBottom: '25px',
            borderBottom: '3px solid #e0e0e0',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <h2 style={{ fontSize: '32px', color: '#18ab18', fontWeight: '700' }}>Admin Dashboard</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAddUserModal(true)}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #18ab18, #15951d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ➕ Add User
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #f44336, #e53935)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Logout
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '25px',
            marginBottom: '45px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #18ab18, #15951d)',
              color: 'white',
              padding: '30px',
              borderRadius: '18px',
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(24, 171, 24, 0.3)'
            }}>
              <h3 style={{ fontSize: '42px', marginBottom: '10px', fontWeight: '700' }}>{allUsers.length}</h3>
              <p style={{ fontSize: '17px', opacity: 0.95, fontWeight: '500' }}>Total Users</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #18ab18, #15951d)',
              color: 'white',
              padding: '30px',
              borderRadius: '18px',
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(24, 171, 24, 0.3)'
            }}>
              <h3 style={{ fontSize: '42px', marginBottom: '10px', fontWeight: '700' }}>
                {allUsers.filter(u => u.role === "user" || u.role === "Students").length}
              </h3>
              <p style={{ fontSize: '17px', opacity: 0.95, fontWeight: '500' }}>Students</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #18ab18, #15951d)',
              color: 'white',
              padding: '30px',
              borderRadius: '18px',
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(24, 171, 24, 0.3)'
            }}>
              <h3 style={{ fontSize: '42px', marginBottom: '10px', fontWeight: '700' }}>
                {allUsers.filter(u => u.role === "admin").length}
              </h3>
              <p style={{ fontSize: '17px', opacity: 0.95, fontWeight: '500' }}>Admins</p>
            </div>
          </div>

          <div style={{
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '30px',
            borderRadius: '18px'
          }}>
            <h3 style={{ fontSize: '24px', color: '#333', marginBottom: '20px', fontWeight: '600' }}>Students by Department</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '18px'
            }}>
              {departmentCounts.map((dept) => (
                <div key={dept.name} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                  border: '2px solid transparent'
                }}>
                  <h4 style={{ fontSize: '28px', color: '#18ab18', marginBottom: '8px', fontWeight: '700' }}>{dept.count}</h4>
                  <p style={{ fontSize: '13px', color: '#666', fontWeight: '500', lineHeight: '1.4' }}>{dept.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '35px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <h3 style={{ fontSize: '24px', color: '#333', fontWeight: '600' }}>All Users</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '15px', color: '#666', fontWeight: '500' }}>Filter by Department:</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    border: '2px solid #ccc',
                    borderRadius: '10px',
                    fontSize: '15px',
                    background: 'white',
                    cursor: 'pointer',
                    minWidth: '200px'
                  }}
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              overflowX: 'auto',
              borderRadius: '15px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'white',
                minWidth: '900px'
              }}>
                <thead style={{
                  background: 'linear-gradient(135deg, #18ab18, #15951d)',
                  color: 'white'
                }}>
                  <tr>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Avatar</th>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Matric No.</th>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Department</th>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Date Started</th>
                    <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => (
                    <tr key={u._id || index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '16px 15px' }}>
                        <img src={u.profileImage || defaultAvatar} alt="Avatar" style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #18ab18'
                        }} />
                      </td>
                      <td style={{ padding: '16px 15px', fontSize: '14px', color: '#333' }}>{u.firstName} {u.lastName}</td>
                      <td style={{ padding: '16px 15px', fontSize: '14px', color: '#333' }}>{u.email}</td>
                      <td style={{ padding: '16px 15px', fontSize: '14px', color: '#333' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {u.matricNumber || "N/A"}
                          {u.matricNumber && (
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#007bff',
                                padding: '2px',
                                marginLeft: '4px'
                              }}
                              onClick={() => copyToClipboard(u.matricNumber!)}
                              title="Copy matric number"
                            >
                              {copiedMatric === u.matricNumber ? '✓' : '📋'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 15px', fontSize: '14px', color: '#333' }}>{u.department || "N/A"}</td>
                      <td style={{ padding: '16px 15px', fontSize: '14px', color: '#333' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          display: 'inline-block',
                          background: u.role === "admin" ? '#fff3e0' : '#e3f2fd',
                          color: u.role === "admin" ? '#f57c00' : '#1976d2'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 15px', fontSize: '14px', color: '#333' }}>{new Date(u.dateStarted).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 15px' }}>
                        <button
                          onClick={() => handleDeleteUser(u._id!)}
                          disabled={u._id === user?._id}
                          title={u._id === user?._id ? "Cannot delete your own account" : "Delete user"}
                          style={{
                            padding: '8px 18px',
                            background: u._id === user?._id ? '#ccc' : 'linear-gradient(135deg, #f44336, #e53935)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: u._id === user?._id ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            opacity: u._id === user?._id ? 0.5 : 1
                          }}
                        >
                          🗑️ Delete
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(250deg, #18ab18, #c7c70d)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        background: '#fff',
        padding: '40px 30px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img src={polyimage} alt="School Logo" width={70} />
        </div>

        {notification && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            fontSize: '15px',
            marginBottom: '20px',
            background: notification.type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'linear-gradient(135deg, #f44336, #e53935)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {notification.message}
            <span style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }} onClick={() => setNotification(null)}>
              &times;
            </span>
          </div>
        )}

        <nav style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: '30px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveForm("login"); }}
            style={{
              color: activeForm === 'login' ? '#18ab18' : '#444',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '8px 20px',
              borderBottom: activeForm === 'login' ? '3px solid #18ab18' : 'none'
            }}
          >
            Login
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveForm("signup"); }}
            style={{
              color: activeForm === 'signup' ? '#18ab18' : '#444',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '8px 20px',
              borderBottom: activeForm === 'signup' ? '3px solid #18ab18' : 'none'
            }}
          >
            Sign-Up
          </a>
        </nav>

        {activeForm === "login" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '0 20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '24px' }}>Log In</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '2px solid #ccc',
              padding: '10px 5px',
              gap: '10px'
            }}>
              <span style={{ color: '#555', fontSize: '18px' }}>✉️</span>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  padding: '8px',
                  fontSize: '15px',
                  background: 'transparent'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '2px solid #ccc',
              padding: '10px 5px',
              gap: '10px'
            }}>
              <span style={{ color: '#555', fontSize: '18px' }}>👤</span>
              <input
                type="text"
                placeholder="Matric Number"
                value={loginMatricNumber}
                onChange={(e) => setLoginMatricNumber(e.target.value)}
                maxLength={10}
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  padding: '8px',
                  fontSize: '15px',
                  background: 'transparent'
                }}
              />
            </div>

            <button
              onClick={handleLogin}
              style={{
                padding: '14px',
                border: 'none',
                background: '#18ab18',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(24, 171, 24, 0.3)'
              }}
            >
              Log In
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '0 20px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '24px' }}>Sign Up</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '2px solid #ccc',
              padding: '10px 5px',
              gap: '10px'
            }}>
              <span style={{ color: '#555', fontSize: '18px' }}>👤</span>
              <input
                type="text"
                placeholder="First Name"
                value={signupFirstName}
                onChange={(e) => setSignupFirstName(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  padding: '8px',
                  fontSize: '15px',
                  background: 'transparent'
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '2px solid #ccc',
              padding: '10px 5px',
              gap: '10px'
            }}>
              <span style={{ color: '#555', fontSize: '18px' }}>👤</span>
              <input
                type="text"
                placeholder="Last Name"
                value={signupLastName}
                onChange={(e) => setSignupLastName(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  padding: '8px',
                  fontSize: '15px',
                  background: 'transparent'
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '2px solid #ccc',
              padding: '10px 5px',
              gap: '10px'
            }}>
              <span style={{ color: '#555', fontSize: '18px' }}>✉️</span>
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  padding: '8px',
                  fontSize: '15px',
                  background: 'transparent'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Department *</label>
              <select
                value={signupDepartment}
                onChange={(e) => setSignupDepartment(e.target.value)}
                style={{
                  padding: '12px',
                  border: '2px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '15px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Profile Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                style={{
                  padding: '10px',
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              />
              {profileImage && (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #18ab18',
                  margin: '0 auto'
                }}>
                  <img src={profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <p style={{ margin: '-10px 0 -10px 0', fontSize: '14px', color: '#666', fontWeight: '500' }}>Date Started</p>
            <input
              type="date"
              value={dateStarted}
              onChange={(e) => setDateStarted(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                border: '2px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '15px',
                width: '100%'
              }}
            />

            <button
              onClick={handleSignUp}
              style={{
                padding: '14px',
                border: 'none',
                background: '#18ab18',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(24, 171, 24, 0.3)'
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;