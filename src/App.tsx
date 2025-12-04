import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faEye, faCalendar, faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";

// API Base URL
const API_BASE_URL = "https://schoolportal-backend-1.onrender.com/api";

// Default images as placeholders
const polyimage = "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=400&fit=crop";
const defaultAvatar = "https://ui-avatars.com/api/?name=Student&size=200&background=18ab18&color=fff";

// TypeScript interfaces
interface Notification {
  message: string | React.ReactElement;
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

const GlobalStyles = () => (
  <style>{`
    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "Poppins", sans-serif;
      background: linear-gradient(250deg, #18ab18, #c7c70d);
      min-height: 100vh;
    }

    /* LOADING SCREEN */
    .loading-screen {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(250deg, #18ab18, #c7c70d);
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 6px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* TOAST NOTIFICATION */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 90%;
      padding: 16px 20px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      z-index: 1000;
      animation: slideInRight 0.4s ease-out, fadeIn 0.4s ease-out;
      display: flex;
      align-items: center;
      gap: 12px;
      backdrop-filter: blur(10px);
    }

    .notification.success {
      background: linear-gradient(135deg, #4caf50, #45a049);
      border-left: 5px solid #2e7d32;
    }

    .notification.error {
      background: linear-gradient(135deg, #f44336, #e53935);
      border-left: 5px solid #c62828;
    }

    .notification::before {
      content: "";
      display: inline-block;
      width: 24px;
      height: 24px;
      background-size: contain;
      flex-shrink: 0;
    }

    .notification.success::before {
      content: "✓";
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }

    .notification.error::before {
      content: "✕";
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }

    .notification .close {
      margin-left: auto;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      opacity: 0.8;
      transition: opacity 0.3s ease;
      padding: 0 5px;
      flex-shrink: 0;
    }

    .notification .close:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* CONTAINER & WRAPPER */
    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(250deg, #18ab18, #c7c70d);
    }

    .wrapper {
      width: 100%;
      max-width: 800px;
    }

    .Hero {
      background: #fff;
      padding: 40px 30px;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      position: relative;
      animation: popUp 0.6s ease;
    }

    .image {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .image img {
      width: 70px;
      height: auto;
    }

    /* NAVIGATION */
    nav {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }

    nav a {
      color: #444;
      font-weight: 600;
      text-decoration: none;
      position: relative;
      transition: color 0.3s ease;
      padding: 8px 20px;
      cursor: pointer;
    }

    nav a.active {
      color: #18ab18;
    }

    nav a::after {
      content: "";
      position: absolute;
      bottom: -12px;
      left: 0;
      width: 0;
      height: 3px;
      background: #18ab18;
      transition: width 0.3s ease;
      border-radius: 2px;
    }

    nav a.active::after,
    nav a:hover::after {
      width: 100%;
    }

    /* FORMS */
    .form-container {
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    .form-wrapper {
      display: flex;
      transition: transform 0.6s ease-in-out;
      width: 200%;
    }

    .form-wrapper.shift-right {
      transform: translateX(-50%);
    }

    .login, .sign-up {
      display: flex;
      flex-direction: column;
      gap: 18px;
      width: 50%;
      padding: 0 20px;
      transition: opacity 0.5s ease;
    }

    h3 {
      text-align: center;
      margin-bottom: 10px;
      color: #333;
      font-size: 24px;
    }

    .input {
      display: flex;
      align-items: center;
      border-bottom: 2px solid #ccc;
      padding: 10px 5px;
      gap: 10px;
      transition: border-color 0.3s ease;
    }

    .input:hover,
    .input:focus-within {
      border-bottom: 2px solid #18ab18;
    }

    .input input {
      border: none;
      outline: none;
      flex: 1;
      padding: 8px;
      font-size: 15px;
      background: transparent;
    }

    .input svg {
      color: #555;
      transition: all 0.3s ease;
      font-size: 18px;
      cursor: pointer;
    }

    .input:hover svg,
    .input:focus-within svg {
      transform: scale(1.1);
      color: #18ab18;
    }

    /* Select Dropdown */
    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .select-wrapper label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .role-select {
      padding: 12px;
      border: 2px solid #ccc;
      border-radius: 8px;
      font-size: 15px;
      background: white;
      cursor: pointer;
      transition: border-color 0.3s ease;
      font-family: "Poppins", sans-serif;
    }

    .role-select:focus {
      outline: none;
      border-color: #18ab18;
    }

    .role-select:hover {
      border-color: #18ab18;
    }

    /* Image Upload */
    .image-upload-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .image-upload-wrapper label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .file-input {
      padding: 10px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s ease;
      font-size: 14px;
    }

    .file-input:hover {
      border-color: #18ab18;
    }

    .image-preview {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #18ab18;
      margin: 0 auto;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    button {
      padding: 14px;
      border: none;
      background: #18ab18;
      color: white;
      font-weight: bold;
      font-size: 16px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(24, 171, 24, 0.3);
    }

    button:hover {
      background: #12901a;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(24, 171, 24, 0.4);
    }

    button:active {
      transform: translateY(0);
    }

    .date-input {
      border: 2px solid #ccc;
      border-radius: 8px;
      padding: 10px;
      font-size: 15px;
      transition: border-color 0.3s ease;
      width: 100%;
    }

    .date-input:focus {
      outline: none;
      border-color: #18ab18;
    }

    .login p, .sign-up p {
      margin: -10px 0 -10px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .fade-in {
      opacity: 1;
      animation: fadeIn 0.6s ease;
    }

    .fade-out {
      opacity: 0;
      pointer-events: none;
    }

    /* ID CARD */
    .id-card-real {
      width: 100%;
      max-width: 420px;
      background: linear-gradient(to bottom, #fff, #f8f8f8);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      text-align: center;
      padding-bottom: 20px;
      margin: 0 auto;
    }

    .id-card-header {
      background: linear-gradient(135deg, #18ab18, #15951d);
      color: white;
      padding: 25px 20px;
      position: relative;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .id-card-header h2 {
      margin: 8px 0 5px 0;
      font-size: 22px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .id-card-header .id-title {
      font-size: 14px;
      opacity: 0.9;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .school-logo {
      width: 60px;
      height: 60px;
      position: absolute;
      top: 15px;
      left: 15px;
      border-radius: 10px;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }

    .id-card-body {
      display: flex;
      padding: 25px 20px;
      gap: 20px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .avatar-section {
      flex-shrink: 0;
    }

    .avatar-section .avatar {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px solid #18ab18;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .details-section {
      text-align: left;
      font-size: 15px;
      flex: 1;
      min-width: 200px;
    }

    .details-section p {
      margin: 10px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #333;
      word-break: break-word;
    }

    .details-section svg {
      color: #18ab18;
      flex-shrink: 0;
    }

    .id-card-footer {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 20px;
    }

    .id-card-footer button {
      width: 120px;
      margin-top: 15px;
      padding: 12px;
    }

    .barcode {
      width: 85%;
      max-width: 280px;
      height: 35px;
      background: repeating-linear-gradient(
        90deg,
        #000,
        #000 2px,
        #fff 2px,
        #fff 4px
      );
      margin: 0 auto;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* ADMIN DASHBOARD */
    .admin-dashboard {
      width: 100%;
      max-width: 1400px;
      background: white;
      border-radius: 20px;
      padding: 35px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      animation: popUp 0.6s ease;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 35px;
      padding-bottom: 25px;
      border-bottom: 3px solid #e0e0e0;
    }

    .dashboard-header h2 {
      font-size: 32px;
      color: #18ab18;
      font-weight: 700;
    }

    .dashboard-header button {
      width: auto;
      padding: 12px 28px;
      background: linear-gradient(135deg, #f44336, #e53935);
    }

    .dashboard-header button:hover {
      background: linear-gradient(135deg, #e53935, #c62828);
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 25px;
      margin-bottom: 45px;
    }

    .stat-card {
      background: linear-gradient(135deg, #18ab18, #15951d);
      color: white;
      padding: 30px;
      border-radius: 18px;
      text-align: center;
      box-shadow: 0 6px 18px rgba(24, 171, 24, 0.3);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(24, 171, 24, 0.4);
    }

    .stat-card h3 {
      font-size: 42px;
      margin-bottom: 10px;
      color: white;
      font-weight: 700;
    }

    .stat-card p {
      font-size: 17px;
      opacity: 0.95;
      font-weight: 500;
    }

    /* Department Statistics */
    .department-stats {
      margin-bottom: 40px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 30px;
      border-radius: 18px;
    }

    .department-stats h3 {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
      text-align: left;
      font-weight: 600;
    }

    .department-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 18px;
    }

    .department-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .department-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      border-color: #18ab18;
    }

    .department-card h4 {
      font-size: 28px;
      color: #18ab18;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .department-card p {
      font-size: 13px;
      color: #666;
      font-weight: 500;
      line-height: 1.4;
    }

    .users-table-container {
      margin-top: 35px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .table-header h3 {
      font-size: 24px;
      color: #333;
      text-align: left;
      font-weight: 600;
    }

    .filter-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-section label {
      font-size: 15px;
      color: #666;
      font-weight: 500;
    }

    .department-filter {
      padding: 10px 16px;
      border: 2px solid #ccc;
      border-radius: 10px;
      font-size: 15px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: "Poppins", sans-serif;
      min-width: 200px;
    }

    .department-filter:focus {
      outline: none;
      border-color: #18ab18;
      box-shadow: 0 0 0 3px rgba(24, 171, 24, 0.1);
    }

    .department-filter:hover {
      border-color: #18ab18;
    }

    .users-table {
      overflow-x: auto;
      border-radius: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      min-width: 900px;
    }

    thead {
      background: linear-gradient(135deg, #18ab18, #15951d);
      color: white;
    }

    thead th {
      padding: 18px 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tbody tr {
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.3s ease;
    }

    tbody tr:hover {
      background: #f8f9fa;
    }

    tbody td {
      padding: 16px 15px;
      font-size: 14px;
      color: #333;
    }

    .table-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #18ab18;
    }

    .role-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      display: inline-block;
    }

    .role-badge.user,
    .role-badge.Students {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.admin {
      background: #fff3e0;
      color: #f57c00;
    }

    .delete-btn {
      padding: 8px 18px;
      background: linear-gradient(135deg, #f44336, #e53935);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 3px 8px rgba(244, 67, 54, 0.3);
    }

    .delete-btn:hover {
      background: linear-gradient(135deg, #e53935, #c62828);
      transform: translateY(-2px);
      box-shadow: 0 5px 12px rgba(244, 67, 54, 0.4);
    }

    /* Copy button styles */
    .copy-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #007bff;
      margin-left: 8px;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
      box-shadow: none;
    }

    .copy-btn:hover {
      background-color: #f8f9fa;
      color: #0056b3;
      transform: none;
    }

    .copy-btn.small {
      padding: 2px;
      margin-left: 4px;
    }

    .copy-matric-btn {
      background: none;
      border: 1px solid #ddd;
      cursor: pointer;
      color: #666;
      margin-left: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      box-shadow: none;
    }

    .copy-matric-btn:hover {
      background-color: #f8f9fa;
      border-color: #007bff;
      color: #007bff;
      transform: none;
    }

    /* Matric number display styles */
    .matric-success-message {
      text-align: left;
    }

    .matric-number-display {
      display: flex;
      align-items: center;
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 8px 0;
      border: 1px solid #e9ecef;
    }

    .matric-label {
      font-weight: bold;
      margin-right: 8px;
      color: #495057;
    }

    .matric-value {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #28a745;
      margin-right: auto;
    }

    .matric-warning {
      font-size: 0.9em;
      color: #dc3545;
      margin: 4px 0 0 0;
      font-weight: bold;
    }

    /* Matric row in ID card */
    .matric-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .matric-number {
      font-family: 'Courier New', monospace;
      font-weight: bold;
    }

    /* Matric cell in admin table */
    .matric-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes popUp {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .Hero {
        padding: 30px 20px;
        border-radius: 15px;
      }

      .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
        font-size: 14px;
        padding: 14px 16px;
      }

      .form-wrapper {
        width: 100%;
      }

      .form-wrapper.shift-right {
        transform: none;
      }

      .login, .sign-up {
        width: 100%;
        padding: 0 10px;
      }

      .login.fade-out,
      .sign-up.fade-out {
        display: none;
      }

      .id-card-body {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .details-section {
        text-align: center;
      }

      .details-section p {
        justify-content: center;
      }

      .admin-dashboard {
        padding: 20px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .dashboard-header button {
        width: 100%;
      }

      .dashboard-stats {
        grid-template-columns: 1fr;
      }

      .department-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .table-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .filter-section {
        width: 100%;
      }

      .department-filter {
        width: 100%;
      }
    }
  `}</style>
);

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeForm, setActiveForm] = useState<"login" | "signup">("login");
  const [showPasswordSignUp, setShowPasswordSignUp] = useState<boolean>(false);
  const [showPasswordForgot, setShowPasswordForgot] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [dateStarted, setDateStarted] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [copiedMatric, setCopiedMatric] = useState<string | null>(null);
  const [showForgotMatric, setShowForgotMatric] = useState<boolean>(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginMatricNumber, setLoginMatricNumber] = useState<string>("");

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState<string>("");
  const [signupLastName, setSignupLastName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [signupDepartment, setSignupDepartment] = useState<string>("");

  // Forgot Matric form state
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotPassword, setForgotPassword] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message: string | React.ReactElement, type: "success" | "error", duration: number = 3000) => {
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

  // Login handler
  const handleLogin = async () => {
    const emailValue = loginEmail.trim();
    const matricValue = loginMatricNumber.trim();

    if (!emailValue || !matricValue) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    try {
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

      const data = await res.json();

      if (res.ok && data.user) {
        showNotification(`Login successful! Welcome ${data.user.firstName}`, "success");
        setUser(data.user);
        setLoginEmail("");
        setLoginMatricNumber("");
      } else {
        showNotification(data.message || "Invalid credentials", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      showNotification("Network error! Check if backend is running.", "error");
    }
  };

  // Signup handler
  const handleSignUp = async () => {
    if (!signupFirstName || !signupLastName || !signupEmail || !signupPassword || !dateStarted || !signupDepartment) {
      showNotification("Please fill all required fields", "error");
      return;
    }

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

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(
          <div className="matric-success-message">
            <p style={{ marginBottom: '8px' }}>Registration successful! Your matric number has been generated.</p>
            <div className="matric-number-display">
              <span className="matric-label">Matric Number:</span>
              <span className="matric-value">{matricNumber}</span>
              <button 
                className="copy-matric-btn"
                onClick={() => copyToClipboard(matricNumber)}
                title="Copy to clipboard"
              >
                <FontAwesomeIcon icon={copiedMatric === matricNumber ? faCheck : faCopy} />
              </button>
            </div>
            <p className="matric-warning">
              ⚠️ Save this number securely! You'll need it to login.
            </p>
          </div>,
          "success",
          10000
        );

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
      }
    } catch (err) {
      console.error("Signup error:", err);
      showNotification("Network error! Please check your connection.", "error");
    }
  };

  // Forgot Matric Number handler
  const handleForgotMatric = async () => {
    const emailValue = forgotEmail.trim();
    const passwordValue = forgotPassword.trim();

    if (!emailValue || !passwordValue) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-matric`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email: emailValue, 
          password: passwordValue 
        })
      });

      const data = await res.json();

      if (res.ok && data.matricNumber) {
        showNotification(
          <div className="matric-success-message">
            <p style={{ marginBottom: '8px' }}>Matric number found!</p>
            <div className="matric-number-display">
              <span className="matric-label">Your Matric Number:</span>
              <span className="matric-value">{data.matricNumber}</span>
              <button 
                className="copy-matric-btn"
                onClick={() => copyToClipboard(data.matricNumber)}
                title="Copy to clipboard"
              >
                <FontAwesomeIcon icon={copiedMatric === data.matricNumber ? faCheck : faCopy} />
              </button>
            </div>
            <p className="matric-warning">
              ⚠️ Please save this number securely!
            </p>
          </div>,
          "success",
          10000
        );

        setForgotEmail("");
        setForgotPassword("");
        setShowForgotMatric(false);
      } else {
        showNotification(data.message || "Invalid credentials", "error");
      }
    } catch (err) {
      console.error("Forgot matric error:", err);
      showNotification("Network error! Check if backend is running.", "error");
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
      <>
        <GlobalStyles />
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  // USER ID CARD
  if (user && user.role === "user") {
    return (
      <>
        <GlobalStyles />
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
                  <p className="matric-row">
                    <FontAwesomeIcon icon={faUser} /> 
                    <span className="matric-label">Matric:</span>
                    <span className="matric-number">{user.matricNumber}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(user.matricNumber!)}
                      title="Copy matric number"
                    >
                      <FontAwesomeIcon icon={copiedMatric === user.matricNumber ? faCheck : faCopy} />
                    </button>
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
      </>
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
      <>
        <GlobalStyles />
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
                <h3>{allUsers.filter(u => u.role === "user" || u.role === "Students").length}</h3>
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
                        <td>
                          <div className="matric-cell">
                            {u.matricNumber || "N/A"}
                            {u.matricNumber && (
                              <button 
                                className="copy-btn small"
                                onClick={() => copyToClipboard(u.matricNumber!)}
                                title="Copy matric number"
                              >
                                <FontAwesomeIcon icon={copiedMatric === u.matricNumber ? faCheck : faCopy} />
                              </button>
                            )}
                          </div>
                        </td>
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
      </>
    );
  }

  // LOGIN / SIGNUP FORM
  return (
    <>
      <GlobalStyles />
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
                <div className={`login ${activeForm === "login" ? "fade-in" : "fade-out"}`}>
                  <h3>Log In</h3>
                  <div className="input">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
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
                      maxLength={10}
                    />
                  </div>

                  <div className="button">
                    <button onClick={handleLogin}>Log In</button>
                  </div>
                </div>

                <div className={`sign-up ${activeForm === "signup" ? "fade-in" : "fade-out"}`}>
                  <h3>Sign Up</h3>
                  <div className="input">
                    <FontAwesomeIcon icon={faUser} />
                    <input 
                      type="text" 
                      placeholder="First Name" 
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                    />
                  </div>
                  <div className="input">
                    <FontAwesomeIcon icon={faUser} />
                    <input 
                      type="text" 
                      placeholder="Last Name" 
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                    />
                  </div>
                  <div className="input">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="input">
                    <input 
                      type={showPasswordSignUp ? "text" : "password"} 
                      placeholder="Password" 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
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
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <div className="button">
                    <button onClick={handleSignUp}>Sign Up</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;